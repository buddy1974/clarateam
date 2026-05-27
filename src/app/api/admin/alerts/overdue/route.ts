/**
 * POST /api/admin/alerts/overdue
 *
 * Overdue Detection Engine.
 * Scans all active medications, compares scheduled times to current time,
 * and auto-creates medication_missed alerts for any slot where:
 *   - scheduled time has passed
 *   - no medication log exists (given, missed, refused, or held)
 *   - no existing unresolved alert already covers this slot
 *
 * Call this on:
 *   - Operations page load
 *   - Future: cron job (every 15-30 min)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medications, medicationLogs, alerts, careRecipients } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { notify } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Today's date + current time ───────────────────────────────────────
  const todayDate = new Date().toLocaleDateString("en-CA");            // "YYYY-MM-DD"
  const nowTime   = new Date().toLocaleTimeString("en-GB", {           // "HH:MM"
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // ── 2. All active medications ─────────────────────────────────────────────
  const activeMeds = await db
    .select()
    .from(medications)
    .where(eq(medications.active, true));

  if (activeMeds.length === 0) {
    return NextResponse.json({ created: 0, checkedAt: nowTime });
  }

  const medIds       = activeMeds.map((m) => m.id);
  const recipientIds = [...new Set(activeMeds.map((m) => m.recipientId))];

  // ── 3. Today's existing medication logs ───────────────────────────────────
  const todayLogs = await db
    .select({ medicationId: medicationLogs.medicationId, scheduledTime: medicationLogs.scheduledTime })
    .from(medicationLogs)
    .where(and(
      inArray(medicationLogs.medicationId, medIds),
      eq(medicationLogs.logDate, todayDate),
    ));

  const loggedSlots = new Set(todayLogs.map((l) => `${l.medicationId}-${l.scheduledTime}`));

  // ── 4. Existing unresolved medication_missed alerts today ─────────────────
  const existingAlerts = await db
    .select({ message: alerts.message })
    .from(alerts)
    .where(and(
      eq(alerts.type, "medication_missed"),
      eq(alerts.resolved, false),
    ));

  const existingMessages = new Set(existingAlerts.map((a) => a.message ?? ""));

  // ── 5. Recipient name lookup ──────────────────────────────────────────────
  const recipients = recipientIds.length
    ? await db
        .select({ id: careRecipients.id, name: careRecipients.name })
        .from(careRecipients)
        .where(inArray(careRecipients.id, recipientIds))
    : [];

  const recipientMap = Object.fromEntries(recipients.map((r) => [r.id, r.name]));

  // ── 6. Detect overdue slots ───────────────────────────────────────────────
  const newAlerts: {
    type:            string;
    severity:        string;
    careRecipientId: number;
    shiftId:         null;
    message:         string;
    resolved:        false;
  }[] = [];

  const telegramQueue: { patientName: string; time: string }[] = [];

  for (const med of activeMeds) {
    for (const time of (med.times ?? [])) {
      // Only flag times that have already passed
      if (time > nowTime) continue;

      // Skip if already logged
      if (loggedSlots.has(`${med.id}-${time}`)) continue;

      const patientName  = recipientMap[med.recipientId] ?? `Patient #${med.recipientId}`;
      const message      = `Medication missed: ${med.name} at ${time} for ${patientName} (${todayDate})`;

      // Skip if identical alert already exists (idempotent)
      if (existingMessages.has(message)) continue;

      newAlerts.push({
        type:            "medication_missed",
        severity:        "high",
        careRecipientId: med.recipientId,
        shiftId:         null,
        message,
        resolved:        false,
      });

      telegramQueue.push({ patientName, time });
    }
  }

  // ── 7. Bulk insert new alerts ─────────────────────────────────────────────
  if (newAlerts.length > 0) {
    await db.insert(alerts).values(newAlerts);

    // Telegram: batch max 3 to avoid spam
    for (const { patientName, time } of telegramQueue.slice(0, 3)) {
      notify.alertMedicationMissed(patientName, time).catch(console.error);
    }

    if (telegramQueue.length > 3) {
      notify.alertMedicationMissed(
        `(+${telegramQueue.length - 3} more patients)`,
        "multiple times"
      ).catch(console.error);
    }
  }

  return NextResponse.json({
    created:    newAlerts.length,
    date:       todayDate,
    checkedAt:  nowTime,
    slotsTotal: activeMeds.reduce((n, m) => n + (m.times?.length ?? 0), 0),
  });
}
