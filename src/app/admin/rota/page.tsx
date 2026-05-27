"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock,
  AlertTriangle, CheckCircle2, Calendar,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type Shift = {
  id: number; staffId: number; recipientId: number | null; clientId: number | null;
  shiftDate: string; startTime: string; endTime: string;
  hours: string | null; status: string; notes: string | null;
};

type StaffMember = {
  id: number; name: string; role: string; status: string; hourlyRate: string | null;
};

type CareRecipient = {
  id: number; name: string; clientId: number | null;
};

// ── Constants ──────────────────────────────────────────────────────

const SHIFT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "missed"] as const;

const STATUS_STYLE: Record<string, string> = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-800",
  confirmed: "border-indigo-200 bg-indigo-50 text-indigo-800",
  completed: "border-green-200 bg-green-50 text-green-800",
  cancelled: "border-gray-200 bg-gray-50 text-gray-400 line-through",
  missed:    "border-amber-200 bg-amber-50 text-amber-800",
};

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-blue-400",
  confirmed: "bg-indigo-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-300",
  missed:    "bg-amber-500",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Helpers ────────────────────────────────────────────────────────

function mondayOf(d: Date): Date {
  const day  = d.getDay();                    // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;   // shift to Mon
  const m    = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fmt(d: Date): string {
  return `${DAY_NAMES[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function sumHours(shifts: Shift[]): number {
  return shifts.reduce((acc, s) => acc + parseFloat(s.hours ?? "0"), 0);
}

// ══════════════════════════════════════════════════════════════════

export default function RotaPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()));
  const [activeTab, setActiveTab] = useState<"schedule" | "hours">("schedule");
  const [shifts, setShifts]       = useState<Shift[]>([]);
  const [staff, setStaff]         = useState<StaffMember[]>([]);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [prefillDate, setPrefillDate] = useState("");
  const [conflictWarning, setConflictWarning] = useState(false);
  const [saving, setSaving]       = useState(false);

  // Form state
  const [form, setForm] = useState({
    staffId: "", recipientId: "", shiftDate: "",
    startTime: "09:00", endTime: "17:00", notes: "",
  });

  const weekEnd = addDays(weekStart, 6);

  const load = useCallback(async () => {
    setLoading(true);
    const from = toDateStr(weekStart);
    const to   = toDateStr(weekEnd);
    const [s, st, r] = await Promise.all([
      fetch(`/api/admin/shifts?from=${from}&to=${to}`).then((x) => x.json()),
      fetch("/api/admin/staff").then((x) => x.json()),
      fetch("/api/admin/care-recipients").then((x) => x.json()),
    ]);
    if (Array.isArray(s))  setShifts(s);
    if (Array.isArray(st)) setStaff(st.filter((m: StaffMember) => m.status === "active"));
    if (Array.isArray(r))  setRecipients(r);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const shiftsForDay = (date: Date) => {
    const ds = toDateStr(date);
    return shifts.filter((s) => s.shiftDate === ds);
  };

  function staffName(id: number) {
    return staff.find((s) => s.id === id)?.name ?? `Staff #${id}`;
  }

  function recipientName(id: number | null) {
    if (!id) return null;
    return recipients.find((r) => r.id === id)?.name ?? null;
  }

  function openAddFor(date: string) {
    setPrefillDate(date);
    setForm((f) => ({ ...f, shiftDate: date }));
    setConflictWarning(false);
    setShowAdd(true);
  }

  async function addShift() {
    if (!form.staffId || !form.shiftDate) return;
    setSaving(true);
    const res = await fetch("/api/admin/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId:     parseInt(form.staffId),
        recipientId: form.recipientId ? parseInt(form.recipientId) : null,
        shiftDate:   form.shiftDate,
        startTime:   form.startTime,
        endTime:     form.endTime,
        notes:       form.notes || null,
      }),
    });
    const data = await res.json();
    if (data.conflict) {
      setConflictWarning(true);
    } else {
      setShowAdd(false);
      setConflictWarning(false);
    }
    setSaving(false);
    load();
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/shifts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  // ── Hours engine ──
  const hoursData = useMemo(() => {
    const now        = new Date();
    const monthStart = toDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd   = toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const weekFrom   = toDateStr(weekStart);
    const weekTo     = toDateStr(weekEnd);

    return staff.map((m) => {
      const myShifts = shifts.filter((s) =>
        s.staffId === m.id && s.status !== "cancelled"
      );
      const weekShifts  = myShifts.filter((s) => s.shiftDate >= weekFrom && s.shiftDate <= weekTo);
      const weekHrs     = parseFloat(sumHours(weekShifts).toFixed(2));
      const overtime    = weekHrs > 40;
      const estWeekPay  = m.hourlyRate
        ? parseFloat((weekHrs * parseFloat(m.hourlyRate)).toFixed(2))
        : null;

      return { member: m, weekHrs, overtime, estWeekPay, weekShifts };
    }).sort((a, b) => b.weekHrs - a.weekHrs);
  }, [staff, shifts, weekStart, weekEnd]);

  const previewHours = form.startTime && form.endTime
    ? (() => {
        const [sh, sm] = form.startTime.split(":").map(Number);
        const [eh, em] = form.endTime.split(":").map(Number);
        return parseFloat(Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60).toFixed(2));
      })()
    : 0;

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Rota</h1>
          <p className="text-sm text-gray-500">{shifts.filter(s => s.status !== "cancelled").length} shifts this week</p>
        </div>
        <button
          onClick={() => { setForm({ staffId: "", recipientId: "", shiftDate: toDateStr(new Date()), startTime: "09:00", endTime: "17:00", notes: "" }); setConflictWarning(false); setShowAdd(true); }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Shift
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1">
        {(["schedule", "hours"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all ${
              activeTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "schedule" ? "Week Schedule" : "Staff Hours"}
          </button>
        ))}
      </div>

      {/* ── SCHEDULE VIEW ── */}
      {activeTab === "schedule" && (
        <div>
          {/* Week navigator */}
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <button
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <div className="text-center">
              <div className="text-sm font-bold text-gray-900">
                {fmt(weekStart)} — {fmt(weekEnd)}
              </div>
              <button
                onClick={() => setWeekStart(mondayOf(new Date()))}
                className="mt-0.5 text-[10px] font-semibold text-amber-600 hover:underline"
              >
                Today
              </button>
            </div>
            <button
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {days.map((day) => {
                const isToday = toDateStr(day) === toDateStr(new Date());
                const dayShifts = shiftsForDay(day);
                return (
                  <div
                    key={toDateStr(day)}
                    className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                      isToday ? "border-amber-300" : "border-gray-200"
                    }`}
                  >
                    {/* Day header */}
                    <div className={`flex items-center justify-between px-4 py-3 ${
                      isToday ? "bg-amber-50" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isToday ? "text-amber-700" : "text-gray-700"}`}>
                          {fmt(day)}
                        </span>
                        {isToday && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">Today</span>
                        )}
                        {dayShifts.length > 0 && (
                          <span className="text-xs text-gray-400">{dayShifts.length} shift{dayShifts.length > 1 ? "s" : ""}</span>
                        )}
                      </div>
                      <button
                        onClick={() => openAddFor(toDateStr(day))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Shifts */}
                    {dayShifts.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {dayShifts.map((s) => (
                          <ShiftCard
                            key={s.id}
                            shift={s}
                            staffName={staffName(s.staffId)}
                            recipientName={recipientName(s.recipientId)}
                            onStatusChange={updateStatus}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-400 italic">No shifts scheduled</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── HOURS VIEW ── */}
      {activeTab === "hours" && (
        <div>
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">
              Hours shown for <strong>{fmt(weekStart)} — {fmt(weekEnd)}</strong>.
              Use the schedule tab to change week.
              <span className="ml-1 font-normal text-amber-700">Overtime = &gt;40 hrs/week.</span>
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
            </div>
          ) : hoursData.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">No active staff found. Add staff first.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hoursData.map(({ member: m, weekHrs, overtime, estWeekPay, weekShifts }) => (
                <div key={m.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                  overtime ? "border-red-200" : "border-gray-200"
                }`}>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{ background: "oklch(0.30 0.14 332)" }}
                      >
                        {m.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 truncate">{m.name}</span>
                          {overtime && (
                            <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              <AlertTriangle className="h-2.5 w-2.5" /> OT
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{m.role} {m.hourlyRate ? `· $${m.hourlyRate}/hr` : ""}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className={`text-lg font-extrabold ${overtime ? "text-red-600" : "text-gray-900"}`}>
                        {weekHrs}h
                      </div>
                      {estWeekPay !== null && (
                        <div className="text-xs font-semibold text-green-700">
                          est. ${estWeekPay.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {weekShifts.length > 0 && (
                    <div className="border-t border-gray-50 px-4 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {weekShifts.map((s) => (
                          <span key={s.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                            {DAY_NAMES[(new Date(s.shiftDate + "T00:00").getDay() + 6) % 7]} {s.startTime}–{s.endTime}
                            {s.hours ? ` (${s.hours}h)` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Week total */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Total hours this week</span>
                  <span className="text-lg font-extrabold text-gray-900">
                    {hoursData.reduce((a, { weekHrs }) => a + weekHrs, 0).toFixed(1)}h
                  </span>
                </div>
                {hoursData.some(({ estWeekPay }) => estWeekPay !== null) && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Estimated payroll</span>
                    <span className="text-sm font-bold text-green-700">
                      ${hoursData.reduce((a, { estWeekPay }) => a + (estWeekPay ?? 0), 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Shift Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto modal-sheet-safe">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Shift</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {conflictWarning && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800">
                  <strong>Conflict detected:</strong> This staff member already has an overlapping shift on this date. Shift was still saved.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Field label="Staff Member *">
                <select
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                  className={inp}
                >
                  <option value="">Select staff…</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                  ))}
                </select>
              </Field>

              <Field label="Care Recipient (optional)">
                <select
                  value={form.recipientId}
                  onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
                  className={inp}
                >
                  <option value="">— unassigned —</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Date *">
                <input
                  type="date"
                  value={form.shiftDate}
                  onChange={(e) => setForm({ ...form, shiftDate: e.target.value })}
                  className={inp}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time *">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className={inp}
                  />
                </Field>
                <Field label="End Time *">
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className={inp}
                  />
                </Field>
              </div>

              {previewHours > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <strong>{previewHours}h</strong> shift
                    {form.staffId && staff.find((s) => s.id === parseInt(form.staffId))?.hourlyRate && (
                      <span className="ml-2 text-green-700 font-semibold">
                        · est. ${(previewHours * parseFloat(staff.find((s) => s.id === parseInt(form.staffId))!.hourlyRate!)).toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>
              )}

              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className={inp + " resize-none"}
                  placeholder="Any special instructions…"
                />
              </Field>

              <button
                onClick={addShift}
                disabled={saving || !form.staffId || !form.shiftDate}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {saving ? "Saving…" : "Schedule Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shift Card ─────────────────────────────────────────────────────

function ShiftCard({
  shift: s,
  staffName,
  recipientName,
  onStatusChange,
}: {
  shift: Shift;
  staffName: string;
  recipientName: string | null;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-l-4 ${
      s.status === "completed" ? "border-l-green-400" :
      s.status === "cancelled" ? "border-l-gray-300" :
      s.status === "missed"    ? "border-l-amber-400" :
      "border-l-blue-400"
    }`}>
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[s.status]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{staffName}</span>
            <span className="shrink-0 text-xs text-gray-400">
              {s.startTime}–{s.endTime}
              {s.hours ? ` · ${s.hours}h` : ""}
            </span>
          </div>
          {recipientName && (
            <div className="text-xs text-gray-400 truncate">→ {recipientName}</div>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[s.status]}`}>
          {s.status}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-3">
          {s.notes && (
            <p className="mb-3 mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{s.notes}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {SHIFT_STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(s.id, st)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 ${
                  s.status === st
                    ? "ring-2 ring-offset-1 ring-current " + STATUS_STYLE[st]
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tiny helpers ───────────────────────────────────────────────────

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
