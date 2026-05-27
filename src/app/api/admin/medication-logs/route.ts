import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicationLogs, medications, alerts, careRecipients } from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { notify } from "@/lib/telegram";

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

  const { medicationId, staffId, shiftId, scheduledTime, logDate, status, notes } = await req.json();

  // ── Accountability enforcement ────────────────────────────────────────────
  if (!shiftId) {
    return NextResponse.json(
      { error: "shiftId is required for accountability" },
      { status: 400 }
    );
  }

  // ── Resolve names for alert message ──────────────────────────────────────
  const [med] = await db
    .select({ name: medications.name, recipientId: medications.recipientId })
    .from(medications)
    .where(eq(medications.id, medicationId));

  const [recipient] = med
    ? await db.select({ name: careRecipients.name }).from(careRecipients)
        .where(eq(careRecipients.id, med.recipientId))
    : [null];

  const medName     = med?.name      ?? `Med #${medicationId}`;
  const patientName = recipient?.name ?? (med ? `Patient #${med.recipientId}` : "Unknown");

  // ── Transactional write: log + alert (atomic) ─────────────────────────────
  const isMissed = status && status !== "given";

  const created = await db.transaction(async (tx) => {
    const [log] = await tx.insert(medicationLogs).values({
      medicationId,
      staffId:        staffId  ?? null,
      shiftId:        parseInt(shiftId, 10),
      scheduledTime,
      logDate,
      status:         status   ?? "given",
      administeredAt: status === "given" ? new Date() : null,
      notes:          notes    ?? null,
    }).returning();

    if (isMissed) {
      await tx.insert(alerts).values({
        type:            "medication_missed",
        severity:        "high",
        careRecipientId: med?.recipientId ?? null,
        shiftId:         parseInt(shiftId, 10),
        message:         `${medName} ${status} for ${patientName} at ${scheduledTime} on ${logDate}`,
        resolved:        false,
      });
    }

    return log;
  });

  // ── Telegram (fire-and-forget, outside transaction) ───────────────────────
  if (isMissed) {
    notify.alertMedicationMissed(patientName, scheduledTime).catch(console.error);
  }

  return NextResponse.json(created, { status: 201 });
}
