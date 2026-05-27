import { NextRequest, NextResponse } from "next/server";
import { db, clients } from "@/db";
import { eq, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, contactName, email, phone, address, notes, referredBy } = await req.json();

  const [created] = await db.insert(clients).values({
    name,
    type:        type ?? "facility",
    contactName: contactName ?? null,
    email:       email ?? null,
    phone:       phone ?? null,
    address:     address ?? null,
    notes:       notes ?? null,
    referredBy:  referredBy ?? null,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...patch } = await req.json();
  const [updated] = await db
    .update(clients)
    .set(patch)
    .where(eq(clients.id, id))
    .returning();

  return NextResponse.json(updated);
}
