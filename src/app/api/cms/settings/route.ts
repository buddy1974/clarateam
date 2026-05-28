import { NextResponse } from "next/server";
import { db, siteSettings } from "@/db";

// Public — no auth. Used by the marketing site.
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(siteSettings);
  // Return as a flat key→value map for easy consumption
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value ?? ""; });
  return NextResponse.json(map);
}
