"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Printer, Pill, Calendar, ClipboardList,
  BarChart2, FileText, Loader2, CheckCircle2, XCircle, Clock,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Report {
  id:              number;
  type:            string;
  careRecipientId: number | null;
  recipientName:   string | null;
  periodFrom:      string;
  periodTo:        string;
  content:         string | null;  // JSON string
  aiSummary:       string | null;
  createdAt:       string;
}

// MAR content types
interface MarMed {
  id: number; name: string; dosage: string; times: string[];
  route: string | null; instructions: string | null;
}
interface MarLog {
  medicationId: number; scheduledTime: string; logDate: string;
  status: string; notes: string | null;
}
interface MarContent {
  type: "mar"; medications: MarMed[]; logs: MarLog[];
  periodFrom: string; periodTo: string;
}

// Shift content types
interface ShiftRow {
  id: number; shiftDate: string; startTime: string; endTime: string;
  hours: string | null; status: string; staffName: string | null; staffRole: string | null;
}
interface ShiftContent {
  type: "shift"; shifts: ShiftRow[];
  periodFrom: string; periodTo: string;
}

// Task content types
interface TaskItem { id: number; title: string; frequency: string | null; }
interface TaskLog { taskId: number; logDate: string; status: string; }
interface TaskContent {
  type: "task"; tasks: TaskItem[]; logs: TaskLog[];
  periodFrom: string; periodTo: string;
}

// Summary content types
interface SummaryContent {
  type: "summary";
  medications: { name: string; dosage: string }[];
  tasks: { title: string }[];
  shifts: { shiftDate: string; hours: string | null; status: string }[];
  totalHours: number;
  periodFrom: string; periodTo: string;
}

type ParsedContent = MarContent | ShiftContent | TaskContent | SummaryContent | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; icon: typeof FileText; color: string; bg: string }> = {
  mar:     { label: "MAR",     icon: Pill,          color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  shift:   { label: "Shift",   icon: Calendar,      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  task:    { label: "Tasks",   icon: ClipboardList, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  summary: { label: "Summary", icon: BarChart2,     color: "text-green-700",  bg: "bg-green-50 border-green-200" },
};

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusIcon(status: string | null) {
  if (status === "given" || status === "done" || status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  if (status === "missed" || status === "skipped" || status === "cancelled") {
    return <XCircle className="h-4 w-4 text-red-400" />;
  }
  return <Clock className="h-4 w-4 text-gray-300" />;
}

function statusCell(status: string | null) {
  if (!status) return "bg-gray-50 text-gray-300";
  if (status === "given" || status === "done" || status === "completed") return "bg-green-50 text-green-700";
  if (status === "missed" || status === "skipped" || status === "cancelled") return "bg-red-50 text-red-600";
  return "bg-gray-50 text-gray-400";
}

function statusLabel(status: string | null) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── MAR Grid ─────────────────────────────────────────────────────────────────

function MarGrid({ content }: { content: MarContent }) {
  const { medications, logs, periodFrom, periodTo } = content;

  // Build date array
  const dates: string[] = [];
  const cur = new Date(periodFrom + "T12:00:00");
  const end = new Date(periodTo   + "T12:00:00");
  while (cur <= end) {
    dates.push(cur.toLocaleDateString("en-CA"));
    cur.setDate(cur.getDate() + 1);
  }

  const given  = logs.filter((l) => l.status === "given").length;
  const missed = logs.filter((l) => l.status !== "given").length;
  const total  = logs.length;
  const rate   = total > 0 ? Math.round((given / total) * 100) : 100;

  return (
    <div>
      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Given",    val: given,  color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Missed",   val: missed, color: "text-red-600   bg-red-50   border-red-200" },
          { label: "Rate",     val: `${rate}%`, color: "text-blue-700 bg-blue-50 border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
            <div className="text-xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid — horizontal scroll on mobile */}
      {medications.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No active medications in this period.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[160px]">Medication</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[70px]">Time</th>
                {dates.map((d) => (
                  <th key={d} className="px-2 py-2.5 text-center font-semibold text-gray-600 min-w-[44px]">
                    {new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medications.map((med) =>
                (med.times ?? []).map((time, ti) => (
                  <tr key={`${med.id}-${time}`} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-3 py-2 font-medium text-gray-800">
                      {ti === 0 ? (
                        <>
                          <div>{med.name}</div>
                          <div className="text-gray-400">{med.dosage}</div>
                        </>
                      ) : <span className="text-gray-300">↳</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-500">{time}</td>
                    {dates.map((date) => {
                      const log = logs.find(
                        (l) => l.medicationId === med.id && l.scheduledTime === time && l.logDate === date
                      );
                      return (
                        <td key={date} className={`px-2 py-2 text-center font-medium ${statusCell(log?.status ?? null)}`}>
                          {log ? statusLabel(log.status) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Shift Table ───────────────────────────────────────────────────────────────

function ShiftTable({ content }: { content: ShiftContent }) {
  const { shifts } = content;
  const completed  = shifts.filter((s) => s.status === "completed");
  const totalHours = completed.reduce((n, s) => n + parseFloat(s.hours ?? "0"), 0);

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total Shifts",   val: shifts.length,        color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Completed",      val: completed.length,     color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Hours",          val: `${totalHours.toFixed(1)}h`, color: "text-amber-700 bg-amber-50 border-amber-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
            <div className="text-xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {shifts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No shifts in this period.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Date</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Staff</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Role</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Time</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-700">Hours</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-800">{fmtDate(s.shiftDate)}</td>
                  <td className="px-3 py-2 text-gray-700">{s.staffName ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{s.staffRole ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{s.startTime} – {s.endTime}</td>
                  <td className="px-3 py-2 text-center text-gray-700">{s.hours ?? "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                      s.status === "completed" ? "bg-green-100 text-green-700" :
                      s.status === "cancelled" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Task Grid ─────────────────────────────────────────────────────────────────

function TaskGrid({ content }: { content: TaskContent }) {
  const { tasks, logs, periodFrom, periodTo } = content;

  const dates: string[] = [];
  const cur = new Date(periodFrom + "T12:00:00");
  const end = new Date(periodTo   + "T12:00:00");
  while (cur <= end) {
    dates.push(cur.toLocaleDateString("en-CA"));
    cur.setDate(cur.getDate() + 1);
  }

  const done    = logs.filter((l) => l.status === "done").length;
  const skipped = logs.filter((l) => l.status === "skipped").length;

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Done",    val: done,    color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Skipped", val: skipped, color: "text-red-600 bg-red-50 border-red-200" },
          { label: "Tasks",   val: tasks.length, color: "text-purple-700 bg-purple-50 border-purple-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
            <div className="text-xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {tasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No active tasks in this period.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[180px]">Task</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[80px]">Frequency</th>
                {dates.map((d) => (
                  <th key={d} className="px-2 py-2.5 text-center font-semibold text-gray-600 min-w-[44px]">
                    {new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-3 py-2 font-medium text-gray-800">{task.title}</td>
                  <td className="px-3 py-2 text-gray-500 capitalize">{task.frequency ?? "—"}</td>
                  {dates.map((date) => {
                    const log = logs.find((l) => l.taskId === task.id && l.logDate === date);
                    return (
                      <td key={date} className={`px-2 py-2 text-center font-medium ${statusCell(log?.status ?? null)}`}>
                        <div className="flex justify-center">
                          {statusIcon(log?.status ?? null)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Summary View ──────────────────────────────────────────────────────────────

function SummaryView({ content }: { content: SummaryContent }) {
  const completed = content.shifts.filter((s) => s.status === "completed");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Medications", val: content.medications.length, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Tasks",       val: content.tasks.length,       color: "text-purple-700 bg-purple-50 border-purple-200" },
          { label: "Hours",       val: `${(content.totalHours ?? 0).toFixed(1)}h`, color: "text-amber-700 bg-amber-50 border-amber-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
            <div className="text-xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {content.medications.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Active Medications</h3>
          <div className="space-y-1.5">
            {content.medications.map((m, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                <Pill className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span className="text-sm text-blue-900 font-medium">{m.name}</span>
                <span className="text-xs text-blue-500">{m.dosage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.tasks.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Care Tasks</h3>
          <div className="space-y-1.5">
            {content.tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-3 py-2">
                <ClipboardList className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                <span className="text-sm text-purple-900 font-medium">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Shifts Delivered</h3>
          <div className="space-y-1.5">
            {completed.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="text-sm text-amber-900 font-medium">{fmtDate(s.shiftDate)}</span>
                <span className="text-xs text-amber-500">{s.hours ?? "?"}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [report,  setReport]  = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ParsedContent>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reports/${id}`);
    if (res.ok) {
      const data: Report = await res.json();
      setReport(data);
      if (data.content) {
        try {
          setContent(JSON.parse(data.content) as ParsedContent);
        } catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <p className="text-sm text-gray-400">Report not found.</p>
        <Link href="/admin/reports" className="mt-3 inline-flex items-center gap-1 text-sm text-amber-600 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Reports
        </Link>
      </div>
    );
  }

  const meta = TYPE_META[report.type] ?? { label: report.type, icon: FileText, color: "text-gray-600", bg: "bg-gray-50 border-gray-200" };
  const Icon = meta.icon;

  return (
    <>
      {/* Print-only header */}
      <div className="hidden print:block print:mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {meta.label} Report{report.recipientName ? ` — ${report.recipientName}` : ""}
        </h1>
        <p className="text-sm text-gray-500">
          Period: {fmtDate(report.periodFrom)} – {fmtDate(report.periodTo)}{" "}
          · Generated: {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      <div className="px-4 py-6 sm:px-6 print:px-0 print:py-0">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between print:hidden">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Reports
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 min-h-[44px]"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Export PDF
          </button>
        </div>

        {/* Report card */}
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm print:border-0 print:shadow-none print:p-0 print:mb-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${meta.bg} print:hidden`}>
              <Icon className={`h-5 w-5 ${meta.color}`} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-gray-900">{meta.label} Report</h1>
              {report.recipientName && (
                <p className="text-sm text-gray-500">{report.recipientName}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-300" />
              {fmtDate(report.periodFrom)} – {fmtDate(report.periodTo)}
            </span>
            <span className="text-gray-300">·</span>
            <span>Generated {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* AI Summary */}
        {report.aiSummary && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 print:border-0 print:bg-white print:p-0 print:mb-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Summary</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {report.aiSummary}
            </pre>
          </div>
        )}

        {/* Type-specific content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm print:border-0 print:shadow-none print:p-0">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">Details</h2>

          {content?.type === "mar"     && <MarGrid    content={content} />}
          {content?.type === "shift"   && <ShiftTable content={content} />}
          {content?.type === "task"    && <TaskGrid   content={content} />}
          {content?.type === "summary" && <SummaryView content={content} />}
          {!content && (
            <p className="py-8 text-center text-sm text-gray-400">No content data for this report.</p>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav, aside, button, .print\\:hidden { display: none !important; }
          body { background: white !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </>
  );
}
