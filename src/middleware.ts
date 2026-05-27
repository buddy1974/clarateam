/**
 * Edge middleware — protects all /admin/* routes (except /admin/login).
 * Runs before every request, so individual pages don't need auth checks.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? "clarateam-admin-secret-change-me"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public admin routes — always allow
  if (pathname === "/admin/login") return NextResponse.next();

  // API routes handle their own auth internally — don't double-redirect
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
