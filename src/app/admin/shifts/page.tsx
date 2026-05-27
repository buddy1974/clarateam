"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Plus, X, User, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

interface Shift {
  id:          number;
  staffId:     number;
  recipientId: number | null;
  clientId:    number | null;
  shiftDate:   string;
  startTime:   string;
  endTime:     string;
  hours:       string | null;
  status:      string;
  notes:       string | null;
}

interface StaffMember { id: number; name: string; role: string; }
interface Recipient    { id: number; name: string; }

const STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  active:    "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
  missed:    "bg-rose-100 text-rose-700",
};

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

export default function ShiftsPage() {
  const [shifts, setShifts]         = useState<Shift[]>([]);
  const [staffList, setStaffList]   = useState<StaffMember[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"today" | "upcoming" | "past">("today");
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({
    staffId: "", recipientId: "", shiftDate: "", startTime: "", endTime: "", notes: "",
  });

  const today = new Date().toLocaleDateString("en-CA");

  const load = useCallback(async () => {
    setLoading(true);
    let url = "/api/admin/shifts";
    if (tab === "today")    url += `?from=${today}&to=${today}`;
    else if (tab === "upcoming") url += `?from=${today}`;
    else                    url += `?to=${today}`;

    const [shiftRes, staffRes, recRes] = await Promise.all([
      fetch(url),
      fetch("/api/admin/staff"),
      fetch("/api/admin/care-recipients"),
    ]);

    if (shiftRes.ok) setShifts(await shiftRes.json());
    if (staffRes.ok) setStaffList(await staffRes.json());
    if (recRes.ok)   setRecipients(await recRes.json());
    setLoading(false);
  }, [tab, today]);

  useEffect(() => { load(); }, [load]);

  async function addShift() {
    if (!form.staffId || !form.shiftDate || !form.startTime || !form.endTime) return;
    setSaving(true);
    await fetch("/api/admin/shifts", {
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
    setForm({ staffId: "", recipientId: "", shiftDate: "", startTime: "", endTime: "", notes: "" });
    setShowAdd(false);
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

  const staffMap     = Object.fromEntries(staffList.map((s) => [s.id, s]));
  const recipientMap = Object.fromEntries(recipients.map((r) => [r.id, r]));

  const TABS: { key: "today" | "upcoming" | "past"; label: string }[] = [
    { key: "today",    label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past",     label: "Past" },
  ];

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Shifts</h1>
          <p className="text-sm text-gray-500">{shifts.length} shifts · {tab}</p>
        </div>
        <button
          onClick={() => { setForm({ ...form, shiftDate: today }); setShowAdd(true); }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Shift
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <Calendar className="mx-auto h-8 w-8 text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">No shifts for this period.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shifts.map((shift) => {
            const staffMember = staffMap[shift.staffId];
            const recipient   = shift.recipientId ? recipientMap[shift.recipientId] : null;

            return (
              <div
                key={shift.id}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "oklch(0.95 0.04 332)" }}
                  >
                    <User className="h-5 w-5" style={{ color: "oklch(0.30 0.14 332)" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {staffMember?.name ?? `Staff #${shift.staffId}`}
                      </span>
                      {staffMember?.role && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                          {staffMember.role}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[shift.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {shift.status}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {shift.shiftDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {shift.startTime} – {shift.endTime}
                        {shift.hours && <span className="text-gray-400">({shift.hours}h)</span>}
                      </span>
                      {recipient && (
                        <span className="font-medium text-gray-700">→ {recipient.name}</span>
                      )}
                    </div>

                    {shift.notes && (
                      <p className="mt-1 text-xs text-gray-400 truncate">{shift.notes}</p>
                    )}
                  </div>
                </div>

                {/* Quick status actions */}
                {(shift.status === "scheduled" || shift.status === "confirmed" || shift.status === "active") && (
                  <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                    {shift.status === "scheduled" && (
                      <button
                        onClick={() => updateStatus(shift.id, "active")}
                        className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100"
                      >
                        ▶ Start Shift
                      </button>
                    )}
                    {shift.status === "active" && (
                      <button
                        onClick={() => updateStatus(shift.id, "completed")}
                        className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                      </button>
                    )}
                    {shift.status !== "cancelled" && (
                      <button
                        onClick={() => updateStatus(shift.id, "cancelled")}
                        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Shift Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Shift</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Caregiver *">
                <select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                  className={inp}>
                  <option value="">Select caregiver…</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </Field>
              <Field label="Patient">
                <select value={form.recipientId} onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
                  className={inp}>
                  <option value="">Select patient (optional)…</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date *">
                <input type="date" value={form.shiftDate} onChange={(e) => setForm({ ...form, shiftDate: e.target.value })}
                  className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time *">
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className={inp} />
                </Field>
                <Field label="End Time *">
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className={inp} />
                </Field>
              </div>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} className={`${inp} resize-none`} placeholder="Optional notes…" />
              </Field>
              <button
                onClick={addShift}
                disabled={saving || !form.staffId || !form.shiftDate || !form.startTime || !form.endTime}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {saving ? "Adding…" : "Add Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
