import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drafts, careRecipients } from "@/db/schema";
import { or, sql } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ drafts: [], careRecipients: [] });
  }

  const pattern = `%${q.toLowerCase()}%`;

  const [foundDrafts, foundRecipients] = await Promise.all([
    db.select().from(drafts).where(
      or(
        sql`lower(${drafts.rawData}) like ${pattern}`,
        sql`lower(${drafts.aiData})  like ${pattern}`,
        sql`lower(${drafts.createdBy}) like ${pattern}`,
        sql`lower(${drafts.type}) like ${pattern}`
      )
    ).limit(10),

    db.select().from(careRecipients).where(
      or(
        sql`lower(${careRecipients.name})      like ${pattern}`,
        sql`lower(${careRecipients.firstName}) like ${pattern}`,
        sql`lower(${careRecipients.lastName})  like ${pattern}`,
        sql`lower(coalesce(${careRecipients.careNeeds}, '')) like ${pattern}`
      )
    ).limit(10),
  ]);

  return NextResponse.json({ drafts: foundDrafts, careRecipients: foundRecipients });
}
