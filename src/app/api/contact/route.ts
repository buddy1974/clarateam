import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { notify } from "@/lib/telegram";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message, urgency, careType } = await req.json();

    // Support both the old care-request shape and new contact-form shape
    const displayName    = name  || "Website visitor";
    const displayMessage = message || `Care request — Type: ${careType}, Urgency: ${urgency}`;
    const displaySubject = subject || urgency || "General Inquiry";

    await resend.emails.send({
      from:    "Clara's CareTeam Website <noreply@claracareteam.com>",
      to:      ["info@claracareteam.com"],
      subject: `Website Contact: ${displaySubject} — ${displayName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${displayName}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${displaySubject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${displayMessage.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#888;font-size:12px">Sent from claracareteam.com contact form</p>
      `,
    });

    // Fire-and-forget Telegram alert
    notify.newContactForm(displayName, displaySubject, phone, email).catch(console.error);

    return NextResponse.json({ ok: true, success: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}
