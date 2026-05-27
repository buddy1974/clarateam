import { NextResponse } from "next/server";
import { db, testimonials } from "@/db";
import { eq, asc } from "drizzle-orm";

export const revalidate = 60;

export async function GET() {
  const rows = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.active, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  return NextResponse.json(rows);
}
