/**
 * Edge middleware — protects all /admin/* routes (except /admin/login).
 * Runs before every request, so individual pages don't need auth checks.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Lazily resolve & validate ADMIN_SECRET on first request — NOT at module
// load. A module-scope throw runs during `next build` and breaks it.
let _secret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (_secret) return _secret;
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || adminSecret.length < 32) {
    throw new Error("ADMIN_SECRET env var must be set and at least 32 characters.");
  }
  return (_secret = new TextEncoder().encode(adminSecret));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public admin routes — always allow
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/admin/setup-totp") return NextResponse.next();

  // API routes handle their own auth internally — don't double-redirect
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
