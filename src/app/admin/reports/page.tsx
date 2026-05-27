"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Plus, X, Loader2, ChevronRight,
  Pill, Calendar, ClipboardList, BarChart2,
} from "lucide-react";

interface Report {
  id:              number;
  type:            string;
  careRecipientId: number | null;
  recipientName:   string | null;
  periodFrom:      string;
  periodTo:        string;
  aiSummary:       string | null;
  createdAt:       string;
}

interface Recipient { id: number; name: string; }

const TYPE_META: Record<string, { label: string; icon: typeof FileText; color: string; bg: string }> = {
  mar:     { label: "MAR",     icon: Pill,          color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  shift:   { label: "Shift",   icon: Calendar,      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  task:    { label: "Tasks",   icon: ClipboardList, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  summary: { label: "Summary", icon: BarChart2,     color: "text-green-700",  bg: "bg-green-50 border-green-200" },
};

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReportsPage() {
  const [reportList,  setReportList]  = useState<Report[]>([]);
  const [recipients,  setRecipients]  = useState<Recipient[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [saving,       setSaving]      = useState(false);
  const [typeFilter,   setTypeFilter]  = useState("all");
  const [form, setForm] = useState({
    type: "mar", careRecipientId: "", periodFrom: "", periodTo: "",
  });

  const today        = new Date().toLocaleDateString("en-CA");
  const firstOfMonth = today.slice(0, 8) + "01";

  const load = useCallback(async () => {
    setLoading(true);
    const [rRes, recRes] = await Promise.all([
      fetch("/api/admin/reports"),
      fetch("/api/admin/care-recipients"),
    ]);
    if (rRes.ok)   setReportList(await rRes.json());
    if (recRes.ok) setRecipients(await recRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = typeFilter === "all"
    ? reportList
    : reportList.filter((r) => r.type === typeFilter);

  async function generate() {
    if (!form.type || !form.periodFrom || !form.periodTo) return;
    setSaving(true);
    const res = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:            form.type,
        careRecipientId: form.careRecipientId || null,
        periodFrom:      form.periodFrom,
        periodTo:        form.periodTo,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowGenerate(false);
      setSaving(false);
      setForm({ type: "mar", careRecipientId: "", periodFrom: firstOfMonth, periodTo: today });
      load();
      window.location.href = `/admin/reports/${data.id}`;
    } else {
      setSaving(false);
    }
  }

  const TYPES = ["all", "mar", "shift", "task", "summary"];

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">{reportList.length} reports</p>
        </div>
        <button
          onClick={() => { setForm({ ...form, periodFrom: firstOfMonth, periodTo: today }); setShowGenerate(true); }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Generate Report
        </button>
      </div>

      {/* Type filter */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1 overflow-x-auto">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold capitalize transition-all ${
              typeFilter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {t === "all" ? "All" : (TYPE_META[t]?.label ?? t)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">No reports yet. Generate your first report.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((report) => {
            const meta = TYPE_META[report.type] ?? { label: report.type, icon: FileText, color: "text-gray-600", bg: "bg-gray-50 border-gray-200" };
            const Icon = meta.icon;
            return (
              <Link
                key={report.id}
                href={`/admin/reports/${report.id}`}
                className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.bg}`}>
                  <Icon className={`h-5 w-5 ${meta.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{meta.label} Report</span>
                    {report.recipientName && (
                      <span className="text-xs text-gray-500">— {report.recipientName}</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {fmtDate(report.periodFrom)} – {fmtDate(report.periodTo)}
                    <span className="ml-2 text-gray-300">·</span>
                    <span className="ml-2">{new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Generate modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGenerate(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Generate Report</h2>
              <button onClick={() => setShowGenerate(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Report Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TYPE_META).map(([key, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setForm({ ...form, type: key })}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                          form.type === key
                            ? `${meta.bg} ${meta.color} border-current`
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.type !== "shift" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Patient</label>
                  <select value={form.careRecipientId} onChange={(e) => setForm({ ...form, careRecipientId: e.target.value })} className={inp}>
                    <option value="">All patients</option>
                    {recipients.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">From *</label>
                  <input type="date" value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">To *</label>
                  <input type="date" value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} className={inp} />
                </div>
              </div>

              <button
                onClick={generate}
                disabled={saving || !form.type || !form.periodFrom || !form.periodTo}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {saving ? "Generating…" : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
