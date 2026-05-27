"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Pill,
  RefreshCw, User, ClipboardList, Loader2, Calendar,
} from "lucide-react";

interface MedSlot {
  medId:   number;
  name:    string;
  dosage:  string;
  time:    string;
  log:     { status: string } | null;
}

interface TaskItem {
  id:    number;
  title: string;
  log:   { status: string } | null;
}

interface ShiftData {
  id:          number;
  staffId:     number;
  recipientId: number | null;
  shiftDate:   string;
  startTime:   string;
  endTime:     string;
  hours:       string | null;
  status:      string;
  notes:       string | null;
  staffMember: { id: number; name: string; role: string } | null;
  recipient:   { id: number; name: string; careLevel: string | null } | null;
  tasks: {
    total: number; done: number; skipped: number; pending: number;
    items: TaskItem[];
  };
  medications: {
    total: number; given: number; missed: number; pending: number;
    items: MedSlot[];
  };
}

interface OpsData {
  date:   string;
  stats:  {
    totalShifts: number; activeShifts: number; totalPatients: number;
    tasksDone: number; tasksPending: number;
    medsGiven: number; medsPending: number;
    unresolvedAlerts: number;
  };
  shifts: ShiftData[];
  alerts: { id: number; type: string; severity: string; message: string | null; createdAt: string }[];
  recipientsNoShift: number[];
}

const STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-blue-50 border-blue-200",
  confirmed: "bg-amber-50 border-amber-200",
  active:    "bg-green-50 border-green-200",
  completed: "bg-gray-50 border-gray-200",
  cancelled: "bg-red-50 border-red-200",
  missed:    "bg-rose-50 border-rose-200",
};

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-blue-400",
  confirmed: "bg-amber-400",
  active:    "bg-green-400",
  completed: "bg-gray-400",
  cancelled: "bg-red-400",
  missed:    "bg-rose-400",
};

const MED_STATUS_COLOR: Record<string, string> = {
  given:   "bg-green-100 text-green-700",
  missed:  "bg-red-100 text-red-700",
  refused: "bg-orange-100 text-orange-700",
  held:    "bg-gray-100 text-gray-600",
};

export default function OperationsPage() {
  const [data, setData]       = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate]       = useState(new Date().toLocaleDateString("en-CA"));

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/operations?date=${date}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, shifts, alerts } = data;

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Operations</h1>
          <p className="text-sm text-gray-500">Daily command center</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-amber-400"
          />
          <button
            onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {stats.unresolvedAlerts > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">
              {stats.unresolvedAlerts} unresolved alert{stats.unresolvedAlerts > 1 ? "s" : ""}
            </p>
          </div>
          <a
            href="/admin/alerts"
            className="shrink-0 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
          >
            View
          </a>
        </div>
      )}

      {/* Stats bar */}
      <div className="mb-5 grid grid-cols-4 gap-2">
        {[
          { label: "Shifts",    value: stats.totalShifts,  icon: Calendar,      color: "text-blue-600" },
          { label: "Patients",  value: stats.totalPatients, icon: User,         color: "text-purple-600" },
          { label: "Tasks ✓",  value: stats.tasksDone,    icon: ClipboardList, color: "text-green-600" },
          { label: "Meds ✓",   value: stats.medsGiven,    icon: Pill,          color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <Icon className={`mx-auto h-4 w-4 ${color}`} />
            <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
            <div className="text-[10px] font-semibold text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending counts */}
      {(stats.tasksPending > 0 || stats.medsPending > 0) && (
        <div className="mb-4 flex gap-2">
          {stats.tasksPending > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              <ClipboardList className="h-3.5 w-3.5" />
              {stats.tasksPending} tasks pending
            </div>
          )}
          {stats.medsPending > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
              <Pill className="h-3.5 w-3.5" />
              {stats.medsPending} meds pending
            </div>
          )}
        </div>
      )}

      {/* Shifts */}
      {shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <Activity className="mx-auto h-8 w-8 text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">No shifts scheduled for {date}.</p>
          <a href="/admin/shifts" className="mt-3 inline-block text-xs font-bold text-amber-600 underline">
            Add a shift →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} onRefresh={load} />
          ))}
        </div>
      )}

      {/* Recent alerts */}
      {alerts.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-serif text-base font-bold text-gray-900">Recent Alerts</h2>
          <div className="space-y-1.5">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${alert.severity === "high" ? "text-red-500" : "text-orange-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-800">{alert.type.replace(/_/g, " ")}</p>
                  {alert.message && <p className="text-xs text-red-600 truncate">{alert.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftCard({ shift, onRefresh }: { shift: ShiftData; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(shift.status === "active");
  const cardClass = STATUS_COLOR[shift.status] ?? "bg-white border-gray-200";
  const dotClass  = STATUS_DOT[shift.status]  ?? "bg-gray-400";

  async function updateStatus(status: string) {
    await fetch("/api/admin/shifts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: shift.id, status }),
    });
    onRefresh();
  }

  const taskPct = shift.tasks.total > 0
    ? Math.round((shift.tasks.done / shift.tasks.total) * 100)
    : 0;

  const medPct = shift.medications.total > 0
    ? Math.round((shift.medications.given / shift.medications.total) * 100)
    : 0;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden`}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-4 text-left ${cardClass}`}
      >
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-gray-900">
                {shift.staffMember?.name ?? `Staff #${shift.staffId}`}
              </span>
              {shift.staffMember?.role && (
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                  {shift.staffMember.role}
                </span>
              )}
              <span className="ml-auto text-xs font-semibold text-gray-500">
                {shift.startTime} – {shift.endTime}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
              {shift.recipient ? (
                <span className="font-medium">→ {shift.recipient.name}</span>
              ) : (
                <span className="text-gray-400">No patient assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress mini-bars */}
        {shift.recipient && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {shift.tasks.total > 0 && (
              <div>
                <div className="mb-1 flex justify-between text-[10px] font-semibold text-gray-500">
                  <span>Tasks</span>
                  <span>{shift.tasks.done}/{shift.tasks.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-green-400 transition-all"
                    style={{ width: `${taskPct}%` }}
                  />
                </div>
              </div>
            )}
            {shift.medications.total > 0 && (
              <div>
                <div className="mb-1 flex justify-between text-[10px] font-semibold text-gray-500">
                  <span>Meds</span>
                  <span>{shift.medications.given}/{shift.medications.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-amber-400 transition-all"
                    style={{ width: `${medPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 space-y-4">

          {/* Task list */}
          {shift.tasks.total > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Tasks ({shift.tasks.done}/{shift.tasks.total} done)
              </p>
              <div className="space-y-1">
                {shift.tasks.items.map((task) => {
                  const status = task.log?.status ?? "pending";
                  return (
                    <div key={task.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${
                        status === "done"    ? "bg-green-400" :
                        status === "skipped" ? "bg-orange-400" : "bg-gray-200"
                      }`} />
                      <span className={`flex-1 text-xs ${status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {task.title}
                      </span>
                      {status !== "pending" && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          status === "done"    ? "bg-green-100 text-green-700" :
                          status === "skipped" ? "bg-orange-100 text-orange-700" : ""
                        }`}>
                          {status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Medication list */}
          {shift.medications.total > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Medications ({shift.medications.given}/{shift.medications.total} given)
              </p>
              <div className="space-y-1">
                {shift.medications.items.map((slot, i) => {
                  const logStatus = slot.log?.status ?? "pending";
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                      <Pill className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-700">{slot.name}</span>
                        <span className="ml-1.5 text-xs text-gray-400">{slot.dosage}</span>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">{slot.time}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        MED_STATUS_COLOR[logStatus] ?? "bg-gray-100 text-gray-500"
                      }`}>
                        {logStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status actions */}
          <div className="flex gap-2 pt-1">
            {shift.status === "scheduled" && (
              <button
                onClick={() => updateStatus("active")}
                className="flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-600 min-h-[44px]"
              >
                ▶ Start Shift
              </button>
            )}
            {shift.status === "active" && (
              <button
                onClick={() => updateStatus("completed")}
                className="flex items-center gap-1.5 rounded-xl bg-gray-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-gray-900 min-h-[44px]"
              >
                <CheckCircle2 className="h-4 w-4" /> Complete Shift
              </button>
            )}
            {(shift.status === "scheduled" || shift.status === "active") && (
              <button
                onClick={() => updateStatus("cancelled")}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 min-h-[44px]"
              >
                Cancel
              </button>
            )}
            {shift.recipient && (
              <a
                href={`/admin/recipients/${shift.recipientId}`}
                className="ml-auto flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 min-h-[44px]"
              >
                <User className="h-3.5 w-3.5" /> Patient
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
