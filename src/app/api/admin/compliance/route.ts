/**
 * GET /api/admin/compliance?type=mar&recipientId=X&from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns structured data for compliance reports:
 *   type=mar  → Medication Administration Record grid
 *   type=shift → Shift log with staff/hours
 *   type=task  → Task execution log
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  medications, medicationLogs, careRecipients,
  shifts, staff, careTasks, taskLogs,
} from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type        = searchParams.get("type") ?? "mar";
  const recipientId = searchParams.get("recipientId");
  const from        = searchParams.get("from");
  const to          = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to dates required" }, { status: 400 });
  }

  // ── Build date array for the range ───────────────────────────────────────
  const dates: string[] = [];
  const cur = new Date(from + "T12:00:00");
  const end = new Date(to   + "T12:00:00");
  while (cur <= end) {
    dates.push(cur.toLocaleDateString("en-CA"));
    cur.setDate(cur.getDate() + 1);
  }

  // ── MAR ──────────────────────────────────────────────────────────────────
  if (type === "mar" && recipientId) {
    const rid = parseInt(recipientId);

    const [recipient, meds] = await Promise.all([
      db.select({ id: careRecipients.id, name: careRecipients.name, dateOfBirth: careRecipients.dateOfBirth })
        .from(careRecipients).where(eq(careRecipients.id, rid)).then((r) => r[0] ?? null),
      db.select().from(medications)
        .where(and(eq(medications.recipientId, rid), eq(medications.active, true))),
    ]);

    const medIds = meds.map((m) => m.id);
    const logs = medIds.length
      ? await db.select().from(medicationLogs).where(and(
          inArray(medicationLogs.medicationId, medIds),
          gte(medicationLogs.logDate, from),
          lte(medicationLogs.logDate, to),
        ))
      : [];

    // Build MAR grid: med × time × date → status
    const grid = meds.map((med) => ({
      medication: med,
      rows: (med.times ?? []).map((time) => ({
        time,
        cells: dates.map((date) => {
          const log = logs.find((l) => l.medicationId === med.id && l.scheduledTime === time && l.logDate === date);
          return { date, status: log?.status ?? null, logId: log?.id ?? null };
        }),
      })),
    }));

    return NextResponse.json({ type: "mar", recipient, dates, grid, from, to });
  }

  // ── Shift log ─────────────────────────────────────────────────────────────
  if (type === "shift") {
    const conditions = [gte(shifts.shiftDate, from), lte(shifts.shiftDate, to)];
    if (recipientId) conditions.push(eq(shifts.recipientId, parseInt(recipientId)));

    const shiftRows = await db
      .select({
        id:         shifts.id,
        shiftDate:  shifts.shiftDate,
        startTime:  shifts.startTime,
        endTime:    shifts.endTime,
        hours:      shifts.hours,
        status:     shifts.status,
        notes:      shifts.notes,
        staffName:  staff.name,
        staffRole:  staff.role,
      })
      .from(shifts)
      .leftJoin(staff, eq(shifts.staffId, staff.id))
      .where(and(...conditions))
      .orderBy(shifts.shiftDate, shifts.startTime);

    const totalHours = shiftRows.reduce((n, s) => n + parseFloat(s.hours ?? "0"), 0);

    return NextResponse.json({ type: "shift", shifts: shiftRows, totalHours, from, to });
  }

  // ── Task log ──────────────────────────────────────────────────────────────
  if (type === "task" && recipientId) {
    const rid   = parseInt(recipientId);
    const tasks = await db.select().from(careTasks)
      .where(and(eq(careTasks.careRecipientId, rid), eq(careTasks.active, true)));

    const taskIds = tasks.map((t) => t.id);
    const logs = taskIds.length
      ? await db.select().from(taskLogs).where(and(
          inArray(taskLogs.taskId, taskIds),
          gte(taskLogs.logDate, from),
          lte(taskLogs.logDate, to),
        ))
      : [];

    const grid = tasks.map((task) => ({
      task,
      cells: dates.map((date) => {
        const log = logs.find((l) => l.taskId === task.id && l.logDate === date);
        return { date, status: log?.status ?? null };
      }),
    }));

    const [recipient] = await db.select({ name: careRecipients.name })
      .from(careRecipients).where(eq(careRecipients.id, rid));

    return NextResponse.json({ type: "task", recipient, grid, dates, from, to });
  }

  return NextResponse.json({ error: "type must be mar, shift, or task" }, { status: 400 });
}
