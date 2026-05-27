"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Pill, Plus, Check, X, Clock, AlertCircle,
  ChevronDown, ChevronUp, Pencil, Power,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface CareRecipient {
  id: number;
  name: string;
  clientId: number | null;
  careLevel: string | null;
}

interface Medication {
  id: number;
  recipientId: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  times: string[];
  prescriber: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  active: boolean;
}

interface MedLog {
  id: number;
  medicationId: number;
  staffId: number | null;
  scheduledTime: string;
  logDate: string;
  status: "given" | "missed" | "refused" | "held";
  notes: string | null;
}

interface StaffMember {
  id: number;
  name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

const ROUTE_LABELS: Record<string, string> = {
  oral: "Oral", topical: "Topical", injection: "Injection", inhaled: "Inhaled",
};

const STATUS_STYLE: Record<string, string> = {
  given:   "bg-green-100 text-green-700 border-green-200",
  missed:  "bg-red-100 text-red-700 border-red-200",
  refused: "bg-orange-100 text-orange-700 border-orange-200",
  held:    "bg-gray-100 text-gray-600 border-gray-200",
};

const CARE_LEVEL_COLOR: Record<string, string> = {
  companion: "bg-sky-100 text-sky-700",
  personal:  "bg-violet-100 text-violet-700",
  skilled:   "bg-amber-100 text-amber-700",
  memory:    "bg-rose-100 text-rose-700",
  hospice:   "bg-gray-100 text-gray-600",
};

// ── Add Medication Modal ───────────────────────────────────────────────────

function AddMedModal({
  recipientId,
  onClose,
  onSaved,
}: {
  recipientId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "", dosage: "", frequency: "", route: "oral",
    times: "", prescriber: "", startDate: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.name || !form.dosage || !form.frequency) return;
    setSaving(true);
    const times = form.times.split(",").map((t) => t.trim()).filter(Boolean);
    await fetch("/api/admin/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, times, recipientId }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl modal-sheet-safe">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add Medication</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Med Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                placeholder="e.g. Lisinopril" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Dosage *</label>
              <input value={form.dosage} onChange={(e) => set("dosage", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                placeholder="e.g. 10mg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Frequency *</label>
              <input value={form.frequency} onChange={(e) => set("frequency", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                placeholder="e.g. twice daily" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Route</label>
              <select value={form.route} onChange={(e) => set("route", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400">
                <option value="oral">Oral</option>
                <option value="topical">Topical</option>
                <option value="injection">Injection</option>
                <option value="inhaled">Inhaled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Scheduled Times (HH:MM, comma-separated)
            </label>
            <input value={form.times} onChange={(e) => set("times", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              placeholder="e.g. 08:00, 20:00" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Prescriber</label>
              <input value={form.prescriber} onChange={(e) => set("prescriber", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                placeholder="Dr. Name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              placeholder="Special instructions..." />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving || !form.name || !form.dosage || !form.frequency}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: "oklch(0.55 0.20 300)" }}
        >
          {saving ? "Saving..." : "Add Medication"}
        </button>
      </div>
    </div>
  );
}

// ── Log Dose Modal ─────────────────────────────────────────────────────────

function LogDoseModal({
  med,
  time,
  existingLog,
  staff,
  onClose,
  onSaved,
}: {
  med: Medication;
  time: string;
  existingLog: MedLog | null;
  staff: StaffMember[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<string>(existingLog?.status ?? "given");
  const [staffId, setStaffId] = useState<string>("");
  const [notes, setNotes] = useState(existingLog?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    await fetch("/api/admin/medication-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicationId: med.id,
        staffId: staffId ? parseInt(staffId) : null,
        scheduledTime: time,
        logDate: todayStr(),
        status,
        notes: notes || null,
      }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl modal-sheet-safe">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">{med.name} {med.dosage}</h2>
            <p className="text-sm text-gray-400">{fmtTime(time)}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {(["given", "missed", "refused", "held"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-xl border py-2 text-sm font-semibold capitalize transition-all ${
                    status === s ? STATUS_STYLE[s] : "border-gray-200 text-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Staff</label>
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="">— Select caregiver —</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              placeholder="Optional note..." />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          {saving ? "Saving..." : "Log Dose"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RecipientMedPage({
  params,
}: {
  params: Promise<{ recipientId: string }>;
}) {
  const { recipientId } = use(params);
  const rid = parseInt(recipientId);

  const [recipient, setRecipient] = useState<CareRecipient | null>(null);
  const [meds,      setMeds]      = useState<Medication[]>([]);
  const [logs,      setLogs]      = useState<MedLog[]>([]);
  const [staff,     setStaff]     = useState<StaffMember[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<"schedule" | "today" | "history">("today");
  const [showAdd,   setShowAdd]   = useState(false);
  const [expanded,  setExpanded]  = useState<number | null>(null);
  const [logTarget, setLogTarget] = useState<{ med: Medication; time: string } | null>(null);

  const today = todayStr();
  const days7 = last7Days();
  const fromDate = days7[0];

  async function load() {
    setLoading(true);
    const [rRes, mRes, lRes, sRes] = await Promise.all([
      fetch(`/api/admin/care-recipients?id=${rid}`),
      fetch(`/api/admin/medications?recipientId=${rid}&active=false`),
      fetch(`/api/admin/medication-logs?recipientId=${rid}&from=${fromDate}`),
      fetch("/api/admin/staff"),
    ]);
    const [rAll, m, l, s] = await Promise.all([rRes.json(), mRes.json(), lRes.json(), sRes.json()]);
    const r = Array.isArray(rAll) ? rAll.find((x: CareRecipient) => x.id === rid) : rAll;
    setRecipient(r ?? null);
    setMeds(m);
    setLogs(l);
    setStaff(s.filter((x: StaffMember & { status: string }) => x.status === "active"));
    setLoading(false);
  }

  useEffect(() => { load(); }, [rid]);

  const activeMeds  = useMemo(() => meds.filter((m) => m.active), [meds]);
  const inactiveMeds = useMemo(() => meds.filter((m) => !m.active), [meds]);
  const todayLogs   = useMemo(() => logs.filter((l) => l.logDate === today), [logs, today]);

  // Build today's dose list
  const todayDoses = useMemo(() => {
    const doses: { med: Medication; time: string; log: MedLog | null; isPast: boolean }[] = [];
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    activeMeds.forEach((med) => {
      med.times.forEach((time) => {
        const log = todayLogs.find((l) => l.medicationId === med.id && l.scheduledTime === time) ?? null;
        const [h, m] = time.split(":").map(Number);
        const doseMins = h * 60 + m;
        doses.push({ med, time, log, isPast: doseMins <= nowMins });
      });
    });

    return doses.sort((a, b) => a.time.localeCompare(b.time));
  }, [activeMeds, todayLogs]);

  async function toggleActive(med: Medication) {
    await fetch("/api/admin/medications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: med.id, active: !med.active }),
    });
    load();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Recipient not found</p>
        <Link href="/admin/medication" className="text-sm text-violet-600 underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/medication"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bold text-gray-900 truncate">{recipient.name}</h1>
              {recipient.careLevel && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CARE_LEVEL_COLOR[recipient.careLevel] ?? "bg-gray-100 text-gray-500"}`}>
                  {recipient.careLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{activeMeds.length} active medication{activeMeds.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm"
            style={{ background: "oklch(0.55 0.20 300)" }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Med</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-2xl bg-gray-100 p-1">
          {(["today", "schedule", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-1.5 text-xs font-bold capitalize transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {t === "today" ? "Today's Log" : t === "schedule" ? "Medications" : "History"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 md:px-8">

        {/* ── Today's Log ── */}
        {tab === "today" && (
          <div className="space-y-3">
            {todayDoses.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">No scheduled doses — add a medication first</p>
              </div>
            ) : (
              todayDoses.map(({ med, time, log, isPast }) => {
                const doseStatus = log?.status ?? (isPast ? "missed" : "pending");
                const isPending = !log && !isPast;

                return (
                  <div
                    key={`${med.id}-${time}`}
                    className={`flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm ${
                      doseStatus === "missed" && !log ? "border-red-100" : "border-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{med.name}</span>
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                          {med.dosage}
                        </span>
                        <span className="text-xs text-gray-400">{ROUTE_LABELS[med.route]}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{fmtTime(time)}</p>
                      {log?.notes && <p className="mt-1 text-xs text-gray-400 italic">{log.notes}</p>}
                    </div>

                    <div className="ml-3 flex items-center gap-2">
                      {log ? (
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[log.status]}`}>
                          {log.status}
                        </span>
                      ) : isPast ? (
                        <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          Missed
                        </span>
                      ) : (
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-400">
                          Upcoming
                        </span>
                      )}
                      <button
                        onClick={() => setLogTarget({ med, time })}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                      >
                        {log ? <Pencil className="h-3.5 w-3.5 text-gray-400" /> : <Check className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Medications Schedule ── */}
        {tab === "schedule" && (
          <div className="space-y-3">
            {activeMeds.length === 0 && (
              <div className="py-10 text-center">
                <Pill className="mx-auto h-8 w-8 text-gray-200" />
                <p className="mt-2 text-sm text-gray-400">No active medications</p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
                >
                  + Add first medication
                </button>
              </div>
            )}
            {activeMeds.map((med) => {
              const isOpen = expanded === med.id;
              return (
                <div key={med.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : med.id)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{med.name}</span>
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700 font-medium">
                          {med.dosage}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 font-medium capitalize">
                          {ROUTE_LABELS[med.route] ?? med.route}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {med.frequency}
                        {med.times.length > 0 && (
                          <> · {med.times.map(fmtTime).join(", ")}</>
                        )}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                      {med.prescriber && (
                        <p className="text-xs text-gray-500"><span className="font-semibold">Prescriber:</span> {med.prescriber}</p>
                      )}
                      {med.startDate && (
                        <p className="text-xs text-gray-500"><span className="font-semibold">Started:</span> {med.startDate}</p>
                      )}
                      {med.notes && (
                        <p className="text-xs text-gray-500 italic">{med.notes}</p>
                      )}
                      <button
                        onClick={() => toggleActive(med)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Power className="h-3.5 w-3.5" />
                        Deactivate
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {inactiveMeds.length > 0 && (
              <>
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-gray-400">Inactive</p>
                {inactiveMeds.map((med) => (
                  <div key={med.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 opacity-60">
                    <div>
                      <span className="font-semibold text-gray-600">{med.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{med.dosage}</span>
                    </div>
                    <button
                      onClick={() => toggleActive(med)}
                      className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                    >
                      Reactivate
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── History ── */}
        {tab === "history" && (
          <div className="space-y-4">
            {days7.map((date) => {
              const dayLogs = logs.filter((l) => l.logDate === date);
              const dayDoses: { med: Medication; time: string; log: MedLog | null }[] = [];
              activeMeds.forEach((med) => {
                med.times.forEach((time) => {
                  const log = dayLogs.find((l) => l.medicationId === med.id && l.scheduledTime === time) ?? null;
                  dayDoses.push({ med, time, log });
                });
              });
              if (dayDoses.length === 0) return null;

              const given  = dayDoses.filter((d) => d.log?.status === "given").length;
              const missed = dayDoses.filter((d) => !d.log || d.log.status !== "given").length;
              const label  = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              });
              const isToday = date === today;

              return (
                <div key={date} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <span className={`text-sm font-bold ${isToday ? "text-violet-700" : "text-gray-700"}`}>
                      {isToday ? "Today" : label}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-600 font-semibold">{given} given</span>
                      {missed > 0 && <span className="text-red-500 font-semibold">{missed} missed</span>}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {dayDoses.sort((a, b) => a.time.localeCompare(b.time)).map(({ med, time, log }) => (
                      <div key={`${med.id}-${time}`} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm text-gray-700 truncate">{med.name} {med.dosage}</span>
                          <span className="shrink-0 text-xs text-gray-400">{fmtTime(time)}</span>
                        </div>
                        <span className={`ml-2 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                          log ? STATUS_STYLE[log.status] : "border-red-200 bg-red-50 text-red-600"
                        }`}>
                          {log ? log.status : "missed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddMedModal
          recipientId={rid}
          onClose={() => setShowAdd(false)}
          onSaved={load}
        />
      )}
      {logTarget && (
        <LogDoseModal
          med={logTarget.med}
          time={logTarget.time}
          existingLog={todayLogs.find(
            (l) => l.medicationId === logTarget.med.id && l.scheduledTime === logTarget.time
          ) ?? null}
          staff={staff}
          onClose={() => setLogTarget(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
