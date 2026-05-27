import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { careTasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const recipientId = searchParams.get("recipientId");
  const activeOnly  = searchParams.get("active") !== "false";

  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  const conditions = [eq(careTasks.careRecipientId, parseInt(recipientId, 10))];
  if (activeOnly) conditions.push(eq(careTasks.active, true));

  const rows = await db.select().from(careTasks)
    .where(and(...conditions))
    .orderBy(desc(careTasks.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { careRecipientId, title, description, frequency } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const [created] = await db.insert(careTasks).values({
    careRecipientId,
    title:       title.trim(),
    description: description ?? null,
    frequency:   frequency   ?? "daily",
    active:      true,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...patch } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [updated] = await db.update(careTasks)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(careTasks.id, id))
    .returning();

  return NextResponse.json(updated);
}
