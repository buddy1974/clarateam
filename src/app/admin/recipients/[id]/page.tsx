"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Save, X, Plus, Loader2,
  CheckCircle, XCircle, AlertTriangle, Clock,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface Recipient {
  id: number; name: string; firstName: string | null; lastName: string | null;
  gender: string | null; dateOfBirth: string | null; address: string | null;
  careLevel: string | null; careNeeds: string | null; status: string;
  riskFlags: string[]; emergencyContactName: string | null;
  emergencyContactPhone: string | null; notes: string | null;
  carePlanId: number | null; active: boolean; createdAt: string;
}
interface CarePlan {
  id: number; careRecipientId: number | null; notes: string | null;
  conditions: string | null; allergies: string | null; dietType: string | null;
  updatedAt: string;
}
interface Medication {
  id: number; name: string; dosage: string; frequency: string;
  route: string; times: string[]; prescriber: string | null;
  startDate: string | null; endDate: string | null; notes: string | null; active: boolean;
}
interface MedLog {
  id: number; medicationId: number; scheduledTime: string; logDate: string;
  status: string; notes: string | null;
}
interface DietPlan {
  id: number; dietType: string | null; restrictions: string | null; notes: string | null;
}
interface CareTask {
  id: number; title: string; description: string | null;
  frequency: string; active: boolean;
}
interface TaskLog {
  id: number; taskId: number; status: string; logDate: string; notes: string | null;
}
interface ActiveShift {
  id: number; staffId: number; startTime: string; endTime: string; status: string;
}

type Tab = "overview" | "careplan" | "medication" | "diet" | "tasks" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview",   label: "Overview"   },
  { key: "careplan",   label: "Care Plan"  },
  { key: "medication", label: "Medication" },
  { key: "diet",       label: "Diet"       },
  { key: "tasks",      label: "Tasks"      },
  { key: "history",    label: "History"    },
];

const CARE_LEVELS = ["companion","personal","skilled","memory","hospice"];
const DIET_TYPES  = ["regular","soft","pureed","diabetic","low-sodium","low-fat","other"];
const FREQUENCIES = ["per_shift","daily","weekly"];

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

function today() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RecipientDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const rid     = parseInt(id, 10);
  const router  = useRouter();

  const [tab,       setTab]       = useState<Tab>("overview");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [carePlan,  setCarePlan]  = useState<CarePlan | null>(null);
  const [meds,      setMeds]      = useState<Medication[]>([]);
  const [medLogs,   setMedLogs]   = useState<MedLog[]>([]);
  const [dietPlan,  setDietPlan]  = useState<DietPlan | null>(null);
  const [tasks,     setTasks]     = useState<CareTask[]>([]);
  const [taskLogs,  setTaskLogs]  = useState<TaskLog[]>([]);
  const [auditLog,   setAuditLog]   = useState<{id:number;action:string;performedBy:string;timestamp:string}[]>([]);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [loading,    setLoading]    = useState(true);

  // ── Data loaders ────────────────────────────────────────────────────────

  const loadRecipient = useCallback(async () => {
    const res = await fetch("/api/admin/care-recipients");
    if (!res.ok) return;
    const all: Recipient[] = await res.json();
    setRecipient(all.find((r) => r.id === rid) ?? null);
  }, [rid]);

  const loadCarePlan = useCallback(async () => {
    const res = await fetch(`/api/admin/care-plans?recipientId=${rid}`);
    if (res.ok) setCarePlan(await res.json());
  }, [rid]);

  const loadMeds = useCallback(async () => {
    const [mRes, lRes] = await Promise.all([
      fetch(`/api/admin/medications?recipientId=${rid}`),
      fetch(`/api/admin/medication-logs?recipientId=${rid}&date=${today()}`),
    ]);
    if (mRes.ok) setMeds(await mRes.json());
    if (lRes.ok) setMedLogs(await lRes.json());
  }, [rid]);

  const loadDiet = useCallback(async () => {
    const res = await fetch(`/api/admin/diet-plans?recipientId=${rid}`);
    if (res.ok) setDietPlan(await res.json());
  }, [rid]);

  const loadTasks = useCallback(async () => {
    const [tRes, lRes] = await Promise.all([
      fetch(`/api/admin/care-tasks?recipientId=${rid}`),
      fetch(`/api/admin/task-logs?recipientId=${rid}&date=${today()}`),
    ]);
    if (tRes.ok) setTasks(await tRes.json());
    if (lRes.ok) setTaskLogs(await lRes.json());
  }, [rid]);

  const loadAudit = useCallback(async () => {
    const res = await fetch(`/api/admin/audit-logs?entityType=care_recipient&entityId=${rid}`);
    if (res.ok) setAuditLog(await res.json());
  }, [rid]);

  const loadShift = useCallback(async () => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const res = await fetch(`/api/admin/shifts?from=${todayStr}&to=${todayStr}&recipientId=${rid}`);
    if (!res.ok) return;
    const shiftList: ActiveShift[] = await res.json();
    // Prefer active shift, then scheduled, then first available
    const active = shiftList.find((s) => s.status === "active")
      ?? shiftList.find((s) => s.status === "scheduled" || s.status === "confirmed")
      ?? shiftList[0]
      ?? null;
    setActiveShift(active);
  }, [rid]);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadRecipient();
      setLoading(false);
    })();
  }, [loadRecipient]);

  // Tab-triggered loads
  useEffect(() => {
    if (tab === "careplan")   loadCarePlan();
    if (tab === "medication") { loadMeds();  loadShift(); }
    if (tab === "diet")       loadDiet();
    if (tab === "tasks")      { loadTasks(); loadShift(); }
    if (tab === "history")    loadAudit();
  }, [tab, loadCarePlan, loadMeds, loadDiet, loadTasks, loadAudit, loadShift]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
    </div>
  );

  if (!recipient) return (
    <div className="px-4 py-6 text-center">
      <p className="text-gray-500">Recipient not found.</p>
      <button onClick={() => router.push("/admin/recipients")} className="mt-4 text-sm text-amber-600 underline">
        Back to Recipients
      </button>
    </div>
  );

  return (
    <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto">

      {/* Back */}
      <button
        onClick={() => router.push("/admin/recipients")}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Recipients
      </button>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-serif text-xl font-bold text-gray-900">{recipient.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            recipient.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {recipient.status ?? (recipient.active ? "active" : "inactive")}
          </span>
          {recipient.careLevel && (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {recipient.careLevel}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {recipient.dateOfBirth && `DOB ${fmtDate(recipient.dateOfBirth)}`}
          {recipient.gender && ` · ${recipient.gender}`}
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-5 flex overflow-x-auto scrollbar-none border-b border-gray-200 gap-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 pb-2.5 pt-1 px-4 text-sm font-semibold border-b-2 transition-all ${
              tab === key
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview"   && <OverviewTab   r={recipient} onSaved={loadRecipient} />}
      {tab === "careplan"   && <CarePlanTab   plan={carePlan} recipientId={rid} onSaved={loadCarePlan} />}
      {tab === "medication" && <MedicationTab meds={meds} logs={medLogs} recipientId={rid} shiftId={activeShift?.id ?? null} onSaved={loadMeds} />}
      {tab === "diet"       && <DietTab       plan={dietPlan} recipientId={rid} onSaved={loadDiet} />}
      {tab === "tasks"      && <TasksTab      tasks={tasks} logs={taskLogs} recipientId={rid} shiftId={activeShift?.id ?? null} onSaved={loadTasks} />}
      {tab === "history"    && <HistoryTab    logs={auditLog} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Overview
// ══════════════════════════════════════════════════════════════════════════════

function OverviewTab({ r, onSaved }: { r: Recipient; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...r });
  const [saving, setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/care-recipients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, ...form }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  const rows: [string, string][] = [
    ["Name",              r.name],
    ["Date of Birth",     r.dateOfBirth ? fmtDate(r.dateOfBirth) : "—"],
    ["Gender",            r.gender     ?? "—"],
    ["Address",           r.address    ?? "—"],
    ["Emergency Contact", r.emergencyContactName  ?? "—"],
    ["EC Phone",          r.emergencyContactPhone ?? "—"],
    ["Care Needs",        r.careNeeds  ?? "—"],
    ["Notes",             r.notes      ?? "—"],
  ];

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-3 text-sm">
            <span className="w-40 shrink-0 text-xs font-semibold text-gray-400">{label}</span>
            <span className="text-gray-800 break-words">{value}</span>
          </div>
        ))}
      </div>
      {r.riskFlags?.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
            ⚠️ Risk Flags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {r.riskFlags.map((flag) => (
              <span key={flag} className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name">
          <input value={form.firstName ?? ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inp} />
        </Field>
        <Field label="Last Name">
          <input value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inp} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of Birth">
          <input type="date" value={form.dateOfBirth ?? ""} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inp} />
        </Field>
        <Field label="Gender">
          <select value={form.gender ?? ""} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inp}>
            <option value="">—</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Care Level">
        <select value={form.careLevel ?? ""} onChange={(e) => setForm({ ...form, careLevel: e.target.value })} className={inp}>
          <option value="">—</option>
          {CARE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </Field>
      <Field label="Address">
        <input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
      </Field>
      <Field label="Care Needs">
        <textarea value={form.careNeeds ?? ""} onChange={(e) => setForm({ ...form, careNeeds: e.target.value })} rows={2} className={`${inp} resize-none`} />
      </Field>
      <Field label="Notes">
        <textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inp} resize-none`} />
      </Field>
      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}>
          {saving ? "Saving…" : <><Save className="inline h-3.5 w-3.5 mr-1" />Save</>}
        </button>
        <button onClick={() => setEditing(false)}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Care Plan
// ══════════════════════════════════════════════════════════════════════════════

function CarePlanTab({ plan, recipientId, onSaved }: { plan: CarePlan | null; recipientId: number; onSaved: () => void }) {
  const [editing, setEditing] = useState(!plan);
  const [form, setForm]       = useState({
    conditions: plan?.conditions ?? "",
    allergies:  plan?.allergies  ?? "",
    notes:      plan?.notes      ?? "",
    dietType:   plan?.dietType   ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      conditions: plan?.conditions ?? "",
      allergies:  plan?.allergies  ?? "",
      notes:      plan?.notes      ?? "",
      dietType:   plan?.dietType   ?? "",
    });
    setEditing(!plan);
  }, [plan]);

  async function save() {
    setSaving(true);
    if (plan) {
      await fetch("/api/admin/care-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, ...form }),
      });
    } else {
      await fetch("/api/admin/care-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careRecipientId: recipientId, ...form }),
      });
    }
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
          <Pencil className="h-3.5 w-3.5" /> Edit Plan
        </button>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
        {[
          ["Medical Conditions", plan?.conditions],
          ["Allergies",          plan?.allergies],
          ["Diet Type",          plan?.dietType],
          ["Notes",              plan?.notes],
        ].map(([label, value]) => (
          <div key={label as string}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label as string}</p>
            <p className="text-sm text-gray-800">{value || "—"}</p>
          </div>
        ))}
      </div>
      {plan?.updatedAt && (
        <p className="text-xs text-gray-400 text-right">
          Updated {new Date(plan.updatedAt).toLocaleDateString("en-US")}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <Field label="Medical Conditions">
        <textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })}
          rows={3} placeholder="e.g. Hypertension, Type 2 Diabetes, COPD…" className={`${inp} resize-none`} />
      </Field>
      <Field label="Allergies">
        <textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          rows={2} placeholder="e.g. Penicillin, Latex, Shellfish…" className={`${inp} resize-none`} />
      </Field>
      <Field label="Diet Type (quick ref)">
        <select value={form.dietType} onChange={(e) => setForm({ ...form, dietType: e.target.value })} className={inp}>
          <option value="">—</option>
          {DIET_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="General Notes">
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3} placeholder="Additional care plan notes…" className={`${inp} resize-none`} />
      </Field>
      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}>
          {saving ? "Saving…" : "Save Care Plan"}
        </button>
        {plan && (
          <button onClick={() => setEditing(false)}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Medication
// ══════════════════════════════════════════════════════════════════════════════

function MedicationTab({ meds, logs, recipientId, shiftId, onSaved }: {
  meds: Medication[]; logs: MedLog[]; recipientId: number; shiftId: number | null; onSaved: () => void;
}) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [logging,  setLogging]  = useState<string | null>(null); // "medId-time"
  const [form, setForm] = useState({
    name: "", dosage: "", frequency: "twice daily",
    route: "oral", times: "08:00,20:00", prescriber: "",
    startDate: today(), endDate: "", notes: "",
  });

  // Build today's MAR
  const todayDate = today();
  const mar = meds.flatMap((med) =>
    (med.times ?? []).map((time) => {
      const log = logs.find((l) => l.medicationId === med.id && l.scheduledTime === time);
      return { med, time, log, status: log?.status ?? "pending" };
    })
  ).sort((a, b) => a.time.localeCompare(b.time));

  async function logMed(medId: number, scheduledTime: string, status: string) {
    if (!shiftId) return; // blocked — no shift
    const key = `${medId}-${scheduledTime}`;
    setLogging(key);
    await fetch("/api/admin/medication-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicationId: medId, scheduledTime, logDate: todayDate, status, shiftId }),
    });
    setLogging(null);
    onSaved();
  }

  async function addMed() {
    setSaving(true);
    await fetch("/api/admin/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId,
        name:       form.name,
        dosage:     form.dosage,
        frequency:  form.frequency,
        route:      form.route,
        times:      form.times.split(",").map((t) => t.trim()).filter(Boolean),
        prescriber: form.prescriber || null,
        startDate:  form.startDate  || null,
        endDate:    form.endDate    || null,
        notes:      form.notes      || null,
      }),
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ name:"", dosage:"", frequency:"twice daily", route:"oral", times:"08:00,20:00", prescriber:"", startDate:today(), endDate:"", notes:"" });
    onSaved();
  }

  const statusStyle = (s: string) =>
    s === "given"   ? "bg-green-100 text-green-700 border-green-200" :
    s === "missed"  ? "bg-red-100 text-red-600 border-red-200" :
    s === "refused" ? "bg-orange-100 text-orange-700 border-orange-200" :
    s === "held"    ? "bg-gray-100 text-gray-600 border-gray-200" :
    "bg-amber-50 text-amber-700 border-amber-200";

  const statusIcon = (s: string) =>
    s === "given"   ? <CheckCircle className="h-3.5 w-3.5" /> :
    s === "missed"  ? <XCircle className="h-3.5 w-3.5" /> :
    s === "refused" ? <AlertTriangle className="h-3.5 w-3.5" /> :
    <Clock className="h-3.5 w-3.5" />;

  return (
    <div className="space-y-5">
      {/* No-shift accountability banner */}
      {!shiftId && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">No active shift for this patient today.</p>
            <p className="text-xs text-amber-600">Medication logging requires an assigned shift.</p>
          </div>
          <a href="/admin/shifts" className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600">
            Add Shift
          </a>
        </div>
      )}

      {/* Today's MAR */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Today&apos;s MAR — {new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}
          </p>
        </div>
        {mar.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-8 text-center">
            <p className="text-sm text-gray-400">No medications scheduled. Add one below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mar.map(({ med, time, status }) => {
              const key = `${med.id}-${time}`;
              const isLogging = logging === key;
              return (
                <div key={key}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${statusStyle(status)}`}>
                  <span className="flex items-center gap-1 shrink-0">{statusIcon(status)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{med.name} {med.dosage}</p>
                    <p className="text-xs opacity-75">{time} · {med.route}</p>
                  </div>
                  {status === "pending" && (
                    <div className="flex gap-1 shrink-0">
                      {["given","missed","refused","held"].map((s) => (
                        <button key={s} disabled={isLogging || !shiftId}
                          onClick={() => logMed(med.id, time, s)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold border transition-all disabled:opacity-50 ${
                            s === "given"   ? "border-green-300 bg-white text-green-700 hover:bg-green-100" :
                            s === "missed"  ? "border-red-300 bg-white text-red-600 hover:bg-red-100" :
                            s === "refused" ? "border-orange-300 bg-white text-orange-700 hover:bg-orange-100" :
                            "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                          }`}>
                          {isLogging ? "…" : s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Medication list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Active Medications ({meds.length})
          </p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 min-h-[44px]"
            style={{ background: "oklch(0.30 0.14 332)" }}>
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {meds.map((med) => (
            <div key={med.id} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">{med.name}</p>
                <span className="text-xs text-gray-400">{med.route}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {med.dosage} · {med.frequency}
                {med.times?.length > 0 && ` @ ${med.times.join(", ")}`}
              </p>
              {med.prescriber && <p className="text-xs text-gray-400 mt-0.5">Rx: {med.prescriber}</p>}
            </div>
          ))}
          {meds.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No medications added.</p>
          )}
        </div>
      </div>

      {/* Add medication modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Medication</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Medication Name *">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inp} placeholder="Metformin" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dosage *">
                  <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    className={inp} placeholder="500mg" />
                </Field>
                <Field label="Route">
                  <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className={inp}>
                    {["oral","topical","injection","inhaled","sublingual","rectal"].map((r) =>
                      <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Frequency">
                <input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className={inp} placeholder="twice daily" />
              </Field>
              <Field label="Schedule Times (HH:MM, comma-separated)">
                <input value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })}
                  className={inp} placeholder="08:00,20:00" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inp} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inp} />
                </Field>
              </div>
              <Field label="Prescriber">
                <input value={form.prescriber} onChange={(e) => setForm({ ...form, prescriber: e.target.value })}
                  className={inp} placeholder="Dr. Smith" />
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} className={`${inp} resize-none`} />
              </Field>
              <button onClick={addMed} disabled={saving || !form.name || !form.dosage}
                className="w-full rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                style={{ background: "oklch(0.30 0.14 332)" }}>
                {saving ? "Adding…" : "Add Medication"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Diet
// ══════════════════════════════════════════════════════════════════════════════

function DietTab({ plan, recipientId, onSaved }: { plan: DietPlan | null; recipientId: number; onSaved: () => void }) {
  const [editing, setEditing] = useState(!plan);
  const [form, setForm]       = useState({
    dietType:     plan?.dietType     ?? "",
    restrictions: plan?.restrictions ?? "",
    notes:        plan?.notes        ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ dietType: plan?.dietType ?? "", restrictions: plan?.restrictions ?? "", notes: plan?.notes ?? "" });
    setEditing(!plan);
  }, [plan]);

  async function save() {
    setSaving(true);
    if (plan) {
      await fetch("/api/admin/diet-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, ...form }),
      });
    } else {
      await fetch("/api/admin/diet-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careRecipientId: recipientId, ...form }),
      });
    }
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
          <Pencil className="h-3.5 w-3.5" /> Edit Diet
        </button>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
        {[
          ["Diet Type",     plan?.dietType],
          ["Restrictions",  plan?.restrictions],
          ["Notes",         plan?.notes],
        ].map(([label, value]) => (
          <div key={label as string}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label as string}</p>
            <p className="text-sm text-gray-800">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <Field label="Diet Type">
        <select value={form.dietType} onChange={(e) => setForm({ ...form, dietType: e.target.value })} className={inp}>
          <option value="">Select…</option>
          {DIET_TYPES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </Field>
      <Field label="Dietary Restrictions / Allergies">
        <textarea value={form.restrictions} onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
          rows={3} placeholder="No pork, no shellfish, lactose intolerant…" className={`${inp} resize-none`} />
      </Field>
      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2} placeholder="Ensure thickened liquids, small portions…" className={`${inp} resize-none`} />
      </Field>
      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}>
          {saving ? "Saving…" : "Save Diet Plan"}
        </button>
        {plan && (
          <button onClick={() => setEditing(false)}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Tasks
// ══════════════════════════════════════════════════════════════════════════════

function TasksTab({ tasks, logs, recipientId, shiftId, onSaved }: {
  tasks: CareTask[]; logs: TaskLog[]; recipientId: number; shiftId: number | null; onSaved: () => void;
}) {
  const [showAdd,  setShowAdd] = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [logging,  setLogging] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", frequency: "daily" });

  const todayDate = today();

  function taskLogToday(taskId: number) {
    return logs.find((l) => l.taskId === taskId);
  }

  async function logTask(taskId: number, status: "done" | "skipped") {
    if (!shiftId) return; // blocked — no shift
    setLogging(taskId);
    await fetch("/api/admin/task-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, careRecipientId: recipientId, status, logDate: todayDate, shiftId }),
    });
    setLogging(null);
    onSaved();
  }

  async function addTask() {
    if (!form.title.trim()) return;
    setSaving(true);
    await fetch("/api/admin/care-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ careRecipientId: recipientId, ...form }),
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ title: "", description: "", frequency: "daily" });
    onSaved();
  }

  async function archiveTask(taskId: number) {
    await fetch("/api/admin/care-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, active: false }),
    });
    onSaved();
  }

  return (
    <div className="space-y-4">
      {/* No-shift accountability banner */}
      {!shiftId && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">No active shift for this patient today.</p>
            <p className="text-xs text-amber-600">Task logging requires an assigned shift.</p>
          </div>
          <a href="/admin/shifts" className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600">
            Add Shift
          </a>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Tasks — {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}>
          <Plus className="h-3.5 w-3.5" /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">No tasks yet. Add daily or per-shift tasks.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const log      = taskLogToday(task.id);
            const isDone   = log?.status === "done";
            const isSkipped = log?.status === "skipped";
            const isLogging = logging === task.id;

            return (
              <div key={task.id}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
                  isDone    ? "border-green-200 bg-green-50" :
                  isSkipped ? "border-gray-200 bg-gray-50 opacity-70" :
                  "border-gray-200 bg-white"
                }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                      {task.frequency.replace("_", " ")}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                  )}
                </div>
                <div className="shrink-0 flex gap-1">
                  {!log ? (
                    <>
                      <button disabled={isLogging || !shiftId} onClick={() => logTask(task.id, "done")}
                        className="flex items-center gap-1 rounded-lg border border-green-300 bg-white px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-50 min-h-[44px]">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {isLogging ? "…" : "Done"}
                      </button>
                      <button disabled={isLogging || !shiftId} onClick={() => logTask(task.id, "skipped")}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50 min-h-[44px]">
                        {isLogging ? "…" : "Skip"}
                      </button>
                    </>
                  ) : (
                    <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                      isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {isDone ? <><CheckCircle className="h-3.5 w-3.5" /> Done</> : "Skipped"}
                    </span>
                  )}
                  <button onClick={() => archiveTask(task.id)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-50">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add task modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Task</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Task Title *">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inp} placeholder="Morning hygiene" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className={`${inp} resize-none`} placeholder="Assist with bathing, oral care…" />
              </Field>
              <Field label="Frequency">
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className={inp}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f.replace("_", " ")}</option>)}
                </select>
              </Field>
              <button onClick={addTask} disabled={saving || !form.title.trim()}
                className="w-full rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                style={{ background: "oklch(0.30 0.14 332)" }}>
                {saving ? "Adding…" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: History
// ══════════════════════════════════════════════════════════════════════════════

function HistoryTab({ logs }: { logs: { id: number; action: string; performedBy: string; timestamp: string }[] }) {
  if (logs.length === 0) return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
      <p className="text-sm text-gray-400">No audit history for this recipient.</p>
    </div>
  );
  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <div className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 capitalize">{log.action}</p>
            <p className="text-xs text-gray-400">by {log.performedBy}</p>
          </div>
          <p className="text-xs text-gray-400 shrink-0">
            {new Date(log.timestamp).toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
