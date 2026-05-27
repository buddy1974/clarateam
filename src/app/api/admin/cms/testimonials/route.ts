import { NextRequest, NextResponse } from "next/server";
import { db, testimonials } from "@/db";
import { eq, asc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, role, quote, rating, sortOrder } = await req.json();
  const [created] = await db.insert(testimonials).values({
    name, role: role ?? null, quote,
    rating: rating ?? 5,
    sortOrder: sortOrder ?? 0,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, ...patch } = await req.json();
  const [updated] = await db
    .update(testimonials)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();
  return NextResponse.json(updated);
}
