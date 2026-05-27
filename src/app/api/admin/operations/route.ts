import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  shifts, staff, careRecipients, careTasks, taskLogs,
  medications, medicationLogs, alerts,
} from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = req.nextUrl.searchParams.get("date")
    ?? new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  // ── 1. Today's shifts ────────────────────────────────────────────────────
  const todayShifts = await db.select().from(shifts)
    .where(eq(shifts.shiftDate, today))
    .orderBy(shifts.startTime);

  // ── 2. Collect unique staff + recipient IDs ───────────────────────────────
  const staffIds     = [...new Set(todayShifts.map((s) => s.staffId))];
  const recipientIds = [
    ...new Set(todayShifts.map((s) => s.recipientId).filter((id): id is number => id !== null))
  ];

  // ── 3. Batch-load related data ───────────────────────────────────────────
  const [staffList, recipients, taskList, medList] = await Promise.all([
    staffIds.length
      ? db.select({ id: staff.id, name: staff.name, role: staff.role })
          .from(staff).where(inArray(staff.id, staffIds))
      : Promise.resolve([]),

    recipientIds.length
      ? db.select().from(careRecipients).where(inArray(careRecipients.id, recipientIds))
      : Promise.resolve([]),

    recipientIds.length
      ? db.select().from(careTasks).where(
          and(inArray(careTasks.careRecipientId, recipientIds), eq(careTasks.active, true))
        )
      : Promise.resolve([]),

    recipientIds.length
      ? db.select().from(medications).where(
          and(inArray(medications.recipientId, recipientIds), eq(medications.active, true))
        )
      : Promise.resolve([]),
  ]);

  // ── 4. Today's logs ──────────────────────────────────────────────────────
  const taskIds = taskList.map((t) => t.id);
  const medIds  = medList.map((m) => m.id);

  const [taskLogRows, medLogRows] = await Promise.all([
    taskIds.length
      ? db.select().from(taskLogs).where(
          and(inArray(taskLogs.taskId, taskIds), eq(taskLogs.logDate, today))
        )
      : Promise.resolve([]),

    medIds.length
      ? db.select().from(medicationLogs).where(
          and(inArray(medicationLogs.medicationId, medIds), eq(medicationLogs.logDate, today))
        )
      : Promise.resolve([]),
  ]);

  // ── 5. Unresolved alerts count ───────────────────────────────────────────
  const unresolvedAlerts = await db.select().from(alerts)
    .where(eq(alerts.resolved, false))
    .orderBy(desc(alerts.createdAt))
    .limit(10);

  // ── 6. Recipients active today but with no shift ─────────────────────────
  // Get all active recipients that have tasks or meds
  const recipientsWithCare = [...new Set([
    ...taskList.map((t) => t.careRecipientId),
    ...medList.map((m)  => m.recipientId),
  ])];
  const recipientsInShifts = new Set(recipientIds);
  const recipientsNoShift  = recipientsWithCare.filter((id) => !recipientsInShifts.has(id));

  // ── 7. Assemble enriched shifts ──────────────────────────────────────────
  const staffMap     = Object.fromEntries(staffList.map((s) => [s.id, s]));
  const recipientMap = Object.fromEntries(recipients.map((r) => [r.id, r]));

  const enrichedShifts = todayShifts.map((shift) => {
    const recipient = shift.recipientId ? recipientMap[shift.recipientId] : null;

    const recipientTasks = recipient
      ? taskList.filter((t) => t.careRecipientId === recipient.id)
      : [];

    const recipientMeds = recipient
      ? medList.filter((m) => m.recipientId === recipient.id)
      : [];

    const tasksDone    = recipientTasks.filter((t) => taskLogRows.some((l) => l.taskId === t.id && l.status === "done")).length;
    const tasksSkipped = recipientTasks.filter((t) => taskLogRows.some((l) => l.taskId === t.id && l.status === "skipped")).length;
    const tasksPending = recipientTasks.length - tasksDone - tasksSkipped;

    const medSlots = recipientMeds.flatMap((med) =>
      (med.times ?? []).map((time) => ({
        medId: med.id,
        name:  med.name,
        dosage: med.dosage,
        time,
        log: medLogRows.find((l) => l.medicationId === med.id && l.scheduledTime === time) ?? null,
      }))
    ).sort((a, b) => a.time.localeCompare(b.time));

    const medsGiven   = medSlots.filter((s) => s.log?.status === "given").length;
    const medsMissed  = medSlots.filter((s) => s.log && s.log.status !== "given").length;
    const medsPending = medSlots.filter((s) => !s.log).length;

    return {
      ...shift,
      staffMember: staffMap[shift.staffId] ?? null,
      recipient:   recipient ?? null,
      tasks: {
        total:   recipientTasks.length,
        done:    tasksDone,
        skipped: tasksSkipped,
        pending: tasksPending,
        items:   recipientTasks.map((t) => ({
          ...t,
          log: taskLogRows.find((l) => l.taskId === t.id) ?? null,
        })),
      },
      medications: {
        total:   medSlots.length,
        given:   medsGiven,
        missed:  medsMissed,
        pending: medsPending,
        items:   medSlots,
      },
    };
  });

  // ── 8. Summary stats ─────────────────────────────────────────────────────
  const allTasks = enrichedShifts.flatMap((s) => s.tasks.items);
  const allMeds  = enrichedShifts.flatMap((s) => s.medications.items);

  const stats = {
    totalShifts:   todayShifts.length,
    activeShifts:  todayShifts.filter((s) => s.status === "active").length,
    totalPatients: recipientIds.length,
    tasksDone:     enrichedShifts.reduce((n, s) => n + s.tasks.done, 0),
    tasksPending:  enrichedShifts.reduce((n, s) => n + s.tasks.pending, 0),
    medsGiven:     enrichedShifts.reduce((n, s) => n + s.medications.given, 0),
    medsPending:   enrichedShifts.reduce((n, s) => n + s.medications.pending, 0),
    unresolvedAlerts: unresolvedAlerts.length,
  };

  return NextResponse.json({
    date: today,
    stats,
    shifts: enrichedShifts,
    alerts: unresolvedAlerts,
    recipientsNoShift,
  });
}
