/**
 * POST /api/admin/ai
 * AI enhancement endpoint — uses Anthropic Messages API directly via fetch.
 * Requires ANTHROPIC_API_KEY in Vercel env vars.
 *
 * Body: { type: string, context: string, extra?: string }
 * Returns: { result: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001"; // fast, cost-effective

const SYSTEM_PROMPTS: Record<string, string> = {
  care_plan_generator: `You are a licensed care plan writer for a US home care agency (Texas).
Write a structured, professional care plan based on the patient information provided.
Format with clear sections: Patient Overview, Medical Conditions, Care Goals, Daily Care Tasks, Medication Notes, Diet & Nutrition, Emergency Protocols.
Use clinical but readable language. Keep it concise (under 400 words).`,

  patient_summary: `You are a senior care coordinator at a US home care agency.
Summarize the patient information into a clear, clinical 3-5 sentence overview.
Highlight key care needs, risk flags, and priority actions.
Output plain text only — no markdown.`,

  shift_recommendation: `You are a staffing coordinator for a home care agency in Texas.
Based on the care recipient's needs and available staff profiles provided, recommend the best caregiver match.
Explain your top recommendation and the key reasons (skills match, availability, experience).
Keep it under 150 words.`,

  report_enhance: `You are a professional medical report writer for a home care agency.
Take the raw care log data provided and write a clean, professional narrative report.
Use past tense. Include: care provided, observations, any incidents, medication status, overall patient condition.
Keep it under 300 words. No bullet points — flowing paragraphs only.`,

  incident_analysis: `You are a risk management advisor for a US home care agency.
Analyze the incident description provided and output:
1. Severity assessment (Low/Medium/High/Critical)
2. Immediate actions required
3. Documentation requirements
4. Prevention recommendations
Keep it concise and actionable.`,

  intake_extract: `You are a data extraction specialist for a medical intake system.
Extract structured patient data from the text provided.
Return ONLY a JSON object with these fields (null if not found):
{ "name", "dateOfBirth", "address", "phone", "conditions", "medications", "allergies", "emergencyContact", "emergencyPhone", "careNeeds" }`,
};

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { type, context, extra } = await req.json();

  if (!type || !context) {
    return NextResponse.json({ error: "type and context are required" }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[type];
  if (!systemPrompt) {
    return NextResponse.json({ error: `Unknown AI type: ${type}` }, { status: 400 });
  }

  const userMessage = extra
    ? `${context}\n\nAdditional context:\n${extra}`
    : context;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }

  const data = await response.json();
  const result = data.content?.[0]?.text ?? "";

  return NextResponse.json({ result });
}
