import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { processIntake, processManualText } from "@/lib/ai/intakeProcessor";

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  // ── Manual text input ──────────────────────────────────────────────────
  if (contentType.includes("application/json")) {
    const body = await req.json() as { text?: string };
    if (!body.text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const result = await processManualText(body.text.trim());
    return NextResponse.json(result);
  }

  // ── File upload ────────────────────────────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }
    const buffer = await file.arrayBuffer();
    const result = await processIntake(buffer, file.type, file.name);
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "Unsupported content type. Use multipart/form-data or application/json" },
    { status: 415 }
  );
}
