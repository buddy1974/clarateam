/**
 * GET /api/admin/sync-inbox
 * Pulls new emails from Hostinger IMAP, upserts into the emails table,
 * and fires a Telegram notification for each new message.
 *
 * Call this on a schedule (Vercel Cron) or manually from the admin UI.
 *
 * Env vars needed:
 *   IMAP_HOST     = imap.hostinger.com
 *   IMAP_PORT     = 993
 *   IMAP_USER     = info@claracareteam.com
 *   IMAP_PASS     = <your email password>
 */
import { NextRequest, NextResponse } from "next/server";
import { db, emails } from "@/db";
import { notify } from "@/lib/telegram";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  // Allow both admin cookie auth and a secret token (for cron)
  const cronSecret = req.headers.get("x-cron-secret");
  const validCron = cronSecret === process.env.CRON_SECRET;
  if (!validCron && !await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.IMAP_PASS) {
    return NextResponse.json({ error: "IMAP not configured" }, { status: 503 });
  }

  try {
    // Dynamic import so build doesn't fail if imapflow isn't installed yet
    const { ImapFlow } = await import("imapflow");

    const client = new ImapFlow({
      host: process.env.IMAP_HOST ?? "imap.hostinger.com",
      port: parseInt(process.env.IMAP_PORT ?? "993"),
      secure: true,
      auth: {
        user: process.env.IMAP_USER ?? "info@claracareteam.com",
        pass: process.env.IMAP_PASS,
      },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let synced = 0;

    try {
      // Fetch last 50 messages
      for await (const msg of client.fetch("1:50", {
        uid: true, envelope: true, bodyStructure: true,
        bodyParts: ["text"],
      })) {
        const uid = String(msg.uid);
        const from = msg.envelope?.from?.[0]?.address ?? "unknown";
        const subject = msg.envelope?.subject ?? "";
        const receivedAt = msg.envelope?.date ? new Date(msg.envelope.date) : new Date();
        const bodyText = (msg.bodyParts?.get("text") as Buffer | undefined)?.toString("utf8")?.slice(0, 2000);

        // Auto-tag
        const subjectLower = subject.toLowerCase();
        const tag =
          subjectLower.includes("apply") || subjectLower.includes("job") || subjectLower.includes("caregiv")
            ? "applicant"
            : subjectLower.includes("care") || subjectLower.includes("help") || subjectLower.includes("need")
            ? "care_request"
            : "general";

        // Insert — onConflictDoNothing handles duplicate UIDs
        const result = await db
          .insert(emails)
          .values({ uid, sender: from as string, subject, bodyText, receivedAt, tag })
          .onConflictDoNothing()
          .returning({ id: emails.id });

        // Only notify if this was a new email (not a duplicate)
        if (result.length > 0) {
          synced++;
          await notify.newEmail(from as string, subject);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return NextResponse.json({ synced });
  } catch (err) {
    console.error("[sync-inbox]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
