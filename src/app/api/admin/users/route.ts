import { NextRequest, NextResponse } from "next/server";
import { db, adminUsers } from "@/db";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET — list all admin users (super_admin only)
export async function GET() {
  const session = await getAdminSession();
  if (!session || session.userRole !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      id:          adminUsers.id,
      name:        adminUsers.name,
      displayName: adminUsers.displayName,
      role:        adminUsers.role,
      active:      adminUsers.active,
      lastLogin:   adminUsers.lastLogin,
      createdAt:   adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(adminUsers.id);

  return NextResponse.json(rows);
}

// PATCH — update active/role for a user (super_admin only)
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.userRole !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, active, role } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Partial<{ active: boolean; role: string }> = {};
  if (typeof active === "boolean") updates.active = active;
  if (typeof role   === "string")  updates.role   = role;

  const [updated] = await db
    .update(adminUsers)
    .set(updates)
    .where(eq(adminUsers.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}
