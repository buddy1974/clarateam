import { NextResponse } from "next/server";
import { db, adminUsers } from "@/db";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/roster — PUBLIC (pre-auth).
 * Returns only the login handle + display label for ACTIVE admins, so the
 * login dropdown is driven by the admin_users table instead of a hardcoded
 * list. Deliberately exposes NO secrets and NO roles — just what the
 * selector needs. Adding/removing an admin is now a DB-only operation.
 *
 * Reachable without a session: middleware skips all /api/* paths.
 */
export async function GET() {
  try {
    const rows = await db
      .select({ handle: adminUsers.name, label: adminUsers.displayName })
      .from(adminUsers)
      .where(eq(adminUsers.active, true))
      .orderBy(asc(adminUsers.id));

    return NextResponse.json(rows);
  } catch {
    // Never break the login page if the DB is briefly unreachable.
    return NextResponse.json([], { status: 200 });
  }
}
