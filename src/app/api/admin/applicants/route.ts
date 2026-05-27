import { NextRequest, NextResponse } from "next/server";
import { db, applicants } from "@/db";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(applicants).orderBy(applicants.createdAt);
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status, notes } = await req.json();
  const [updated] = await db
    .update(applicants)
    .set({ status, notes, updatedAt: new Date() })
    .where(eq(applicants.id, id))
    .returning();

  // Notify on status change
  if (status) {
    const { notify } = await import("@/lib/telegram");
    await notify.applicantStatusChanged(updated.name, status);
  }

  return NextResponse.json(updated);
}
