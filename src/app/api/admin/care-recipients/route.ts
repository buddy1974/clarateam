import { NextRequest, NextResponse } from "next/server";
import { db, careRecipients } from "@/db";
import { eq, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  const rows = clientId
    ? await db.select().from(careRecipients).where(eq(careRecipients.clientId, parseInt(clientId))).orderBy(desc(careRecipients.createdAt))
    : await db.select().from(careRecipients).orderBy(desc(careRecipients.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    clientId, name, dateOfBirth, address, careLevel,
    careNeeds, riskFlags, emergencyContactName, emergencyContactPhone, notes,
  } = await req.json();

  const [created] = await db.insert(careRecipients).values({
    clientId:              clientId ?? null,
    name,
    dateOfBirth:           dateOfBirth ?? null,
    address:               address ?? null,
    careLevel:             careLevel ?? null,
    careNeeds:             careNeeds ?? null,
    riskFlags:             Array.isArray(riskFlags) ? riskFlags : [],
    emergencyContactName:  emergencyContactName ?? null,
    emergencyContactPhone: emergencyContactPhone ?? null,
    notes:                 notes ?? null,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...patch } = await req.json();
  const [updated] = await db
    .update(careRecipients)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(careRecipients.id, id))
    .returning();

  return NextResponse.json(updated);
}
