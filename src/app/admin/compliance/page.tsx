"use client";

import { useState, useCallback } from "react";
import {
  Pill, Calendar, ClipboardList, Loader2,
  ChevronDown, CheckCircle2, XCircle, Clock,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Recipient { id: number; name: string; }

interface MarGrid {
  medication: {
    id: number; name: string; dosage: string; times: string[];
    route: string | null; instructions: string | null;
  };
  rows: { time: string; cells: { date: string; status: string | null; logId: number | null }[] }[];
}

interface MarResponse {
  type: "mar";
  recipient: { id: number; name: string; dateOfBirth: string | null };
  dates: string[];
  grid: MarGrid[];
  from: string;
  to: string;
}

interface ShiftRow {
  id: number; shiftDate: string; startTime: string; endTime: string;
  hours: string | null; status: string; notes: string | null;
  staffName: string | null; staffRole: string | null;
}

interface ShiftResponse {
  type: "shift";
  shifts: ShiftRow[];
  totalHours: number;
  from: string;
  to: string;
}

interface TaskGridRow {
  task: { id: number; title: string; frequency: string | null };
  cells: { date: string; status: string | null }[];
}

interface TaskResponse {
  type: "task";
  recipient: { name: string } | null;
  grid: TaskGridRow[];
  dates: string[];
  from: string;
  to: string;
}

type ComplianceData = MarResponse | ShiftResponse | TaskResponse | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDateFull(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusCell(status: string | null) {
  if (!status) return "bg-gray-50 text-gray-300";
  if (status === "given" || status === "done" || status === "completed") return "bg-green-50 text-green-700";
  if (status === "missed" || status === "skipped" || status === "cancelled") return "bg-red-50 text-red-600";
  return "bg-yellow-50 text-yellow-700";
}

function statusIcon(status: string | null) {
  if (!status) return <span className="text-gray-200">—</span>;
  if (status === "given" || status === "done" || status === "completed")
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "missed" || status === "skipped" || status === "cancelled")
    return <XCircle className="h-4 w-4 text-red-400" />;
  return <Clock className="h-4 w-4 text-yellow-400" />;
}

// ── MAR View ──────────────────────────────────────────────────────────────────

function MarView({ data }: { data: MarResponse }) {
  const totalCells  = data.grid.flatMap((g) => g.rows).flatMap((r) => r.cells);
  const given       = totalCells.filter((c) => c.status === "given").length;
  const missed      = totalCells.filter((c) => c.status !== null && c.status !== "given").length;
  const total       = totalCells.filter((c) => c.status !== null).length;
  const rate        = total > 0 ? Math.round((given / total) * 100) : 100;

  return (
    <div>
      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Given",     val: given,          color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Missed",    val: missed,          color: "text-red-600 bg-red-50 border-red-200" },
          { label: "Logged",    val: total,           color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Compliance",val: `${rate}%`,      color: "text-gray-700 bg-gray-50 border-gray-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Patient */}
      {data.recipient && (
        <p className="mb-3 text-sm text-gray-600">
          Patient: <span className="font-semibold text-gray-900">{data.recipient.name}</span>
          {data.recipient.dateOfBirth && (
            <span className="ml-2 text-gray-400">DOB: {fmtDateFull(data.recipient.dateOfBirth)}</span>
          )}
        </p>
      )}

      {/* Grid */}
      {data.grid.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <Pill className="mx-auto h-8 w-8 text-gray-200" />
          <p className="mt-2 text-sm text-gray-400">No active medications for this patient.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 print:overflow-visible">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-200">
                <th className="sticky left-0 bg-blue-50 px-3 py-3 text-left font-bold text-blue-800 min-w-[160px]">Medication</th>
                <th className="px-3 py-3 text-left font-bold text-blue-800 min-w-[60px]">Dosage</th>
                <th className="px-3 py-3 text-left font-bold text-blue-800 min-w-[60px]">Time</th>
                {data.dates.map((d) => (
                  <th key={d} className="px-2 py-3 text-center font-bold text-blue-800 min-w-[42px]">
                    {fmtDate(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.grid.map((g) =>
                g.rows.map((row, ri) => (
                  <tr key={`${g.medication.id}-${row.time}`} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-3 py-2.5 font-medium text-gray-900">
                      {ri === 0 ? g.medication.name : <span className="text-gray-300">↳</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-400">
                      {ri === 0 ? g.medication.dosage : ""}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono">{row.time}</td>
                    {row.cells.map((cell) => (
                      <td key={cell.date} className={`px-1 py-2.5 text-center ${statusCell(cell.status)}`}>
                        <div className="flex justify-center">
                          {statusIcon(cell.status)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Given</span>
        <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-400" /> Missed</span>
        <span className="flex items-center gap-1"><span className="text-gray-300">—</span> Not logged</span>
      </div>
    </div>
  );
}

// ── Shift View ────────────────────────────────────────────────────────────────

function ShiftView({ data }: { data: ShiftResponse }) {
  const completed = data.shifts.filter((s) => s.status === "completed");
  return (
    <div>
      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total Shifts", val: data.shifts.length, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Completed",    val: completed.length,   color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Hours",        val: `${data.totalHours.toFixed(1)}h`, color: "text-amber-700 bg-amber-50 border-amber-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {data.shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <Calendar className="mx-auto h-8 w-8 text-gray-200" />
          <p className="mt-2 text-sm text-gray-400">No shifts in this period.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-amber-50 border-b border-amber-200">
                <th className="px-3 py-3 text-left font-bold text-amber-800">Date</th>
                <th className="px-3 py-3 text-left font-bold text-amber-800">Staff</th>
                <th className="px-3 py-3 text-left font-bold text-amber-800">Role</th>
                <th className="px-3 py-3 text-left font-bold text-amber-800">Start</th>
                <th className="px-3 py-3 text-left font-bold text-amber-800">End</th>
                <th className="px-3 py-3 text-center font-bold text-amber-800">Hours</th>
                <th className="px-3 py-3 text-left font-bold text-amber-800">Notes</th>
                <th className="px-3 py-3 text-center font-bold text-amber-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.shifts.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{fmtDateFull(s.shiftDate)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{s.staffName ?? "—"}</td>
                  <td className="px-3 py-2.5 text-gray-500">{s.staffRole ?? "—"}</td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">{s.startTime}</td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">{s.endTime}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-gray-700">{s.hours ?? "—"}</td>
                  <td className="px-3 py-2.5 text-gray-400 max-w-[160px] truncate">{s.notes ?? "—"}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
                      s.status === "completed" ? "bg-green-100 text-green-700" :
                      s.status === "cancelled" ? "bg-red-100 text-red-600" :
                      s.status === "active"    ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={5} className="px-3 py-2.5 text-xs font-bold text-gray-600">Total completed hours</td>
                <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-900">{data.totalHours.toFixed(2)}h</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Task View ─────────────────────────────────────────────────────────────────

function TaskView({ data }: { data: TaskResponse }) {
  const allCells = data.grid.flatMap((g) => g.cells);
  const done     = allCells.filter((c) => c.status === "done").length;
  const skipped  = allCells.filter((c) => c.status === "skipped").length;
  const total    = allCells.filter((c) => c.status !== null).length;

  return (
    <div>
      {data.recipient && (
        <p className="mb-3 text-sm text-gray-600">
          Patient: <span className="font-semibold text-gray-900">{data.recipient.name}</span>
        </p>
      )}

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Done",    val: done,          color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Skipped", val: skipped,        color: "text-red-600 bg-red-50 border-red-200" },
          { label: "Logged",  val: total,          color: "text-purple-700 bg-purple-50 border-purple-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.val}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {data.grid.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-gray-200" />
          <p className="mt-2 text-sm text-gray-400">No active tasks for this patient.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-purple-50 border-b border-purple-200">
                <th className="sticky left-0 bg-purple-50 px-3 py-3 text-left font-bold text-purple-800 min-w-[180px]">Task</th>
                <th className="px-3 py-3 text-left font-bold text-purple-800 min-w-[80px]">Frequency</th>
                {data.dates.map((d) => (
                  <th key={d} className="px-2 py-3 text-center font-bold text-purple-800 min-w-[42px]">
                    {fmtDate(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.grid.map((g) => (
                <tr key={g.task.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-3 py-2.5 font-medium text-gray-900">{g.task.title}</td>
                  <td className="px-3 py-2.5 text-gray-500 capitalize">{g.task.frequency ?? "—"}</td>
                  {g.cells.map((cell) => (
                    <td key={cell.date} className={`px-1 py-2.5 text-center ${statusCell(cell.status)}`}>
                      <div className="flex justify-center">
                        {statusIcon(cell.status)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "mar",   label: "MAR",         icon: Pill,          desc: "Medication Administration Record" },
  { key: "shift", label: "Shift Log",   icon: Calendar,      desc: "Staff shifts and hours" },
  { key: "task",  label: "Task Log",    icon: ClipboardList, desc: "Care task completion" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function CompliancePage() {
  const today        = new Date().toLocaleDateString("en-CA");
  const firstOfMonth = today.slice(0, 8) + "01";

  const [tab,        setTab]        = useState<TabKey>("mar");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipId,    setRecipId]    = useState("");
  const [from,       setFrom]       = useState(firstOfMonth);
  const [to,         setTo]         = useState(today);
  const [loading,    setLoading]    = useState(false);
  const [data,       setData]       = useState<ComplianceData>(null);
  const [recipLoaded,setRecipLoaded]= useState(false);

  // Lazy-load recipients
  const ensureRecipients = useCallback(async () => {
    if (recipLoaded) return;
    const res = await fetch("/api/admin/care-recipients");
    if (res.ok) setRecipients(await res.json());
    setRecipLoaded(true);
  }, [recipLoaded]);

  async function run() {
    if (!from || !to) return;
    if ((tab === "mar" || tab === "task") && !recipId) return;
    setLoading(true);
    setData(null);
    const params = new URLSearchParams({ type: tab, from, to });
    if (recipId) params.set("recipientId", recipId);
    const res = await fetch(`/api/admin/compliance?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  const needsPatient = tab === "mar" || tab === "task";

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Compliance</h1>
        <p className="text-sm text-gray-500">Live compliance reports — MAR, shift log, task log</p>
      </div>

      {/* Report type tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setData(null); ensureRecipients(); }}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {needsPatient && (
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                Patient <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={recipId}
                  onChange={(e) => setRecipId(e.target.value)}
                  onFocus={ensureRecipients}
                  className={inp}
                >
                  <option value="">Select patient…</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">From <span className="text-red-400">*</span></label>
            <input
              type="date" value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inp}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">To <span className="text-red-400">*</span></label>
            <input
              type="date" value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inp}
            />
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading || !from || !to || (needsPatient && !recipId)}
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-40 min-h-[44px] transition-all"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </span>
          ) : "Run Report"}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      )}

      {!loading && data && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">
                {TABS.find((t) => t.key === tab)?.label}
              </h2>
              <p className="text-xs text-gray-500">
                {fmtDateFull(from)} – {fmtDateFull(to)}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 min-h-[36px]"
            >
              Print / PDF
            </button>
          </div>

          {data.type === "mar"   && <MarView   data={data} />}
          {data.type === "shift" && <ShiftView data={data} />}
          {data.type === "task"  && <TaskView  data={data} />}
        </div>
      )}

      {!loading && !data && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            {tab === "mar"   && <Pill className="h-6 w-6 text-gray-400" />}
            {tab === "shift" && <Calendar className="h-6 w-6 text-gray-400" />}
            {tab === "task"  && <ClipboardList className="h-6 w-6 text-gray-400" />}
          </div>
          <p className="text-sm font-semibold text-gray-500">Configure filters above and run report</p>
          {needsPatient && !recipId && (
            <p className="mt-1 text-xs text-amber-500">Select a patient to continue</p>
          )}
        </div>
      )}

      <style jsx global>{`
        @media print {
          nav, aside, button, header { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
