"use client";

import { useState, useCallback } from "react";
import {
  Sparkles, FileText, Users, ClipboardList,
  AlertCircle, Loader2, Copy, CheckCheck,
  RotateCcw, ChevronDown,
} from "lucide-react";

type Tool = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  placeholder: string;
  tip: string;
};

const TOOLS: Tool[] = [
  {
    id: "care_plan_generator",
    label: "Care Plan Generator",
    description: "Turn patient info into a structured clinical care plan",
    icon: FileText,
    color: "text-purple-600",
    bg: "bg-purple-50",
    placeholder: "Patient: Mary Johnson\nAge: 78\nConditions: Type 2 Diabetes, Hypertension, moderate fall risk\nAllergies: Penicillin\nDiet: Diabetic, low sodium\nCurrent medications: Metformin 500mg twice daily, Lisinopril 10mg daily\nCare needs: daily medication reminders, morning hygiene, mobility assistance",
    tip: "Include patient name, age, conditions, allergies, medications, and care needs for best results.",
  },
  {
    id: "patient_summary",
    label: "Patient Summary",
    description: "Summarize care recipient records into a concise clinical overview",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    placeholder: "Patient: Robert Chen, 82 years old\nDiagnosis: Parkinson's disease (Stage 3), mild cognitive impairment\nRisk flags: fall risk, wandering risk\nCurrent care: 8-hour daily shifts, CNA support\nRecent incidents: minor fall 2 weeks ago, no injury\nMedications: Carbidopa-Levodopa 3x daily, Donepezil 10mg nightly",
    tip: "Paste any combination of care notes, records, or intake data.",
  },
  {
    id: "shift_recommendation",
    label: "Shift Match AI",
    description: "Recommend the best caregiver for a patient based on needs and profiles",
    icon: ClipboardList,
    color: "text-green-600",
    bg: "bg-green-50",
    placeholder: "Care Recipient: Helen Martinez, 75\nNeeds: Dementia care, Spanish-speaking preferred, overnight 12-hour shift, light cooking\n\nAvailable Staff:\n1. Maria Lopez — CNA, 5 years dementia exp, bilingual Spanish/English, available overnight\n2. James Carter — HHA, 2 years general care, English only, prefers day shifts\n3. Angela Obi — LVN, 8 years, specializes in memory care, available all shifts",
    tip: "Include care recipient needs AND a list of available staff with their skills.",
  },
  {
    id: "report_enhance",
    label: "Report Enhancer",
    description: "Transform raw care logs into a professional narrative report",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
    placeholder: "08:00 - arrived, patient alert\n08:15 - given metformin with breakfast\n09:00 - morning hygiene completed\n10:30 - patient complaint of mild knee pain\n11:00 - BP 128/82, HR 74\n12:00 - lunch served, ate 80%\n13:00 - nap, patient resting\n15:00 - afternoon meds given\n16:00 - light walk in hallway\n17:00 - end of shift, patient stable",
    tip: "Paste shift notes or care logs — AI converts them into a professional report.",
  },
  {
    id: "incident_analysis",
    label: "Incident Analyzer",
    description: "Assess incidents, severity, and recommended actions",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    placeholder: "Patient: William Scott, 80 years old\nDate/Time: Today at 2:30 PM\nIncident: Patient was found on the floor in the bedroom. Caregiver heard a sound and found patient had attempted to get up without using the walker. Patient reported mild hip pain. No visible injuries, was assisted back to bed. BP checked: 142/88. Family notified.",
    tip: "Include patient name, what happened, when, and current condition for a full analysis.",
  },
  {
    id: "intake_extract",
    label: "Intake Data Extractor",
    description: "Extract structured data from scanned forms, referrals, or faxed documents",
    icon: FileText,
    color: "text-teal-600",
    bg: "bg-teal-50",
    placeholder: "PATIENT REFERRAL\nName: Dorothy Mae Williams DOB: 03/14/1948\nAddress: 2841 Meadow Lane, Arlington TX 76010\nPhone: 817-555-0192\nDx: CHF, Type 2 DM, CKD Stage 3\nAllergies: Sulfa drugs, Aspirin\nMeds: Lasix 40mg daily, Metformin 500mg BID, Lisinopril 5mg daily\nEmergency Contact: David Williams (son) 817-555-0847\nCare Level: Intermediate — requires daily nursing oversight",
    tip: "Paste OCR output or typed referral text. AI extracts and structures the data.",
  },
];

export default function AIPage() {
  const [activeTool, setActiveTool] = useState<Tool>(TOOLS[0]);
  const [input, setInput]           = useState("");
  const [result, setResult]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState("");

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTool.id, context: input }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "AI request failed");
      } else {
        const { result: r } = await res.json();
        setResult(r);
      }
    } catch {
      setError("Network error — check your connection");
    }
    setLoading(false);
  }, [activeTool, input]);

  async function copyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function switchTool(t: Tool) {
    setActiveTool(t);
    setInput("");
    setResult("");
    setError("");
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, oklch(0.50 0.20 300), oklch(0.55 0.22 260))" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">AI Enhancement</h1>
            <p className="text-sm text-gray-500">6 AI tools purpose-built for care operations</p>
          </div>
        </div>
      </div>

      {/* Tool selector — horizontal scroll chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const active = activeTool.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTool(t)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? "text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
              style={active ? { background: "oklch(0.30 0.14 332)" } : {}}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {/* Input panel */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeTool.bg}`}>
                <activeTool.icon className={`h-4 w-4 ${activeTool.color}`} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{activeTool.label}</div>
                <div className="text-xs text-gray-400">{activeTool.description}</div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Input</label>
              <button
                onClick={() => setInput(activeTool.placeholder)}
                className="text-xs font-semibold text-purple-600 hover:underline"
              >
                Load example
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              placeholder={activeTool.placeholder}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
            <p className="mt-2 text-xs text-gray-400">💡 {activeTool.tip}</p>
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <button
              onClick={run}
              disabled={loading || !input.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-extrabold text-white transition-all hover:brightness-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, oklch(0.30 0.14 332), oklch(0.50 0.20 300))" }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                : <><Sparkles className="h-4 w-4" /> Run AI</>
              }
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <span className="font-semibold text-gray-900">AI Output</span>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setInput(""); setResult(""); setError(""); }}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Clear
                </button>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, oklch(0.30 0.14 332), oklch(0.50 0.20 300))" }}
                >
                  <Sparkles className="h-6 w-6 animate-pulse text-white" />
                </div>
                <p className="text-sm text-gray-500">Generating with Claude AI…</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <p className="mt-1 text-xs text-red-500">Make sure ANTHROPIC_API_KEY is set in Vercel environment variables.</p>
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
                {result}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full opacity-20"
                  style={{ background: "oklch(0.30 0.14 332)" }}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-400">Fill in the input and click <strong>Run AI</strong></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool cards overview */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => switchTool(t)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
                activeTool.id === t.id ? "border-purple-200 bg-purple-50/60" : "border-gray-200 bg-white"
              }`}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.bg}`}>
                <Icon className={`h-4 w-4 ${t.color}`} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{t.label}</div>
                <div className="mt-0.5 text-xs text-gray-500">{t.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Powered by Claude (Anthropic) · Requires <code className="rounded bg-gray-100 px-1">ANTHROPIC_API_KEY</code> in Vercel settings
      </p>
    </div>
  );
}
