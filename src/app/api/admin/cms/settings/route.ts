import { NextRequest, NextResponse } from "next/server";
import { db, siteSettings } from "@/db";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(siteSettings).orderBy(siteSettings.section, siteSettings.key);
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key, value } = await req.json();
  const [updated] = await db
    .update(siteSettings)
    .set({ value, updatedAt: new Date() })
    .where(eq(siteSettings.key, key))
    .returning();
  return NextResponse.json(updated);
}
