import { NextRequest, NextResponse } from "next/server";
import { db, medications } from "@/db";
import { eq, and } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const recipientId = searchParams.get("recipientId");
  const activeOnly  = searchParams.get("active") !== "false";

  const conditions = [];
  if (recipientId) conditions.push(eq(medications.recipientId, parseInt(recipientId)));
  if (activeOnly)  conditions.push(eq(medications.active, true));

  const rows = conditions.length
    ? await db.select().from(medications).where(and(...conditions))
    : await db.select().from(medications);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipientId, name, dosage, frequency, route, times, prescriber, startDate, endDate, notes } =
    await req.json();

  const [created] = await db.insert(medications).values({
    recipientId,
    name,
    dosage,
    frequency,
    route:      route ?? "oral",
    times:      times ?? [],
    prescriber: prescriber ?? null,
    startDate:  startDate ?? null,
    endDate:    endDate ?? null,
    notes:      notes ?? null,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...patch } = await req.json();

  const [updated] = await db
    .update(medications)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(medications.id, id))
    .returning();

  return NextResponse.json(updated);
}
