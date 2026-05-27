import { NextResponse } from "next/server";
import { db, emails } from "@/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return cached emails from DB (populated by the IMAP sync job)
  const rows = await db
    .select()
    .from(emails)
    .orderBy(desc(emails.receivedAt))
    .limit(100);

  return NextResponse.json(rows);
}
