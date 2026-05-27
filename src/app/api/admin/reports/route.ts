import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  reports, careRecipients,
  medications, medicationLogs,
  shifts, staff,
  careTasks, taskLogs,
} from "@/db/schema";
import { eq, and, gte, lte, desc, inArray } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { notify } from "@/lib/telegram";

// ── GET — list reports ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type            = searchParams.get("type");
  const careRecipientId = searchParams.get("careRecipientId");

  const conditions = [];
  if (type)            conditions.push(eq(reports.type,            type));
  if (careRecipientId) conditions.push(eq(reports.careRecipientId, parseInt(careRecipientId)));

  const rows = conditions.length
    ? await db.select().from(reports).where(and(...conditions)).orderBy(desc(reports.createdAt)).limit(100)
    : await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(100);

  // Enrich with recipient names
  const recipientIds = [...new Set(rows.map((r) => r.careRecipientId).filter((id): id is number => id !== null))];
  let nameMap: Record<number, string> = {};
  if (recipientIds.length) {
    const recs = await db
      .select({ id: careRecipients.id, name: careRecipients.name })
      .from(careRecipients)
      .where(inArray(careRecipients.id, recipientIds));
    nameMap = Object.fromEntries(recs.map((r) => [r.id, r.name]));
  }

  return NextResponse.json(rows.map((r) => ({
    ...r,
    content:       undefined,   // strip heavy content from list view
    recipientName: r.careRecipientId ? (nameMap[r.careRecipientId] ?? null) : null,
  })));
}

// ── POST — generate + save a report ──────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, careRecipientId, periodFrom, periodTo } = await req.json();

  if (!type || !periodFrom || !periodTo) {
    return NextResponse.json({ error: "type, periodFrom, periodTo required" }, { status: 400 });
  }

  const rid = careRecipientId ? parseInt(careRecipientId) : null;

  // ── Build content snapshot ────────────────────────────────────────────────
  let contentData: Record<string, unknown> = { type, periodFrom, periodTo, careRecipientId: rid };

  if (type === "mar" && rid) {
    const meds = await db.select().from(medications)
      .where(and(eq(medications.recipientId, rid), eq(medications.active, true)));

    const medIds = meds.map((m) => m.id);
    const logs = medIds.length
      ? await db.select().from(medicationLogs).where(and(
          inArray(medicationLogs.medicationId, medIds),
          gte(medicationLogs.logDate, periodFrom),
          lte(medicationLogs.logDate, periodTo),
        ))
      : [];

    contentData = { ...contentData, medications: meds, logs };
  }

  if (type === "shift") {
    const conditions = [
      gte(shifts.shiftDate, periodFrom),
      lte(shifts.shiftDate, periodTo),
    ];
    if (rid) conditions.push(eq(shifts.recipientId, rid));

    const shiftRows = await db
      .select({
        id:         shifts.id,
        shiftDate:  shifts.shiftDate,
        startTime:  shifts.startTime,
        endTime:    shifts.endTime,
        hours:      shifts.hours,
        status:     shifts.status,
        staffName:  staff.name,
        staffRole:  staff.role,
      })
      .from(shifts)
      .leftJoin(staff, eq(shifts.staffId, staff.id))
      .where(and(...conditions))
      .orderBy(shifts.shiftDate, shifts.startTime);

    contentData = { ...contentData, shifts: shiftRows };
  }

  if (type === "task" && rid) {
    const tasks = await db.select().from(careTasks)
      .where(and(eq(careTasks.careRecipientId, rid), eq(careTasks.active, true)));

    const taskIds = tasks.map((t) => t.id);
    const logs = taskIds.length
      ? await db.select().from(taskLogs).where(and(
          inArray(taskLogs.taskId, taskIds),
          gte(taskLogs.logDate, periodFrom),
          lte(taskLogs.logDate, periodTo),
        ))
      : [];

    contentData = { ...contentData, tasks, logs };
  }

  if (type === "summary" && rid) {
    // Combine all data sources
    const [meds, taskList, shiftList] = await Promise.all([
      db.select({ name: medications.name, dosage: medications.dosage }).from(medications)
        .where(and(eq(medications.recipientId, rid), eq(medications.active, true))),
      db.select({ title: careTasks.title, frequency: careTasks.frequency }).from(careTasks)
        .where(and(eq(careTasks.careRecipientId, rid), eq(careTasks.active, true))),
      db.select({ shiftDate: shifts.shiftDate, hours: shifts.hours, status: shifts.status })
        .from(shifts)
        .where(and(
          eq(shifts.recipientId, rid),
          gte(shifts.shiftDate, periodFrom),
          lte(shifts.shiftDate, periodTo),
        )),
    ]);

    const totalHours = shiftList.reduce((s, sh) => s + parseFloat(sh.hours ?? "0"), 0);
    contentData = { ...contentData, medications: meds, tasks: taskList, shifts: shiftList, totalHours };
  }

  // ── Generate AI summary (mock — wire real Claude API here) ────────────────
  const aiSummary = generateSummary(type, contentData, periodFrom, periodTo);

  // ── Save report ───────────────────────────────────────────────────────────
  const [created] = await db.insert(reports).values({
    type,
    careRecipientId: rid,
    periodFrom,
    periodTo,
    content:   JSON.stringify(contentData),
    aiSummary,
    createdBy: "admin",
  }).returning();

  // Telegram (fire-and-forget)
  if (rid) {
    const [rec] = await db.select({ name: careRecipients.name }).from(careRecipients)
      .where(eq(careRecipients.id, rid));
    notify.reportGenerated(type, rec?.name ?? `Patient #${rid}`, `${periodFrom} – ${periodTo}`)
      .catch(console.error);
  }

  return NextResponse.json(created, { status: 201 });
}

// ── PATCH — update AI summary ─────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, aiSummary } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [updated] = await db.update(reports)
    .set({ aiSummary })
    .where(eq(reports.id, id))
    .returning();

  return NextResponse.json(updated);
}

// ── Summary generator (replace with real Claude API call) ─────────────────

function generateSummary(
  type: string,
  data: Record<string, unknown>,
  from: string,
  to: string,
): string {
  const period = `${from} to ${to}`;

  if (type === "mar") {
    const meds   = (data.medications as { name: string; dosage: string }[]) ?? [];
    const logs   = (data.logs as { status: string }[]) ?? [];
    const given  = logs.filter((l) => l.status === "given").length;
    const missed = logs.filter((l) => l.status !== "given").length;
    const total  = logs.length;
    return [
      `Medication Administration Record — ${period}`,
      ``,
      `Active medications: ${meds.length}`,
      meds.map((m) => `  • ${m.name} ${m.dosage}`).join("\n"),
      ``,
      `Administration summary: ${given} given, ${missed} not given (${total} total entries)`,
      ``,
      `Compliance rate: ${total > 0 ? Math.round((given / total) * 100) : 100}%`,
    ].join("\n");
  }

  if (type === "shift") {
    const shiftList = (data.shifts as { shiftDate: string; hours: string; status: string; staffName: string | null }[]) ?? [];
    const completed = shiftList.filter((s) => s.status === "completed");
    const totalHrs  = completed.reduce((n, s) => n + parseFloat(s.hours ?? "0"), 0);
    return [
      `Shift Report — ${period}`,
      ``,
      `Total shifts: ${shiftList.length} (${completed.length} completed)`,
      `Total hours: ${totalHrs.toFixed(2)}h`,
      ``,
      `Shifts:`,
      shiftList.map((s) => `  • ${s.shiftDate} — ${s.staffName ?? "Unknown"} (${s.hours ?? "?"}h) [${s.status}]`).join("\n"),
    ].join("\n");
  }

  if (type === "task") {
    const tasks  = (data.tasks as { title: string }[]) ?? [];
    const logs   = (data.logs as { status: string; taskId: number; logDate: string }[]) ?? [];
    const done   = logs.filter((l) => l.status === "done").length;
    const skipped = logs.filter((l) => l.status === "skipped").length;
    return [
      `Task Completion Report — ${period}`,
      ``,
      `Active tasks: ${tasks.length}`,
      tasks.map((t) => `  • ${t.title}`).join("\n"),
      ``,
      `Execution summary: ${done} completed, ${skipped} skipped (${logs.length} total logs)`,
    ].join("\n");
  }

  if (type === "summary") {
    const meds  = (data.medications as { name: string }[]) ?? [];
    const tasks = (data.tasks as { title: string }[]) ?? [];
    const totalHrs = (data.totalHours as number) ?? 0;
    return [
      `Care Summary Report — ${period}`,
      ``,
      `Active medications: ${meds.length}`,
      `Active tasks: ${tasks.length}`,
      `Care hours delivered: ${totalHrs.toFixed(2)}h`,
      ``,
      `This report summarizes the care provided during the specified period.`,
      `Please review individual MAR and shift reports for detailed compliance records.`,
    ].join("\n");
  }

  return `Report generated for period ${period}.`;
}
