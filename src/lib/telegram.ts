/**
 * Telegram notification helper.
 * Uses the Bot API via plain fetch — no extra library needed.
 *
 * Setup:
 *   1. Message @BotFather on Telegram → /newbot → copy token
 *   2. Add TELEGRAM_BOT_TOKEN to Vercel env vars
 *   3. Each admin messages the bot once to get their chat ID
 *   4. Add those chat IDs to the telegram_subs table
 *      (or seed them via TELEGRAM_CHAT_IDS env var, comma-separated)
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegram(message: string, chatIds?: string[]) {
  if (!TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set — skipping notification");
    return;
  }

  // Use provided chatIds or fall back to env var (comma-separated)
  const ids = chatIds?.length
    ? chatIds
    : (process.env.TELEGRAM_CHAT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  if (!ids.length) {
    console.warn("No Telegram chat IDs configured");
    return;
  }

  await Promise.allSettled(
    ids.map((chatId) =>
      fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      })
    )
  );
}

// ── Pre-built notification templates ─────────────────────────────────────

export const notify = {
  newApplicant: (name: string, role: string, phone: string) =>
    sendTelegram(
      `🙋 <b>New Caregiver Application</b>\n\n` +
      `<b>Name:</b> ${name}\n` +
      `<b>Role:</b> ${role}\n` +
      `<b>Phone:</b> ${phone}\n\n` +
      `<a href="https://claracareteam.com/admin/applicants">View in Admin →</a>`
    ),

  newCareRequest: (contact: string, careType: string, phone: string) =>
    sendTelegram(
      `🏥 <b>New Care Request</b>\n\n` +
      `<b>Contact:</b> ${contact}\n` +
      `<b>Care needed:</b> ${careType}\n` +
      `<b>Phone:</b> ${phone}\n\n` +
      `<a href="https://claracareteam.com/admin/requests">View in Admin →</a>`
    ),

  applicantStatusChanged: (name: string, newStatus: string) =>
    sendTelegram(
      `🔄 <b>Applicant Status Updated</b>\n\n` +
      `<b>${name}</b> → <b>${newStatus.replace(/_/g, " ").toUpperCase()}</b>\n\n` +
      `<a href="https://claracareteam.com/admin/applicants">View Pipeline →</a>`
    ),

  newEmail: (from: string, subject: string) =>
    sendTelegram(
      `📧 <b>New Email</b>\n\n` +
      `<b>From:</b> ${from}\n` +
      `<b>Subject:</b> ${subject ?? "(no subject)"}\n\n` +
      `<a href="https://claracareteam.com/admin/inbox">View Inbox →</a>`
    ),

  assignmentCreated: (caregiverName: string, clientName: string) =>
    sendTelegram(
      `✅ <b>Caregiver Assigned</b>\n\n` +
      `<b>${caregiverName}</b> assigned to <b>${clientName}</b>\n\n` +
      `<a href="https://claracareteam.com/admin/assignments">View Assignments →</a>`
    ),

  // ── Phase 4: Business events ─────────────────────────────────────────────

  invoiceGenerated: (clientName: string, invoiceNo: string, total: string) =>
    sendTelegram(
      `📄 <b>Invoice Generated</b>\n\n` +
      `<b>Client:</b> ${clientName}\n` +
      `<b>Invoice:</b> ${invoiceNo}\n` +
      `<b>Total:</b> $${total}\n\n` +
      `<a href="https://claracareteam.com/admin/billing">View Billing →</a>`
    ),

  invoicePaid: (clientName: string, invoiceNo: string, total: string) =>
    sendTelegram(
      `✅ <b>Invoice Paid</b>\n\n` +
      `<b>Client:</b> ${clientName}\n` +
      `<b>Invoice:</b> ${invoiceNo}\n` +
      `<b>Amount:</b> $${total}\n\n` +
      `<a href="https://claracareteam.com/admin/billing">View Billing →</a>`
    ),

  reportGenerated: (type: string, patientName: string, period: string) =>
    sendTelegram(
      `📊 <b>Report Generated</b>\n\n` +
      `<b>Type:</b> ${type.toUpperCase()}\n` +
      `<b>Patient:</b> ${patientName}\n` +
      `<b>Period:</b> ${period}\n\n` +
      `<a href="https://claracareteam.com/admin/reports">View Reports →</a>`
    ),

  // ── Phase 3: Operational alerts ──────────────────────────────────────────

  alertMedicationMissed: (patientName: string, time: string, staffName?: string) =>
    sendTelegram(
      `⚠️ <b>Medication Missed</b>\n\n` +
      `<b>Patient:</b> ${patientName}\n` +
      `<b>Time:</b> ${time}\n` +
      (staffName ? `<b>Caregiver:</b> ${staffName}\n` : "") +
      `\n<a href="https://claracareteam.com/admin/alerts">View Alerts →</a>`
    ),

  alertTaskSkipped: (patientName: string, taskTitle: string) =>
    sendTelegram(
      `⚠️ <b>Task Skipped</b>\n\n` +
      `<b>Patient:</b> ${patientName}\n` +
      `<b>Task:</b> ${taskTitle}\n\n` +
      `<a href="https://claracareteam.com/admin/alerts">View Alerts →</a>`
    ),

  alertShiftMissing: (patientName: string) =>
    sendTelegram(
      `🔴 <b>No Active Shift</b>\n\n` +
      `<b>${patientName}</b> has care due but no assigned shift today.\n\n` +
      `<a href="https://claracareteam.com/admin/shifts">Assign Shift →</a>`
    ),

  shiftStarted: (staffName: string, patientName: string, time: string) =>
    sendTelegram(
      `🟢 <b>Shift Started</b>\n\n` +
      `<b>Caregiver:</b> ${staffName}\n` +
      `<b>Patient:</b> ${patientName}\n` +
      `<b>Time:</b> ${time}\n\n` +
      `<a href="https://claracareteam.com/admin/operations">Operations →</a>`
    ),

  shiftCompleted: (staffName: string, patientName: string, hours: string) =>
    sendTelegram(
      `✅ <b>Shift Completed</b>\n\n` +
      `<b>Caregiver:</b> ${staffName}\n` +
      `<b>Patient:</b> ${patientName}\n` +
      `<b>Hours:</b> ${hours}h\n\n` +
      `<a href="https://claracareteam.com/admin/operations">Operations →</a>`
    ),
};
