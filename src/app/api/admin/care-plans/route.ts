import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { carePlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// ── GET: fetch care plan by recipientId ────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const recipientId = searchParams.get("recipientId");

  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  const rows = await db.select().from(carePlans)
    .where(eq(carePlans.careRecipientId, parseInt(recipientId, 10)));

  // Return first plan (each recipient has one active plan)
  return NextResponse.json(rows[0] ?? null);
}

// ── POST: create a care plan for a recipient ───────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { careRecipientId, notes, conditions, allergies, dietType } = await req.json();

  const [created] = await db.insert(carePlans).values({
    careRecipientId: careRecipientId ?? null,
    notes:           notes      ?? null,
    conditions:      conditions ?? null,
    allergies:       allergies  ?? null,
    dietType:        dietType   ?? null,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

// ── PATCH: update care plan ────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...patch } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [updated] = await db.update(carePlans)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(carePlans.id, id))
    .returning();

  return NextResponse.json(updated);
}
