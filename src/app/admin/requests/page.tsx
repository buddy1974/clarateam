"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Search, X, ChevronDown, Phone, Mail, CheckCircle2,
} from "lucide-react";

type CareRequest = {
  id: number; contactName: string; contactEmail: string; contactPhone: string;
  facilityName: string | null; careType: string; hoursPerWeek: number | null;
  startDate: string | null; shiftNeeded: string[]; specialNeeds: string | null;
  status: string; notes: string | null; assignedTo: number | null; createdAt: string;
};
type StaffMember = { id: number; name: string; role: string; status: string; };

const REQUEST_STATUSES = ["open", "matched", "active", "closed", "cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  open:      "bg-blue-100 text-blue-700",
  matched:   "bg-amber-100 text-amber-700",
  active:    "bg-green-100 text-green-700",
  closed:    "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [r, s] = await Promise.all([
      fetch("/api/admin/requests").then((x) => x.json()),
      fetch("/api/admin/staff").then((x) => x.json()),
    ]);
    if (Array.isArray(r)) setRequests(r);
    if (Array.isArray(s)) setStaff(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function update(id: number, patch: Partial<CareRequest>) {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    load();
  }

  const q = search.toLowerCase();
  const filtered = q
    ? requests.filter((r) =>
        (r.facilityName ?? "").toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.careType.toLowerCase().includes(q) ||
        r.status.includes(q)
      )
    : requests;

  const openCount = requests.filter((r) => r.status === "open").length;

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Care Requests</h1>
        <p className="text-sm text-gray-500">{requests.length} total · {openCount} open</p>
      </div>

      {/* Status bar */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {REQUEST_STATUSES.map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          return (
            <span key={s} className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[s]}`}>
              {count} {s}
            </span>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by facility, care type, status…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} staff={staff} onUpdate={update} />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">
                {search ? `No requests matching "${search}"` : "No care requests yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request: r,
  staff,
  onUpdate,
}: {
  request: CareRequest;
  staff: StaffMember[];
  onUpdate: (id: number, patch: Partial<CareRequest>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const activeStaff = staff.filter((s) => s.status === "active");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <ClipboardList className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate">{r.facilityName || r.contactName}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[r.status] ?? "bg-gray-100"}`}>
              {r.status}
            </span>
          </div>
          <div className="text-xs text-gray-400">{r.careType} · {r.contactPhone}</div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Quick contact */}
          <div className="flex gap-2">
            <a href={`tel:${r.contactPhone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100">
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
            <a href={`mailto:${r.contactEmail}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          </div>

          {/* Details */}
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {[
              ["Contact",    r.contactName],
              ["Care Type",  r.careType],
              ["Hrs/Week",   r.hoursPerWeek ? String(r.hoursPerWeek) : "—"],
              ["Start Date", r.startDate ?? "—"],
              ["Shifts",     r.shiftNeeded?.join(", ") || "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
                <span className="block text-sm text-gray-800 mt-0.5">{value}</span>
              </div>
            ))}
          </div>

          {r.specialNeeds && (
            <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <span className="font-semibold">Special needs: </span>{r.specialNeeds}
            </div>
          )}

          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {REQUEST_STATUSES.map((s) => (
                <button key={s} onClick={() => onUpdate(r.id, { status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 ${
                    r.status === s
                      ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-500") + " ring-2 ring-offset-1 ring-current"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Assign staff */}
          {activeStaff.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">
                <CheckCircle2 className="mr-1 inline h-3 w-3 text-green-500" />
                Assign Active Staff
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdate(r.id, { assignedTo: parseInt(e.target.value), status: "matched" });
                  }
                }}
              >
                <option value="">Select caregiver…</option>
                {activeStaff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
