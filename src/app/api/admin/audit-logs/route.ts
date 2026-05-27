import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId   = searchParams.get("entityId");

  let rows;

  if (entityType && entityId) {
    rows = await db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.entityType, entityType),
        eq(auditLogs.entityId,   parseInt(entityId, 10))
      ))
      .orderBy(desc(auditLogs.timestamp));
  } else if (entityType) {
    rows = await db.select().from(auditLogs)
      .where(eq(auditLogs.entityType, entityType))
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);
  } else {
    rows = await db.select().from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);
  }

  return NextResponse.json(rows);
}
