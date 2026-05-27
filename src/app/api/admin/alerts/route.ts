import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { alerts, careRecipients } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const resolvedParam     = searchParams.get("resolved");
  const careRecipientId   = searchParams.get("careRecipientId");
  const type              = searchParams.get("type");

  const conditions = [];
  if (resolvedParam !== null) conditions.push(eq(alerts.resolved, resolvedParam === "true"));
  if (careRecipientId)        conditions.push(eq(alerts.careRecipientId, parseInt(careRecipientId)));
  if (type)                   conditions.push(eq(alerts.type, type));

  const rows = conditions.length
    ? await db.select().from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt)).limit(100)
    : await db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(100);

  // Enrich with recipient name
  const recipientIds = [...new Set(rows.map((r) => r.careRecipientId).filter(Boolean))] as number[];

  let recipientNames: Record<number, string> = {};
  if (recipientIds.length) {
    const { inArray } = await import("drizzle-orm");
    const recs = await db
      .select({ id: careRecipients.id, name: careRecipients.name })
      .from(careRecipients)
      .where(inArray(careRecipients.id, recipientIds));
    recipientNames = Object.fromEntries(recs.map((r) => [r.id, r.name]));
  }

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      recipientName: r.careRecipientId ? (recipientNames[r.careRecipientId] ?? null) : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, severity, careRecipientId, shiftId, message } = await req.json();

  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  // De-duplicate: don't create same alert type for same recipient if already unresolved today
  if (careRecipientId && type) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const existing = await db.select({ id: alerts.id }).from(alerts)
      .where(and(
        eq(alerts.careRecipientId, careRecipientId),
        eq(alerts.type, type),
        eq(alerts.resolved, false),
      ));
    if (existing.length > 0) {
      return NextResponse.json({ duplicate: true, id: existing[0].id }, { status: 200 });
    }
  }

  const [created] = await db.insert(alerts).values({
    type,
    severity:        severity        ?? "medium",
    careRecipientId: careRecipientId ?? null,
    shiftId:         shiftId         ?? null,
    message:         message         ?? null,
    resolved:        false,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, resolved } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [updated] = await db.update(alerts)
    .set({ resolved: resolved ?? true })
    .where(eq(alerts.id, id))
    .returning();

  return NextResponse.json(updated);
}
