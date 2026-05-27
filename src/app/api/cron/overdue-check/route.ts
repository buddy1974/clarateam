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

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Verify this is a Vercel cron request or an admin call
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delegate to the overdue detection endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/alerts/overdue`, {
      method: "POST",
      headers: {
        // Pass admin cookie through (cron runs in same origin context)
        "x-cron-trigger": "true",
      },
    });

    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("Cron overdue check failed:", err);
    return NextResponse.json({ error: "Cron check failed" }, { status: 500 });
  }
}

// Also support GET for Vercel cron (some versions use GET)
export const GET = POST;
