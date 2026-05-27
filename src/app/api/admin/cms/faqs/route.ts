import { NextRequest, NextResponse } from "next/server";
import { db, faqs } from "@/db";
import { eq, asc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { question, answer, sortOrder } = await req.json();
  const [created] = await db.insert(faqs).values({
    question, answer, sortOrder: sortOrder ?? 0,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, ...patch } = await req.json();
  const [updated] = await db
    .update(faqs)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(faqs.id, id))
    .returning();
  return NextResponse.json(updated);
}
