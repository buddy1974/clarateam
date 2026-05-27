"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Heart, Plus, Search, ChevronRight, Edit3, Save,
  Loader2, AlertCircle, Utensils, Pill, FileText,
  CheckCircle2, Sparkles,
} from "lucide-react";

type Recipient = { id: number; name: string; carePlanId: number | null };
type CarePlan = {
  id: number;
  careRecipientId: number;
  recipientName: string | null;
  notes: string | null;
  conditions: string | null;
  allergies: string | null;
  dietType: string | null;
  updatedAt: string;
};

const DIET_OPTIONS = [
  "Regular", "Diabetic", "Low Sodium", "Low Fat", "Renal", "Soft/Pureed",
  "Liquid", "Low Cholesterol", "Gluten-Free", "Heart-Healthy", "Other",
];

export default function CarePlansPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [plans, setPlans]           = useState<CarePlan[]>([]);
  const [selected, setSelected]     = useState<number | null>(null);
  const [plan, setPlan]             = useState<CarePlan | null>(null);
  const [form, setForm]             = useState({ conditions: "", allergies: "", dietType: "", notes: "" });
  const [search, setSearch]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [rRes, pRes] = await Promise.all([
      fetch("/api/admin/care-recipients").then((r) => r.json()),
      fetch("/api/admin/care-plans").then((r) => r.json()),
    ]);
    setRecipients(Array.isArray(rRes) ? rRes : []);
    setPlans(Array.isArray(pRes) ? pRes : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function selectRecipient(id: number) {
    setSelected(id);
    setSaved(false);
    const existing = plans.find((p) => p.careRecipientId === id) ?? null;
    setPlan(existing);
    setForm({
      conditions: existing?.conditions ?? "",
      allergies:  existing?.allergies  ?? "",
      dietType:   existing?.dietType   ?? "",
      notes:      existing?.notes      ?? "",
    });
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    const body = { ...form, careRecipientId: selected, ...(plan ? { id: plan.id } : {}) };
    const res = await fetch("/api/admin/care-plans", {
      method: plan ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlan(updated);
      setSaved(true);
      await load();
    }
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function generateAI() {
    if (!selected) return;
    const recipient = recipients.find((r) => r.id === selected);
    if (!recipient) return;
    setAiLoading(true);
    const context = `Patient: ${recipient.name}\nConditions: ${form.conditions || "Not specified"}\nAllergies: ${form.allergies || "None known"}\nDiet: ${form.dietType || "Not specified"}\nNotes: ${form.notes || "None"}`;
    const res = await fetch("/api/admin/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "care_plan_generator", context }),
    });
    if (res.ok) {
      const { result } = await res.json();
      setForm((f) => ({ ...f, notes: result }));
    }
    setAiLoading(false);
  }

  const filtered = recipients.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const hasPlan = (id: number) => plans.some((p) => p.careRecipientId === id);

  return (
    <div className="flex h-full min-h-screen flex-col md:flex-row">

      {/* ── Sidebar — patient list ── */}
      <div className="w-full border-b border-gray-200 bg-white md:w-72 md:border-b-0 md:border-r md:min-h-screen">
        <div className="p-4">
          <h1 className="font-serif text-xl font-bold text-gray-900">Care Plans</h1>
          <p className="mt-0.5 text-xs text-gray-500">Clinical plans per care recipient</p>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No care recipients found</p>
          ) : (
            filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRecipient(r.id)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  selected === r.id ? "bg-purple-50 border-l-2 border-purple-500" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "oklch(0.50 0.20 300)" }}
                  >
                    {r.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{r.name}</div>
                    <div className={`text-[10px] font-bold ${hasPlan(r.id) ? "text-green-600" : "text-gray-400"}`}>
                      {hasPlan(r.id) ? "✓ Plan exists" : "No plan yet"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main — care plan editor ── */}
      <div className="flex-1 px-4 py-6 sm:px-6">
        {!selected ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <Heart className="h-10 w-10 text-purple-300" />
            <p className="text-sm font-semibold text-gray-500">Select a care recipient to view or create their care plan</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  {recipients.find((r) => r.id === selected)?.name}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {plan ? `Last updated ${new Date(plan.updatedAt).toLocaleDateString()}` : "No care plan yet — create one below"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generateAI}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-100 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  AI Generate
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-105 disabled:opacity-50"
                  style={{ background: "oklch(0.30 0.14 332)" }}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved!" : "Save Plan"}
                </button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">

              {/* Conditions */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Medical Conditions</h3>
                </div>
                <textarea
                  value={form.conditions}
                  onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))}
                  rows={4}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Dementia (Stage 2), Fall Risk..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Allergies */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <Pill className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Allergies & Sensitivities</h3>
                </div>
                <textarea
                  value={form.allergies}
                  onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                  rows={4}
                  placeholder="e.g. Penicillin — severe reaction; Latex — mild; Shellfish — anaphylaxis..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Diet */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                    <Utensils className="h-4 w-4 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Diet Type</h3>
                </div>
                <select
                  value={form.dietType}
                  onChange={(e) => setForm((f) => ({ ...f, dietType: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">Select diet type…</option>
                  {DIET_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <p className="mt-2 text-xs text-gray-400">Specific meal preferences and restrictions can be added in notes.</p>
              </div>

              {/* Notes / AI Care Plan */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Care Notes & Plan</h3>
                  </div>
                  <span className="text-xs text-gray-400">AI-enhanced content appears here</span>
                </div>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={10}
                  placeholder="Clinical care notes, daily routines, specific instructions for caregivers, emergency protocols…&#10;&#10;Use 'AI Generate' to auto-create a professional care plan from the fields above."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "View Medications",   href: `/admin/medication?recipientId=${selected}`,  icon: Pill,     color: "text-purple-600", bg: "bg-purple-50" },
                { label: "View Rota / Shifts", href: `/admin/rota`,                                icon: Edit3,    color: "text-blue-600",   bg: "bg-blue-50" },
                { label: "Generate Report",    href: `/admin/reports`,                             icon: FileText, color: "text-green-600",  bg: "bg-green-50" },
              ].map(({ label, href, icon: Icon, color, bg }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  {label}
                  <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
              ))}
            </div>

            {/* All plans list */}
            {plans.length > 0 && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h3 className="font-semibold text-gray-900">All Care Plans</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectRecipient(p.careRecipientId!)}
                      className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">{p.recipientName}</div>
                        <div className="text-xs text-gray-400">
                          Updated {new Date(p.updatedAt).toLocaleDateString()} ·{" "}
                          {[p.conditions && "Conditions", p.allergies && "Allergies", p.dietType && "Diet"].filter(Boolean).join(" · ") || "Basic plan"}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
