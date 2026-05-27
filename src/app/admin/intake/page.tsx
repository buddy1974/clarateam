"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, Image, File, Sparkles, Save,
  AlertTriangle, CheckCircle, ChevronDown, X, Loader2,
} from "lucide-react";

type Tab      = "upload" | "manual";
type DraftType = "intake" | "medication" | "report" | "care_plan" | "incident" | "shift_note";

interface AIResult {
  fileType: string;
  rawText:  string;
  aiSummary: string;
  structuredData: {
    name?:          string;
    firstName?:     string;
    lastName?:      string;
    dateOfBirth?:   string;
    gender?:        string;
    address?:       string;
    emergencyContact?: string;
    careNeeds?:     string;
    notes?:         string;
    detectedType?:  DraftType;
    confidence?:    number;
  };
}

const DRAFT_TYPES: DraftType[] = [
  "intake", "medication", "report", "care_plan", "incident", "shift_note",
];

const TYPE_LABELS: Record<DraftType, string> = {
  intake:     "Care Intake",
  medication: "Medication",
  report:     "Report",
  care_plan:  "Care Plan",
  incident:   "Incident",
  shift_note: "Shift Note",
};

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

export default function IntakePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab]             = useState<Tab>("upload");
  const [file, setFile]           = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [dragging, setDragging]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [result, setResult]       = useState<AIResult | null>(null);
  const [draftType, setDraftType] = useState<DraftType>("intake");
  const [urgent, setUrgent]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  // ── Drag-and-drop ────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setResult(null); setError(null); }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
  };

  // ── AI Enhance ───────────────────────────────────────────────────────
  async function enhance() {
    setProcessing(true);
    setError(null);
    try {
      let res: Response;
      if (tab === "upload" && file) {
        const fd = new FormData();
        fd.append("file", file);
        res = await fetch("/api/admin/intake", { method: "POST", body: fd });
      } else {
        if (!manualText.trim()) { setError("Please enter some text first."); setProcessing(false); return; }
        res = await fetch("/api/admin/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: manualText }),
        });
      }
      if (!res.ok) throw new Error(await res.text());
      const data: AIResult = await res.json();
      setResult(data);
      if (data.structuredData.detectedType) setDraftType(data.structuredData.detectedType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  }

  // ── Save as Draft ────────────────────────────────────────────────────
  async function saveDraft() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:     draftType,
          rawData:  JSON.stringify({ rawText: result.rawText }),
          aiData:   JSON.stringify(result.structuredData),
          urgent,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => router.push("/admin/drafts"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function fileIcon() {
    if (!file) return <Upload className="h-8 w-8 text-gray-300" />;
    if (file.type.startsWith("image/"))    return <Image className="h-8 w-8 text-blue-400" />;
    if (file.type === "application/pdf")   return <File  className="h-8 w-8 text-red-400" />;
    return <FileText className="h-8 w-8 text-amber-400" />;
  }

  const confidence = result?.structuredData.confidence ?? 0;

  return (
    <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Document Intake</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload or enter text → AI extract → Save as draft for validation
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {(["upload", "manual"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(null); setError(null); }}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === t ? "text-white shadow-sm" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
            style={tab === t ? { background: "oklch(0.30 0.14 332)" } : {}}
          >
            {t === "upload" ? "📎 Upload File" : "✏️ Manual Text"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {/* Left: Input */}
        <div className="space-y-4">

          {/* Upload zone */}
          {tab === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                dragging
                  ? "border-amber-400 bg-amber-50"
                  : file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.docx,.txt,text/*"
                capture="environment"
                onChange={onFileChange}
              />
              {fileIcon()}
              {file ? (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                    className="mt-2 text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-600">
                    Drop file or tap to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, PDF, DOCX, TXT · max 10MB
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    📷 Camera capture supported on mobile
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual text */}
          {tab === "manual" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Paste or type intake text
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={`Name: John Smith\nDOB: 01/15/1945\nGender: Male\nAddress: 123 Oak St, Arlington TX\nCare needs: Assistance with daily activities...`}
                rows={10}
                className={`${inp} resize-none font-mono text-xs`}
              />
            </div>
          )}

          {/* Draft type + urgency controls */}
          {(file || manualText) && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  Document Type
                </label>
                <div className="relative">
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value as DraftType)}
                    className={`${inp} appearance-none pr-8`}
                  >
                    {DRAFT_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button
                onClick={() => setUrgent((v) => !v)}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                  urgent
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50/30"
                }`}
              >
                <AlertTriangle className={`h-4 w-4 ${urgent ? "text-red-500" : "text-gray-400"}`} />
                {urgent ? "🚨 URGENT — Telegram alert will fire" : "Mark as Urgent"}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Enhance button */}
          <button
            onClick={enhance}
            disabled={processing || (!file && !manualText.trim())}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40 min-h-[44px]"
            style={{ background: "oklch(0.55 0.18 260)" }}
          >
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Enhance with AI</>
            )}
          </button>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* AI Summary */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2.5 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">AI Summary</p>
                    <p className="text-sm text-amber-700 mt-0.5">{result.aiSummary}</p>
                  </div>
                </div>
                {/* Confidence bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] font-semibold text-amber-600 mb-1">
                    <span>Confidence</span>
                    <span>{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-amber-200">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Structured fields */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Extracted Data
                </p>
                <div className="space-y-2">
                  {[
                    ["Name",       result.structuredData.name ?? `${result.structuredData.firstName ?? ""} ${result.structuredData.lastName ?? ""}`.trim()],
                    ["Date of Birth",   result.structuredData.dateOfBirth],
                    ["Gender",          result.structuredData.gender],
                    ["Address",         result.structuredData.address],
                    ["Emergency Contact", result.structuredData.emergencyContact],
                    ["Care Needs",      result.structuredData.careNeeds],
                    ["Document Type",   TYPE_LABELS[result.structuredData.detectedType ?? "intake"]],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="w-32 shrink-0 text-xs font-semibold text-gray-400">{label}</span>
                      <span className="text-gray-800 break-words">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw text */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Raw Extracted Text
                </p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                  {result.rawText}
                </pre>
              </div>

              {/* Save as Draft */}
              <button
                onClick={saveDraft}
                disabled={saving || saved}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 min-h-[44px]"
                style={{ background: saved ? "oklch(0.50 0.18 150)" : "oklch(0.30 0.14 332)" }}
              >
                {saved ? (
                  <><CheckCircle className="h-4 w-4" /> Saved — redirecting…</>
                ) : saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="h-4 w-4" /> Save as Draft</>
                )}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <Sparkles className="h-10 w-10 text-gray-200" />
              <p className="mt-3 text-sm font-semibold text-gray-400">
                AI results appear here
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {tab === "upload" ? "Upload a file then click Enhance" : "Enter text then click Enhance"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
