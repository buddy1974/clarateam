import { NextRequest, NextResponse } from "next/server";
import { db, staff, applicants } from "@/db";
import { eq, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(staff).orderBy(desc(staff.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // "Promote from applicant" mode — pre-fill from applicant record
  if (body.fromApplicantId) {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.id, body.fromApplicantId))
      .limit(1);

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const [created] = await db.insert(staff).values({
      applicantId:  applicant.id,
      name:         applicant.name,
      email:        applicant.email,
      phone:        applicant.phone,
      role:         applicant.role,
      certifications: applicant.certifications
        ? applicant.certifications.split(",").map((c) => c.trim())
        : [],
      startDate:    body.startDate ?? new Date().toISOString().split("T")[0],
      hourlyRate:   body.hourlyRate ?? null,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  }

  // Manual create
  const {
    name, email, phone, role, hourlyRate, startDate,
    emergencyContactName, emergencyContactPhone,
    certifications, skills, notes,
  } = body;

  const [created] = await db.insert(staff).values({
    name, email, phone, role,
    hourlyRate:            hourlyRate ?? null,
    startDate:             startDate ?? null,
    emergencyContactName:  emergencyContactName ?? null,
    emergencyContactPhone: emergencyContactPhone ?? null,
    certifications:        Array.isArray(certifications) ? certifications : [],
    skills:                Array.isArray(skills) ? skills : [],
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
    .update(staff)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(staff.id, id))
    .returning();

  return NextResponse.json(updated);
}
