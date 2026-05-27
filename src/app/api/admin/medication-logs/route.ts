import { NextRequest, NextResponse } from "next/server";
import { db, medicationLogs, medications } from "@/db";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const medicationId = searchParams.get("medicationId");
  const recipientId  = searchParams.get("recipientId");
  const date         = searchParams.get("date");
  const from         = searchParams.get("from");
  const to           = searchParams.get("to");

  // If filtering by recipientId, first resolve medication IDs for that recipient
  if (recipientId) {
    const meds = await db
      .select({ id: medications.id })
      .from(medications)
      .where(eq(medications.recipientId, parseInt(recipientId)));

    if (meds.length === 0) return NextResponse.json([]);

    const medIds = meds.map((m) => m.id);
    const conditions = [inArray(medicationLogs.medicationId, medIds)];

    if (date) conditions.push(eq(medicationLogs.logDate, date));
    if (from) conditions.push(gte(medicationLogs.logDate, from));
    if (to)   conditions.push(lte(medicationLogs.logDate, to));

    const rows = await db
      .select()
      .from(medicationLogs)
      .where(and(...conditions))
      .orderBy(medicationLogs.logDate, medicationLogs.scheduledTime);

    return NextResponse.json(rows);
  }

  const conditions = [];
  if (medicationId) conditions.push(eq(medicationLogs.medicationId, parseInt(medicationId)));
  if (date)         conditions.push(eq(medicationLogs.logDate, date));
  if (from)         conditions.push(gte(medicationLogs.logDate, from));
  if (to)           conditions.push(lte(medicationLogs.logDate, to));

  const rows = conditions.length
    ? await db.select().from(medicationLogs).where(and(...conditions))
        .orderBy(medicationLogs.logDate, medicationLogs.scheduledTime)
    : await db.select().from(medicationLogs)
        .orderBy(medicationLogs.logDate, medicationLogs.scheduledTime);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { medicationId, staffId, scheduledTime, logDate, status, notes } = await req.json();

  const [created] = await db.insert(medicationLogs).values({
    medicationId,
    staffId:       staffId ?? null,
    scheduledTime,
    logDate,
    status:        status ?? "given",
    administeredAt: status === "given" ? new Date() : null,
    notes:         notes ?? null,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
