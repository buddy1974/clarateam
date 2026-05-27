import { NextRequest, NextResponse } from "next/server";
import { db, shifts, staff } from "@/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/** Calculate decimal hours between two HH:MM strings */
function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(0, parseFloat((mins / 60).toFixed(2)));
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const from     = searchParams.get("from");
  const to       = searchParams.get("to");
  const staffId  = searchParams.get("staffId");

  const conditions = [];
  if (from)    conditions.push(gte(shifts.shiftDate, from));
  if (to)      conditions.push(lte(shifts.shiftDate, to));
  if (staffId) conditions.push(eq(shifts.staffId, parseInt(staffId)));

  const rows = conditions.length
    ? await db.select().from(shifts).where(and(...conditions)).orderBy(shifts.shiftDate, shifts.startTime)
    : await db.select().from(shifts).orderBy(desc(shifts.shiftDate));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { staffId, recipientId, clientId, shiftDate, startTime, endTime, notes } = await req.json();

  // Conflict detection: warn if staff has overlapping shift on same date
  const existing = await db
    .select()
    .from(shifts)
    .where(and(
      eq(shifts.staffId, staffId),
      eq(shifts.shiftDate, shiftDate),
      eq(shifts.status, "scheduled"),
    ));

  const newStart = startTime.replace(":", "");
  const newEnd   = endTime.replace(":", "");

  const conflict = existing.filter((s) => {
    const sStart = s.startTime.replace(":", "");
    const sEnd   = s.endTime.replace(":", "");
    return newStart < sEnd && newEnd > sStart;
  });

  const hours = calcHours(startTime, endTime);

  const [created] = await db.insert(shifts).values({
    staffId,
    recipientId: recipientId ?? null,
    clientId:    clientId ?? null,
    shiftDate,
    startTime,
    endTime,
    hours:       String(hours),
    notes:       notes ?? null,
  }).returning();

  return NextResponse.json(
    { ...created, conflict: conflict.length > 0 },
    { status: 201 }
  );
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, startTime, endTime, ...patch } = await req.json();

  // Recalculate hours if times changed
  const hoursUpdate: Record<string, unknown> = { ...patch, updatedAt: new Date() };
  if (startTime && endTime) {
    hoursUpdate.startTime = startTime;
    hoursUpdate.endTime   = endTime;
    hoursUpdate.hours     = String(calcHours(startTime, endTime));
  }

  const [updated] = await db
    .update(shifts)
    .set(hoursUpdate)
    .where(eq(shifts.id, id))
    .returning();

  return NextResponse.json(updated);
}
