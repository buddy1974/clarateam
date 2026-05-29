import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { db, adminUsers } from "@/db";
import { eq } from "drizzle-orm";
import { signAdminToken } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: max 5 login attempts per IP per 15 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = rateLimit(`login:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const { handle, code } = await req.json();

  if (!handle || !code) {
    return NextResponse.json({ error: "Missing handle or code" }, { status: 400 });
  }

  // Look up the user by their login handle
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.name, String(handle).trim().toLowerCase()))
    .limit(1);

  if (!user || !user.active) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Tolerate +/-1 time step (30s) of clock skew between the user's phone
  // and the server. Default window is 0 (exact step only), which rejects
  // valid codes when clocks drift even slightly.
  authenticator.options = { window: 1 };

  // Verify the TOTP code against THIS user's personal secret
  const isValid = authenticator.verify({
    token: String(code).trim(),
    secret: user.totpSecret,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  // Stamp last_login (fire-and-forget — don't block the response)
  db.update(adminUsers)
    .set({ lastLogin: new Date() })
    .where(eq(adminUsers.id, user.id))
    .catch(() => {});

  const token = await signAdminToken({
    userId:     user.id,
    userName:   user.displayName,
    userRole:   user.role,
    userHandle: user.name,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}

// Logout — clears the session cookie
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
