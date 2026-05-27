"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, CheckCircle2, Pill, ClipboardList,
  Calendar, Loader2, ExternalLink,
} from "lucide-react";

interface Alert {
  id:              number;
  type:            string;
  severity:        string;
  careRecipientId: number | null;
  shiftId:         number | null;
  message:         string | null;
  resolved:        boolean;
  createdAt:       string;
  recipientName:   string | null;
}

const TYPE_ICON: Record<string, typeof AlertTriangle> = {
  medication_missed: Pill,
  task_skipped:      ClipboardList,
  shift_missing:     Calendar,
};

const SEVERITY_COLOR: Record<string, string> = {
  high:   "border-red-200 bg-red-50",
  medium: "border-orange-200 bg-orange-50",
  low:    "border-yellow-200 bg-yellow-50",
};

const SEVERITY_BADGE: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low:    "bg-yellow-100 text-yellow-700",
};

const SEVERITY_ICON: Record<string, string> = {
  high:   "text-red-500",
  medium: "text-orange-500",
  low:    "text-yellow-500",
};

function formatType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"unresolved" | "all">("unresolved");
  const [resolving, setResolving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const url = tab === "unresolved"
      ? "/api/admin/alerts?resolved=false"
      : "/api/admin/alerts";
    const res = await fetch(url);
    if (res.ok) setAlerts(await res.json());
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: number) {
    setResolving(id);
    await fetch("/api/admin/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resolved: true }),
    });
    setResolving(null);
    load();
  }

  async function resolveAll() {
    const unresolved = alerts.filter((a) => !a.resolved);
    await Promise.all(
      unresolved.map((a) =>
        fetch("/api/admin/alerts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: a.id, resolved: true }),
        })
      )
    );
    load();
  }

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500">
            {unresolvedCount > 0
              ? `${unresolvedCount} unresolved alert${unresolvedCount > 1 ? "s" : ""}`
              : "All clear"}
          </p>
        </div>
        {unresolvedCount > 0 && tab === "unresolved" && (
          <button
            onClick={resolveAll}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 min-h-[44px]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Resolve All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
        {([
          { key: "unresolved", label: "Unresolved" },
          { key: "all",        label: "All" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
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
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-300" />
          <p className="mt-3 text-sm text-gray-400">
            {tab === "unresolved" ? "No unresolved alerts. ✅" : "No alerts recorded."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon     = TYPE_ICON[alert.type] ?? AlertTriangle;
            const cardCls  = alert.resolved
              ? "border-gray-100 bg-gray-50"
              : (SEVERITY_COLOR[alert.severity] ?? "border-gray-200 bg-white");
            const iconCls  = alert.resolved ? "text-gray-300" : (SEVERITY_ICON[alert.severity] ?? "text-gray-400");

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border px-4 py-3.5 ${cardCls} ${alert.resolved ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconCls}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatType(alert.type)}
                      </span>
                      {!alert.resolved && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_BADGE[alert.severity] ?? "bg-gray-100 text-gray-600"}`}>
                          {alert.severity}
                        </span>
                      )}
                      {alert.resolved && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          resolved
                        </span>
                      )}
                    </div>

                    {alert.recipientName && (
                      <p className="mt-0.5 text-xs font-medium text-gray-600">{alert.recipientName}</p>
                    )}
                    {alert.message && (
                      <p className="mt-0.5 text-xs text-gray-500">{alert.message}</p>
                    )}
                    <p className="mt-1 text-[10px] text-gray-400">{timeAgo(alert.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {!alert.resolved && (
                      <button
                        onClick={() => resolve(alert.id)}
                        disabled={resolving === alert.id}
                        className="flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {resolving === alert.id ? "…" : "Resolve"}
                      </button>
                    )}
                    {alert.careRecipientId && (
                      <a
                        href={`/admin/recipients/${alert.careRecipientId}`}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50"
                      >
                        <ExternalLink className="h-3 w-3" /> Patient
                      </a>
                    )}
                    {alert.shiftId && (
                      <a
                        href="/admin/shifts"
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50"
                      >
                        <ExternalLink className="h-3 w-3" /> Shift
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
