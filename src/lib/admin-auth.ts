/**
 * Multi-user TOTP admin auth.
 * JWT carries userId, userName (display), and userRole.
 * ADMIN_SECRET must be set in Vercel env vars (32+ char random string).
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? "clarateam-admin-secret-change-me"
);

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
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
