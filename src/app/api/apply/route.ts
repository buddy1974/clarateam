import { NextRequest, NextResponse } from "next/server";
import { db, applicants } from "@/db";
import { notify } from "@/lib/telegram";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, availability, experience, certifications, message } = body;

    if (!name || !email || !phone || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into DB
    const [applicant] = await db
      .insert(applicants)
      .values({
        name,
        email,
        phone,
        role,
        availability: availability ?? [],
        experience,
        certifications,
        message,
        source: "website",
      })
      .returning();

    // Fire Telegram notification
    await notify.newApplicant(name, role, phone);

    // Send confirmation email to applicant
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Clara's CareTeam <info@claracareteam.com>",
        to: email,
        subject: "Application Received — Clara's CareTeam",
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for applying to join Clara's CareTeam. We've received your application for the <strong>${role}</strong> role and will review it within 48 hours.</p>
          <p>We'll reach out to you at this email address (${email}) or by phone (${phone}).</p>
          <p>In the meantime, please do not respond to this email — for questions, call us at <strong>817-265-5762</strong>.</p>
          <br/>
          <p>— Clara's CareTeam<br/>DFW Residential Care Staffing<br/>claracareteam.com</p>
        `,
      });
    }

    return NextResponse.json({ success: true, id: applicant.id });
  } catch (err) {
    console.error("[POST /api/apply]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
