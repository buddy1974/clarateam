import { NextResponse } from "next/server";
import { db, faqs } from "@/db";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(faqs)
    .where(eq(faqs.active, true))
    .orderBy(asc(faqs.sortOrder), asc(faqs.id));
  return NextResponse.json(rows);
}
