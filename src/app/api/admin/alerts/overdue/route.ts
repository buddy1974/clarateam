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

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { runOverdueCheck } from "@/lib/overdue-check";

export async function POST() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runOverdueCheck();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[alerts/overdue]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
