import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { taskLogs, careTasks, alerts, careRecipients } from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { notify } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const recipientId = searchParams.get("recipientId");
  const date        = searchParams.get("date");
  const taskId      = searchParams.get("taskId");

  if (recipientId) {
    const tasks = await db.select({ id: careTasks.id }).from(careTasks)
      .where(eq(careTasks.careRecipientId, parseInt(recipientId, 10)));

    if (tasks.length === 0) return NextResponse.json([]);

    const taskIds = tasks.map((t) => t.id);
    const conditions = [inArray(taskLogs.taskId, taskIds)];
    if (date) conditions.push(eq(taskLogs.logDate, date));

    const rows = await db.select().from(taskLogs)
      .where(and(...conditions))
      .orderBy(desc(taskLogs.createdAt));

    return NextResponse.json(rows);
  }

  const conditions = [];
  if (taskId) conditions.push(eq(taskLogs.taskId, parseInt(taskId, 10)));
  if (date)   conditions.push(eq(taskLogs.logDate, date));

  const rows = conditions.length
    ? await db.select().from(taskLogs).where(and(...conditions)).orderBy(desc(taskLogs.createdAt))
    : await db.select().from(taskLogs).orderBy(desc(taskLogs.createdAt)).limit(50);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId, careRecipientId, staffId, shiftId, status, notes, logDate } = await req.json();

  if (!taskId || !careRecipientId || !logDate) {
    return NextResponse.json({ error: "taskId, careRecipientId, logDate required" }, { status: 400 });
  }

  // ── Accountability enforcement ────────────────────────────────────────────
  if (!shiftId) {
    return NextResponse.json(
      { error: "shiftId is required for accountability" },
      { status: 400 }
    );
  }

  // ── Resolve names for alert message ──────────────────────────────────────
  const [task]      = await db.select({ title: careTasks.title }).from(careTasks)
    .where(eq(careTasks.id, parseInt(taskId, 10)));
  const [recipient] = await db.select({ name: careRecipients.name }).from(careRecipients)
    .where(eq(careRecipients.id, parseInt(careRecipientId, 10)));

  const taskTitle   = task?.title     ?? `Task #${taskId}`;
  const patientName = recipient?.name ?? `Patient #${careRecipientId}`;

  // ── Transactional write: log + alert (atomic) ─────────────────────────────
  const created = await db.transaction(async (tx) => {
    const [log] = await tx.insert(taskLogs).values({
      taskId:          parseInt(taskId, 10),
      careRecipientId: parseInt(careRecipientId, 10),
      staffId:         staffId ?? null,
      shiftId:         parseInt(shiftId, 10),
      status:          status  ?? "done",
      notes:           notes   ?? null,
      logDate,
    }).returning();

    if (status === "skipped") {
      await tx.insert(alerts).values({
        type:            "task_skipped",
        severity:        "medium",
        careRecipientId: parseInt(careRecipientId, 10),
        shiftId:         parseInt(shiftId, 10),
        message:         `Task "${taskTitle}" skipped for ${patientName} on ${logDate}`,
        resolved:        false,
      });
    }

    return log;
  });

  // ── Telegram (fire-and-forget, outside transaction) ───────────────────────
  if (status === "skipped") {
    notify.alertTaskSkipped(patientName, taskTitle).catch(console.error);
  }

  return NextResponse.json(created, { status: 201 });
}
