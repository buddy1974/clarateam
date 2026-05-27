"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Palette, Plus, X, Star, ChevronUp, ChevronDown,
  Save, Check, MessageSquareQuote, HelpCircle, Settings2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Setting {
  key: string;
  value: string | null;
  label: string;
  section: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  quote: string;
  rating: number;
  sortOrder: number;
  active: boolean;
}

interface Faq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}

// ── Star Rating Input ──────────────────────────────────────────────────────

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Testimonial Modal ──────────────────────────────────────────────────────

function TestimonialModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<Testimonial> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name:   initial?.name   ?? "",
    role:   initial?.role   ?? "",
    quote:  initial?.quote  ?? "",
    rating: initial?.rating ?? 5,
  });
  const [saving, setSaving] = useState(false);

  function set(k: string, v: string | number) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.name || !form.quote) return;
    setSaving(true);
    if (isEdit) {
      await fetch("/api/admin/cms/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initial!.id, ...form, role: form.role || null }),
      });
    } else {
      await fetch("/api/admin/cms/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: form.role || null }),
      });
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit" : "Add"} Testimonial</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="Maria G." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Role / Relationship</label>
              <input value={form.role} onChange={(e) => set("role", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="Family member" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Quote *</label>
            <textarea value={form.quote} onChange={(e) => set("quote", e.target.value)} rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              placeholder="Clara's CareTeam was wonderful..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Rating</label>
            <StarInput value={form.rating} onChange={(n) => set("rating", n)} />
          </div>
        </div>
        <button
          onClick={submit}
          disabled={saving || !form.name || !form.quote}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: "oklch(0.74 0.14 75)" }}
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Testimonial"}
        </button>
      </div>
    </div>
  );
}

// ── FAQ Modal ──────────────────────────────────────────────────────────────

function FaqModal({
  initial,
  nextOrder,
  onClose,
  onSaved,
}: {
  initial: Partial<Faq> | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial?.id;
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer,   setAnswer]   = useState(initial?.answer   ?? "");
  const [saving,   setSaving]   = useState(false);

  async function submit() {
    if (!question || !answer) return;
    setSaving(true);
    if (isEdit) {
      await fetch("/api/admin/cms/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initial!.id, question, answer }),
      });
    } else {
      await fetch("/api/admin/cms/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, sortOrder: nextOrder }),
      });
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit" : "Add"} FAQ</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Question *</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              placeholder="What areas do you serve?" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Answer *</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              placeholder="We serve the entire DFW metroplex..." />
          </div>
        </div>
        <button
          onClick={submit}
          disabled={saving || !question || !answer}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add FAQ"}
        </button>
      </div>
    </div>
  );
}

// ── Settings Row ───────────────────────────────────────────────────────────

function SettingRow({ setting, onSaved }: { setting: Setting; onSaved: () => void }) {
  const isLong = setting.key.includes("text") || setting.key.includes("subtext") ||
    setting.key.includes("quote") || setting.key.includes("tagline") || setting.key.includes("address");
  const [val,   setVal]   = useState(setting.value ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    setState("saving");
    await fetch("/api/admin/cms/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: setting.key, value: val }),
    });
    setState("saved");
    onSaved();
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <label className="mb-1 block text-xs font-semibold text-gray-500">{setting.label}</label>
        {isLong ? (
          <textarea
            value={val}
            onChange={(e) => { setVal(e.target.value); setState("idle"); }}
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white"
          />
        ) : (
          <input
            value={val}
            onChange={(e) => { setVal(e.target.value); setState("idle"); }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white"
          />
        )}
      </div>
      <button
        onClick={save}
        disabled={state === "saving" || val === (setting.value ?? "")}
        className={`mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all disabled:opacity-40 ${
          state === "saved"
            ? "border-green-200 bg-green-50 text-green-600"
            : "border-gray-200 bg-white text-gray-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
        }`}
      >
        {state === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const TABS = ["settings", "testimonials", "faqs"] as const;

const SECTION_LABELS: Record<string, string> = {
  general:  "General",
  homepage: "Homepage",
  social:   "Social Media",
};

export default function CmsPage() {
  const [settings,     setSettings]     = useState<Setting[]>([]);
  const [testimonialList, setTestimonialList] = useState<Testimonial[]>([]);
  const [faqList,      setFaqList]      = useState<Faq[]>([]);
  const [tab,          setTab]          = useState<typeof TABS[number]>("settings");
  const [loading,      setLoading]      = useState(true);
  const [testModal,    setTestModal]    = useState<Partial<Testimonial> | null | false>(false);
  const [faqModal,     setFaqModal]     = useState<Partial<Faq> | null | false>(false);

  async function load() {
    setLoading(true);
    const [sRes, tRes, fRes] = await Promise.all([
      fetch("/api/admin/cms/settings"),
      fetch("/api/admin/cms/testimonials"),
      fetch("/api/admin/cms/faqs"),
    ]);
    const [s, t, f] = await Promise.all([sRes.json(), tRes.json(), fRes.json()]);
    setSettings(s);
    setTestimonialList(t);
    setFaqList(f);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Settings grouped by section
  const settingsBySection = useMemo(() => {
    const map: Record<string, Setting[]> = {};
    settings.forEach((s) => {
      if (!map[s.section]) map[s.section] = [];
      map[s.section].push(s);
    });
    return map;
  }, [settings]);

  async function toggleTestimonial(t: Testimonial) {
    await fetch("/api/admin/cms/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, active: !t.active }),
    });
    load();
  }

  async function toggleFaq(f: Faq) {
    await fetch("/api/admin/cms/faqs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: f.id, active: !f.active }),
    });
    load();
  }

  async function moveFaq(faq: Faq, dir: "up" | "down") {
    const idx = faqList.indexOf(faq);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqList.length) return;
    const swap = faqList[swapIdx];
    await Promise.all([
      fetch("/api/admin/cms/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faq.id, sortOrder: swap.sortOrder }),
      }),
      fetch("/api/admin/cms/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: swap.id, sortOrder: faq.sortOrder }),
      }),
    ]);
    load();
  }

  async function moveTestimonial(t: Testimonial, dir: "up" | "down") {
    const idx = testimonialList.indexOf(t);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= testimonialList.length) return;
    const swap = testimonialList[swapIdx];
    await Promise.all([
      fetch("/api/admin/cms/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, sortOrder: swap.sortOrder }),
      }),
      fetch("/api/admin/cms/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: swap.id, sortOrder: t.sortOrder }),
      }),
    ]);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: "oklch(0.95 0.04 332)" }}>
            <Palette className="h-5 w-5" style={{ color: "oklch(0.30 0.14 332)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Website CMS</h1>
            <p className="text-xs text-gray-400">Edit site content without touching code</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 rounded-2xl bg-gray-100 p-1">
          {TABS.map((t) => {
            const Icon = t === "settings" ? Settings2 : t === "testimonials" ? MessageSquareQuote : HelpCircle;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold capitalize transition-all ${
                  tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5 md:px-8">

        {/* ── Settings ── */}
        {tab === "settings" && (
          <div className="space-y-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
            ) : Object.keys(settingsBySection).length === 0 ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center">
                <p className="text-sm font-semibold text-amber-700">No settings found</p>
                <p className="mt-1 text-xs text-amber-600">
                  Run the SQL seed below to populate default settings.
                </p>
              </div>
            ) : (
              Object.entries(settingsBySection).map(([section, sects]) => (
                <div key={section} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    {SECTION_LABELS[section] ?? section}
                  </p>
                  <div className="space-y-4">
                    {sects.map((s) => (
                      <SettingRow key={s.key} setting={s} onSaved={load} />
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Public API note */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold text-blue-700">Public API Endpoints</p>
              <p className="mt-1 text-xs text-blue-600">
                Your website can fetch live content from these endpoints (no auth needed, 60s cache):
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs text-blue-700">
                <div>/api/cms/settings</div>
                <div>/api/cms/testimonials</div>
                <div>/api/cms/faqs</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Testimonials ── */}
        {tab === "testimonials" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">{testimonialList.length} testimonials</p>
              <button
                onClick={() => setTestModal(null)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white"
                style={{ background: "oklch(0.74 0.14 75)" }}
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
            ) : testimonialList.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquareQuote className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">No testimonials yet</p>
                <button
                  onClick={() => setTestModal(null)}
                  className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                >
                  + Add first testimonial
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {testimonialList.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition-opacity ${
                      t.active ? "border-gray-200" : "border-gray-100 opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">{t.name}</span>
                          {t.role && <span className="text-xs text-gray-400">{t.role}</span>}
                          {!t.active && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                              HIDDEN
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600 italic">&ldquo;{t.quote}&rdquo;</p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-1">
                        <button onClick={() => moveTestimonial(t, "up")} disabled={idx === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => moveTestimonial(t, "down")} disabled={idx === testimonialList.length - 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                      <button
                        onClick={() => setTestModal(t)}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleTestimonial(t)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          t.active
                            ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {t.active ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAQs ── */}
        {tab === "faqs" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">{faqList.length} FAQs</p>
              <button
                onClick={() => setFaqModal(null)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                <Plus className="h-4 w-4" /> Add FAQ
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
            ) : faqList.length === 0 ? (
              <div className="py-16 text-center">
                <HelpCircle className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">No FAQs yet</p>
                <button
                  onClick={() => setFaqModal(null)}
                  className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"
                >
                  + Add first FAQ
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {faqList.map((f, idx) => (
                  <div
                    key={f.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition-opacity ${
                      f.active ? "border-gray-200" : "border-gray-100 opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900">{f.question}</p>
                          {!f.active && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                              HIDDEN
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{f.answer}</p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-1">
                        <button onClick={() => moveFaq(f, "up")} disabled={idx === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => moveFaq(f, "down")} disabled={idx === faqList.length - 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                      <button
                        onClick={() => setFaqModal(f)}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleFaq(f)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          f.active
                            ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {f.active ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {testModal !== false && (
        <TestimonialModal
          initial={testModal}
          onClose={() => setTestModal(false)}
          onSaved={load}
        />
      )}
      {faqModal !== false && (
        <FaqModal
          initial={faqModal}
          nextOrder={faqList.length}
          onClose={() => setFaqModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
