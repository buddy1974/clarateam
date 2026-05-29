/**
 * POST /api/cron/overdue-check
 *
 * Scheduled overdue medication detection.
 * Configure in Vercel Dashboard → Cron Jobs → every 30 min:
 *   Schedule: *\/30 * * * *
 *   Path: /api/cron/overdue-check
 *
 * Requires Vercel Pro plan for cron jobs.
 * Can also be triggered manually from /admin/operations page.
 */

/**
 * Vercel cron — runs every 30 min via vercel.json.
 * Authenticated by CRON_SECRET (set in Vercel env vars).
 * Directly runs the overdue detection logic (no internal HTTP call).
 */
import { NextRequest, NextResponse } from "next/server";
import { runOverdueCheck } from "@/lib/overdue-check";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Default-deny when secret is not configured
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 401 });
  }

  // Vercel sends the secret as Authorization: Bearer <secret>
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runOverdueCheck();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/overdue-check]", err);
    return NextResponse.json({ error: "Cron check failed" }, { status: 500 });
  }
}
