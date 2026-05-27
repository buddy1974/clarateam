/**
 * Intake AI Processor — Phase 1
 *
 * Pipeline: detect type → extract raw text → AI enhance → return structured output
 *
 * Mock AI is active by default. Replace the body of enhanceWithAI() with a
 * real Claude API call when ready. The interface contract is stable.
 */

export type FileType = "text" | "pdf" | "image" | "docx" | "unknown";

export type DraftType =
  | "intake"
  | "medication"
  | "report"
  | "care_plan"
  | "incident"
  | "shift_note";

export interface StructuredIntakeData {
  name?:             string;
  firstName?:        string;
  lastName?:         string;
  dateOfBirth?:      string;
  gender?:           string;
  address?:          string;
  emergencyContact?: string;
  careNeeds?:        string;
  notes?:            string;
  detectedType?:     DraftType;
  confidence?:       number;  // 0–1
}

export interface ProcessedIntake {
  fileType:       FileType;
  rawText:        string;
  aiSummary:      string;
  structuredData: StructuredIntakeData;
}

// ── Step 1: Detect file type ─────────────────────────────────────────────

export function detectFileType(mimeType: string, filename?: string): FileType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename?.toLowerCase().endsWith(".docx")
  ) return "docx";
  if (mimeType.startsWith("text/") || filename?.toLowerCase().endsWith(".txt")) return "text";
  return "unknown";
}

// ── Step 2: Extract raw text ─────────────────────────────────────────────

export async function extractRawText(
  buffer: ArrayBuffer,
  fileType: FileType,
  filename?: string
): Promise<string> {
  switch (fileType) {
    case "text": {
      return new TextDecoder("utf-8").decode(buffer);
    }
    case "pdf":
      // TODO: integrate pdf-parse or Vercel AI SDK
      return (
        `[PDF Document: ${filename ?? "document.pdf"}]\n\n` +
        `Text extraction placeholder — integrate pdf-parse or a Vision API for full OCR.`
      );
    case "image":
      return (
        `[Image: ${filename ?? "image"}]\n\n` +
        `OCR placeholder — integrate Tesseract.js or a Vision API for text recognition.`
      );
    case "docx":
      return (
        `[Word Document: ${filename ?? "document.docx"}]\n\n` +
        `Text extraction placeholder — integrate mammoth.js for .docx parsing.`
      );
    default:
      return "[Unknown file type — manual review required]";
  }
}

// ── Step 3: AI enhancer ──────────────────────────────────────────────────
// REPLACE this function body with a real Claude API call when ready.
// The return type must stay identical.

async function enhanceWithAI(
  rawText: string
): Promise<StructuredIntakeData & { aiSummary: string }> {
  // ── CLAUDE API HOOK ────────────────────────────────────────────────────
  // import Anthropic from "@anthropic-ai/sdk";
  // const anthropic = new Anthropic();
  // const response = await anthropic.messages.create({
  //   model: "claude-sonnet-4-6",
  //   max_tokens: 1024,
  //   messages: [{
  //     role: "user",
  //     content: `Extract structured care intake data from this text and return JSON:\n\n${rawText}`
  //   }]
  // });
  // return JSON.parse(response.content[0].text);
  // ──────────────────────────────────────────────────────────────────────

  // Mock heuristic extraction
  const nameMatch    = rawText.match(/(?:name|patient|resident)[:\s]+([A-Za-z\s]{2,40})/i);
  const dobMatch     = rawText.match(/(?:dob|date of birth|born)[:\s]+([\d\/\-]+)/i);
  const genderMatch  = rawText.match(/(?:gender|sex)[:\s]+(male|female|other)/i);
  const addressMatch = rawText.match(/(?:address|addr)[:\s]+([^\n]{5,80})/i);
  const ecMatch      = rawText.match(/(?:emergency contact|emer\.?\s*contact)[:\s]+([^\n]{3,60})/i);
  const careMatch    = rawText.match(/(?:care needs?|diagnosis|condition)[:\s]+([^\n]{5,120})/i);

  const fullName  = nameMatch?.[1]?.trim() ?? "";
  const nameParts = fullName.split(/\s+/);
  const lower     = rawText.toLowerCase();

  const detectedType: DraftType =
    lower.includes("medication") || lower.includes("prescription") || lower.includes("dosage")
      ? "medication"
      : lower.includes("incident")
      ? "incident"
      : lower.includes("shift") || lower.includes("hours worked")
      ? "shift_note"
      : lower.includes("care plan")
      ? "care_plan"
      : lower.includes("report")
      ? "report"
      : "intake";

  const confidence = [!!fullName, !!dobMatch, !!genderMatch, !!careMatch].filter(Boolean).length / 4;

  return {
    name:             fullName || undefined,
    firstName:        nameParts[0] || undefined,
    lastName:         nameParts.slice(1).join(" ") || undefined,
    dateOfBirth:      dobMatch?.[1] || undefined,
    gender:           genderMatch?.[1]?.toLowerCase() || undefined,
    address:          addressMatch?.[1]?.trim() || undefined,
    emergencyContact: ecMatch?.[1]?.trim() || undefined,
    careNeeds:        careMatch?.[1]?.trim() || undefined,
    detectedType,
    confidence,
    aiSummary:
      `Document type detected: ${detectedType}. ` +
      (fullName ? `Patient identified: ${fullName}. ` : "Patient name not detected. ") +
      `Confidence: ${Math.round(confidence * 100)}%. ` +
      `${rawText.split("\n").filter(Boolean).length} lines processed.`,
  };
}

// ── Public API ───────────────────────────────────────────────────────────

/** Process a file upload */
export async function processIntake(
  buffer:   ArrayBuffer,
  mimeType: string,
  filename?: string
): Promise<ProcessedIntake> {
  const fileType = detectFileType(mimeType, filename);
  const rawText  = await extractRawText(buffer, fileType, filename);
  const { aiSummary, ...structuredData } = await enhanceWithAI(rawText);
  return { fileType, rawText, aiSummary, structuredData };
}

/** Process manual text input (no file) */
export async function processManualText(text: string): Promise<ProcessedIntake> {
  const { aiSummary, ...structuredData } = await enhanceWithAI(text);
  return { fileType: "text", rawText: text, aiSummary, structuredData };
}
