import { NextRequest, NextResponse } from "next/server";
import { db, careRequests, applicants, assignments } from "@/db";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(careRequests).orderBy(careRequests.createdAt);
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status, notes, assignedTo } = await req.json();

  const [updated] = await db
    .update(careRequests)
    .set({ status, notes, assignedTo, updatedAt: new Date() })
    .where(eq(careRequests.id, id))
    .returning();

  // If assigning a caregiver, create assignment record + notify
  if (assignedTo) {
    const [caregiver] = await db
      .select({ name: applicants.name })
      .from(applicants)
      .where(eq(applicants.id, assignedTo));

    await db.insert(assignments).values({
      applicantId: assignedTo,
      careRequestId: id,
    });

    const { notify } = await import("@/lib/telegram");
    await notify.assignmentCreated(
      caregiver?.name ?? "Unknown",
      updated.facilityName ?? updated.contactName
    );
  }

  return NextResponse.json(updated);
}
