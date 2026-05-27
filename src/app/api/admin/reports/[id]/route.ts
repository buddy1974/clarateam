import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, careRecipients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db.select().from(reports).where(eq(reports.id, parseInt(id)));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let recipientName: string | null = null;
  if (row.careRecipientId) {
    const [rec] = await db
      .select({ name: careRecipients.name })
      .from(careRecipients)
      .where(eq(careRecipients.id, row.careRecipientId));
    recipientName = rec?.name ?? null;
  }

  return NextResponse.json({ ...row, recipientName });
}
