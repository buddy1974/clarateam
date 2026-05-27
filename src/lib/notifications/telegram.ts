/**
 * Phase 1 — Typed notification dispatcher
 *
 * Persists to DB notifications table AND fires Telegram.
 * Always fire-and-forget — never blocks or throws to caller.
 */

import { sendTelegram } from "@/lib/telegram";
import { db } from "@/db";
import { notifications } from "@/db/schema";

interface NotifyPayload {
  title:     string;
  message:   string;
  type?:     "info" | "action" | "alert";
  entityId?: number;
  urgent?:   boolean;
}

/** Persist to DB + send Telegram. Never throws. */
export async function dispatchNotification(payload: NotifyPayload): Promise<void> {
  const { title, message, type = "info", entityId, urgent = false } = payload;

  // 1. Persist to notifications table
  try {
    await db.insert(notifications).values({
      type,
      message: `${title}\n${message}`,
      status: "unread",
      relatedId: entityId ?? null,
    });
  } catch (err) {
    console.error("[notifications] DB insert failed:", err);
  }

  // 2. Send Telegram (fire-and-forget, isolated failure)
  const icon = urgent ? "🚨" : type === "alert" ? "⚠️" : type === "action" ? "✅" : "📋";
  void sendTelegram(
    `${icon} <b>${title}</b>\n\n${message}\n\n` +
    `<a href="https://claracareteam.com/admin/drafts">Review in Admin →</a>`
  ).catch((err) => console.error("[telegram] send failed:", err));
}

// ── Pre-built draft pipeline templates ───────────────────────────────────

export const draftNotify = {

  created: (draftId: number, type: string) =>
    dispatchNotification({
      title:    "📥 New Draft Created",
      message:  `Type: ${type}\nDraft ID: #${draftId}`,
      type:     "info",
      entityId: draftId,
    }),

  pending: (draftId: number, patientName: string) =>
    dispatchNotification({
      title:    "⏳ Draft Ready for Review",
      message:  `Patient: ${patientName}\nAwaiting validator approval.`,
      type:     "action",
      entityId: draftId,
    }),

  approved: (draftId: number, patientName: string) =>
    dispatchNotification({
      title:    "✅ Draft Approved — Record Created",
      message:  `Patient: ${patientName}\nCare record is now live.`,
      type:     "info",
      entityId: draftId,
    }),

  rejected: (draftId: number, reason?: string) =>
    dispatchNotification({
      title:    "❌ Draft Rejected",
      message:  `Draft #${draftId} was rejected.${reason ? `\nReason: ${reason}` : ""}`,
      type:     "alert",
      entityId: draftId,
    }),

  urgentIntake: (name: string, careType: string) =>
    dispatchNotification({
      title:   "🚨 URGENT CARE REQUEST",
      message: `Name: ${name}\nNeed: Today\nType: ${careType}\n\n→ Review immediately`,
      type:    "alert",
      urgent:  true,
    }),
};
