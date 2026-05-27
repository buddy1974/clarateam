import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const correct = process.env.ADMIN_PIN ?? "clara2025";

  if (pin !== correct) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
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
