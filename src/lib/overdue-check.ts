/**
 * Shared overdue-medication detection logic.
 * Called by both /api/cron/overdue-check (unauthenticated, secret-gated)
 * and /api/admin/alerts/overdue (authenticated admin route).
 */
import { db } from "@/db";
import { medications, medicationLogs, alerts, careRecipients } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { notify } from "@/lib/telegram";

export async function runOverdueCheck() {
  const todayDate = new Date().toLocaleDateString("en-CA");       // "YYYY-MM-DD"
  const nowTime   = new Date().toLocaleTimeString("en-GB", {      // "HH:MM"
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  const activeMeds = await db
    .select()
    .from(medications)
    .where(eq(medications.active, true));

  if (activeMeds.length === 0) return { created: 0, checkedAt: nowTime };

  const medIds       = activeMeds.map((m) => m.id);
  const recipientIds = [...new Set(activeMeds.map((m) => m.recipientId))];

  const todayLogs = await db
    .select({ medicationId: medicationLogs.medicationId, scheduledTime: medicationLogs.scheduledTime })
    .from(medicationLogs)
    .where(and(inArray(medicationLogs.medicationId, medIds), eq(medicationLogs.logDate, todayDate)));

  const loggedSlots = new Set(todayLogs.map((l) => `${l.medicationId}-${l.scheduledTime}`));

  const existingAlerts = await db
    .select({ message: alerts.message })
    .from(alerts)
    .where(and(eq(alerts.type, "medication_missed"), eq(alerts.resolved, false)));

  const existingMessages = new Set(existingAlerts.map((a) => a.message ?? ""));

  const recipients = recipientIds.length
    ? await db
        .select({ id: careRecipients.id, name: careRecipients.name })
        .from(careRecipients)
        .where(inArray(careRecipients.id, recipientIds))
    : [];

  const recipientMap = Object.fromEntries(recipients.map((r) => [r.id, r.name]));

  const newAlerts: {
    type: string; severity: string; careRecipientId: number;
    shiftId: null; message: string; resolved: false;
  }[] = [];
  const telegramQueue: { patientName: string; time: string }[] = [];

  for (const med of activeMeds) {
    for (const time of (med.times ?? [])) {
      if (time > nowTime) continue;
      if (loggedSlots.has(`${med.id}-${time}`)) continue;

      const patientName = recipientMap[med.recipientId] ?? `Patient #${med.recipientId}`;
      const message     = `Medication missed: ${med.name} at ${time} for ${patientName} (${todayDate})`;

      if (existingMessages.has(message)) continue;

      newAlerts.push({ type: "medication_missed", severity: "high",
        careRecipientId: med.recipientId, shiftId: null, message, resolved: false });
      telegramQueue.push({ patientName, time });
    }
  }

  if (newAlerts.length > 0) {
    await db.insert(alerts).values(newAlerts);

    for (const { patientName, time } of telegramQueue.slice(0, 3)) {
      notify.alertMedicationMissed(patientName, time).catch(console.error);
    }
    if (telegramQueue.length > 3) {
      notify.alertMedicationMissed(`(+${telegramQueue.length - 3} more patients)`, "multiple times").catch(console.error);
    }
  }

  return {
    created:    newAlerts.length,
    date:       todayDate,
    checkedAt:  nowTime,
    slotsTotal: activeMeds.reduce((n, m) => n + (m.times?.length ?? 0), 0),
  };
}
