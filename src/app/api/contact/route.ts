import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { urgency, careType, name, phone } = body;

    // TODO: wire to email (Resend / Nodemailer) or CRM
    console.log("[contact] New care request:", { urgency, careType, name, phone });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
