/**
 * Multi-user TOTP admin auth.
 * JWT carries userId, userName (display), and userRole.
 * ADMIN_SECRET must be set in Vercel env vars (32+ char random string).
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Lazily resolve & validate ADMIN_SECRET on first use — NOT at module load.
 * Throwing at module scope runs during `next build` (page-data collection),
 * which breaks the build even though no request is being served. Lazy
 * resolution keeps the runtime guard intact while decoupling it from build.
 */
let _secret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (_secret) return _secret;
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || adminSecret.length < 32) {
    throw new Error("ADMIN_SECRET env var must be set and at least 32 characters.");
  }
  return (_secret = new TextEncoder().encode(adminSecret));
}

export interface AdminTokenPayload {
  userId:      number;
  userName:    string;  // display name, e.g. "Kevin James Dean"
  userRole:    string;  // "super_admin" | "administrator"
  userHandle:  string;  // login handle, e.g. "kevin"
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** Backward-compat helper — still used by middleware and server components */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}
