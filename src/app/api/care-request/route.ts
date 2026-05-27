import { NextRequest, NextResponse } from "next/server";
import { db, careRequests } from "@/db";
import { notify } from "@/lib/telegram";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contactName, contactEmail, contactPhone,
      facilityName, address, careType,
      hoursPerWeek, startDate, shiftNeeded, specialNeeds,
    } = body;

    if (!contactName || !contactEmail || !contactPhone || !careType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [request] = await db
      .insert(careRequests)
      .values({
        contactName, contactEmail, contactPhone,
        facilityName, address, careType,
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : null,
        startDate, shiftNeeded: shiftNeeded ?? [],
        specialNeeds,
      })
      .returning();

    // Telegram notification
    await notify.newCareRequest(contactName, careType, contactPhone);

    // Confirmation to requester
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Clara's CareTeam <info@claracareteam.com>",
        to: contactEmail,
        subject: "Care Request Received — Clara's CareTeam",
        html: `
          <p>Hi ${contactName},</p>
          <p>We've received your care request for a <strong>${careType}</strong>. Our team will contact you within a few hours to confirm availability and next steps.</p>
          <p>For immediate needs, call us directly at <strong>817-265-5762</strong>.</p>
          <br/>
          <p>— Clara's CareTeam<br/>claracareteam.com</p>
        `,
      });
    }

    return NextResponse.json({ success: true, id: request.id });
  } catch (err) {
    console.error("[POST /api/care-request]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
