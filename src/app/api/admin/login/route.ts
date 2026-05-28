import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { signAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const secret = process.env.TOTP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "TOTP not configured" }, { status: 500 });
  }

  const isValid = authenticator.verify({ token: String(code).trim(), secret });
  if (!isValid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = await signAdminToken();
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
