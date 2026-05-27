import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dietPlans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipientId = req.nextUrl.searchParams.get("recipientId");
  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  const rows = await db.select().from(dietPlans).where(
    and(
      eq(dietPlans.careRecipientId, parseInt(recipientId, 10)),
      eq(dietPlans.active, true)
    )
  );

  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { careRecipientId, dietType, restrictions, notes } = await req.json();

  // Deactivate any previous plan for this recipient
  await db.update(dietPlans)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(dietPlans.careRecipientId, careRecipientId));

  const [created] = await db.insert(dietPlans).values({
    careRecipientId,
    dietType:     dietType     ?? null,
    restrictions: restrictions ?? null,
    notes:        notes        ?? null,
    active:       true,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...patch } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [updated] = await db.update(dietPlans)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(dietPlans.id, id))
    .returning();

  return NextResponse.json(updated);
}
