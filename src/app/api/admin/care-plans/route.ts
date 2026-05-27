import { NextRequest, NextResponse } from "next/server";
import { db, carePlans, careRecipients } from "@/db";
import { eq, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// ── GET — fetch care plans (all or by recipientId) ───────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipientId = req.nextUrl.searchParams.get("recipientId");

  if (recipientId) {
    const rows = await db
      .select({
        id:              carePlans.id,
        careRecipientId: carePlans.careRecipientId,
        recipientName:   careRecipients.name,
        notes:           carePlans.notes,
        conditions:      carePlans.conditions,
        allergies:       carePlans.allergies,
        dietType:        carePlans.dietType,
        createdAt:       carePlans.createdAt,
        updatedAt:       carePlans.updatedAt,
      })
      .from(carePlans)
      .leftJoin(careRecipients, eq(carePlans.careRecipientId, careRecipients.id))
      .where(eq(carePlans.careRecipientId, parseInt(recipientId)))
      .orderBy(desc(carePlans.updatedAt))
      .limit(1);
    return NextResponse.json(rows[0] ?? null);
  }

  const rows = await db
    .select({
      id:              carePlans.id,
      careRecipientId: carePlans.careRecipientId,
      recipientName:   careRecipients.name,
      notes:           carePlans.notes,
      conditions:      carePlans.conditions,
      allergies:       carePlans.allergies,
      dietType:        carePlans.dietType,
      createdAt:       carePlans.createdAt,
      updatedAt:       carePlans.updatedAt,
    })
    .from(carePlans)
    .leftJoin(careRecipients, eq(carePlans.careRecipientId, careRecipients.id))
    .orderBy(desc(carePlans.updatedAt));

  return NextResponse.json(rows);
}

// ── POST — create care plan ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { careRecipientId, notes, conditions, allergies, dietType } = await req.json();

  if (!careRecipientId) {
    return NextResponse.json({ error: "careRecipientId is required" }, { status: 400 });
  }

  const [plan] = await db.insert(carePlans).values({
    careRecipientId: parseInt(careRecipientId),
    notes:      notes ?? null,
    conditions: conditions ?? null,
    allergies:  allergies ?? null,
    dietType:   dietType ?? null,
  }).returning();

  // Link care plan back to care recipient
  await db.update(careRecipients)
    .set({ carePlanId: plan.id, updatedAt: new Date() })
    .where(eq(careRecipients.id, parseInt(careRecipientId)));

  return NextResponse.json(plan, { status: 201 });
}

// ── PATCH — update existing care plan ────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, notes, conditions, allergies, dietType } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(carePlans)
    .set({
      notes:      notes ?? null,
      conditions: conditions ?? null,
      allergies:  allergies ?? null,
      dietType:   dietType ?? null,
      updatedAt:  new Date(),
    })
    .where(eq(carePlans.id, parseInt(id)))
    .returning();

  return NextResponse.json(updated);
}
