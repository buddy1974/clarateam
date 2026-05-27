"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, ClipboardList, Mail, LayoutDashboard,
  RefreshCw, LogOut, ChevronDown, CheckCircle2,
  Clock, AlertCircle, UserCheck, Inbox,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type Applicant = {
  id: number; name: string; email: string; phone: string;
  role: string; availability: string[]; experience: string;
  certifications: string; message: string; status: string;
  notes: string; createdAt: string;
};

type CareRequest = {
  id: number; contactName: string; contactEmail: string; contactPhone: string;
  facilityName: string; careType: string; hoursPerWeek: number;
  startDate: string; shiftNeeded: string[]; specialNeeds: string;
  status: string; notes: string; assignedTo: number; createdAt: string;
};

type Email = {
  id: number; sender: string; subject: string; bodyText: string;
  receivedAt: string; tag: string; isRead: boolean;
};

// ── Status helpers ─────────────────────────────────────────────────

const APPLICANT_STATUSES = [
  "applied", "screened", "interview_scheduled",
  "background_check", "active", "inactive", "rejected",
];

const REQUEST_STATUSES = ["open", "matched", "active", "closed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  applied:              "bg-blue-100 text-blue-700",
  screened:             "bg-purple-100 text-purple-700",
  interview_scheduled:  "bg-amber-100 text-amber-700",
  background_check:     "bg-orange-100 text-orange-700",
  active:               "bg-green-100 text-green-700",
  inactive:             "bg-gray-100 text-gray-600",
  rejected:             "bg-red-100 text-red-700",
  open:                 "bg-blue-100 text-blue-700",
  matched:              "bg-amber-100 text-amber-700",
  closed:               "bg-gray-100 text-gray-600",
  cancelled:            "bg-red-100 text-red-700",
};

const TAG_COLORS: Record<string, string> = {
  applicant:    "bg-purple-100 text-purple-700",
  care_request: "bg-blue-100 text-blue-700",
  general:      "bg-gray-100 text-gray-600",
};

// ── Nav tabs ───────────────────────────────────────────────────────

const TABS = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "applicants",  label: "Applicants",  icon: Users },
  { id: "requests",    label: "Care Requests", icon: ClipboardList },
  { id: "inbox",       label: "Inbox",       icon: Mail },
];

// ══════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [tab, setTab]               = useState("overview");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [requests, setRequests]     = useState<CareRequest[]>([]);
  const [emails, setEmails]         = useState<Email[]>([]);
  const [loading, setLoading]       = useState(false);
  const [syncing, setSyncing]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, r, e] = await Promise.all([
      fetch("/api/admin/applicants").then((x) => x.json()),
      fetch("/api/admin/requests").then((x) => x.json()),
      fetch("/api/admin/inbox").then((x) => x.json()),
    ]);
    if (Array.isArray(a)) setApplicants(a);
    if (Array.isArray(r)) setRequests(r);
    if (Array.isArray(e)) setEmails(e);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateApplicant(id: number, patch: Partial<Applicant>) {
    await fetch("/api/admin/applicants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    load();
  }

  async function updateRequest(id: number, patch: Partial<CareRequest>) {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    load();
  }

  async function syncInbox() {
    setSyncing(true);
    await fetch("/api/admin/sync-inbox");
    await load();
    setSyncing(false);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  // ── Stats for overview ──
  const stats = {
    applied:   applicants.filter((a) => a.status === "applied").length,
    active:    applicants.filter((a) => a.status === "active").length,
    openReqs:  requests.filter((r) => r.status === "open").length,
    unread:    emails.filter((e) => !e.isRead).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{ background: "oklch(0.30 0.14 332)" }}
            >
              C
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Clara&apos;s CareTeam</div>
              <div className="text-xs text-gray-400">Operations Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === id
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "applicants" && stats.applied > 0 && (
                <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                  {stats.applied}
                </span>
              )}
              {id === "requests" && stats.openReqs > 0 && (
                <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                  {stats.openReqs}
                </span>
              )}
              {id === "inbox" && stats.unread > 0 && (
                <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                  {stats.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "New Applications", value: stats.applied,  icon: Users,        color: "text-blue-600",   bg: "bg-blue-50" },
                { label: "Active Caregivers", value: stats.active,  icon: UserCheck,    color: "text-green-600",  bg: "bg-green-50" },
                { label: "Open Care Requests", value: stats.openReqs, icon: AlertCircle, color: "text-amber-600",  bg: "bg-amber-50" },
                { label: "Unread Emails",      value: stats.unread, icon: Inbox,        color: "text-purple-600", bg: "bg-purple-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-gray-900">{value}</div>
                  <div className="mt-0.5 text-sm text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Recent applicants */}
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Recent Applications</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {applicants.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{a.name}</div>
                      <div className="text-xs text-gray-400">{a.role} · {a.phone}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {a.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
                {applicants.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-gray-400">No applications yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICANTS PIPELINE ── */}
        {tab === "applicants" && (
          <div>
            <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">
              Applicants ({applicants.length})
            </h2>
            <div className="space-y-3">
              {applicants.map((a) => (
                <ApplicantCard key={a.id} applicant={a} onUpdate={updateApplicant} />
              ))}
              {applicants.length === 0 && (
                <p className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                  No applications yet. They&apos;ll appear here when someone submits the form.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── CARE REQUESTS ── */}
        {tab === "requests" && (
          <div>
            <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">
              Care Requests ({requests.length})
            </h2>
            <div className="space-y-3">
              {requests.map((r) => (
                <RequestCard key={r.id} request={r} applicants={applicants} onUpdate={updateRequest} />
              ))}
              {requests.length === 0 && (
                <p className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                  No care requests yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── INBOX ── */}
        {tab === "inbox" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Inbox ({emails.length})
              </h2>
              <button
                onClick={syncInbox}
                disabled={syncing}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-black shadow transition-all hover:brightness-105 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : "Sync Inbox"}
              </button>
            </div>
            <div className="space-y-2">
              {emails.map((e) => (
                <div
                  key={e.id}
                  className={`rounded-xl border p-4 ${e.isRead ? "border-gray-100 bg-white" : "border-blue-100 bg-blue-50"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!e.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                        <span className="truncate text-sm font-semibold text-gray-900">{e.subject || "(no subject)"}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">{e.sender}</div>
                      {e.bodyText && (
                        <p className="mt-2 line-clamp-2 text-xs text-gray-600">{e.bodyText}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TAG_COLORS[e.tag] ?? "bg-gray-100 text-gray-600"}`}>
                        {e.tag}
                      </span>
                      <div className="mt-1 text-[10px] text-gray-400">
                        {e.receivedAt ? new Date(e.receivedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {emails.length === 0 && (
                <p className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                  Click &quot;Sync Inbox&quot; to pull emails from info@claracareteam.com
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Applicant Card ─────────────────────────────────────────────────

function ApplicantCard({
  applicant: a,
  onUpdate,
}: {
  applicant: Applicant;
  onUpdate: (id: number, patch: Partial<Applicant>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(a.notes ?? "");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
            style={{ background: "oklch(0.30 0.14 332)" }}
          >
            {a.name[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{a.name}</div>
            <div className="text-xs text-gray-400">{a.role} · {a.phone}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"}`}>
            {a.status.replace(/_/g, " ")}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="font-semibold text-gray-500">Email:</span> {a.email}</div>
            <div><span className="font-semibold text-gray-500">Phone:</span> {a.phone}</div>
            <div><span className="font-semibold text-gray-500">Availability:</span> {a.availability?.join(", ") || "—"}</div>
            <div><span className="font-semibold text-gray-500">Experience:</span> {a.experience || "—"}</div>
            <div><span className="font-semibold text-gray-500">Certs:</span> {a.certifications || "—"}</div>
            <div><span className="font-semibold text-gray-500">Applied:</span> {new Date(a.createdAt).toLocaleDateString()}</div>
          </div>

          {a.message && (
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <span className="font-semibold">Message: </span>{a.message}
            </div>
          )}

          {/* Status change */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Move to:</span>
            {APPLICANT_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(a.id, { status: s as Applicant["status"] })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all hover:opacity-80 ${
                  a.status === s ? STATUS_COLORS[s] : "bg-gray-100 text-gray-600"
                }`}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Internal Notes</label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
              <button
                onClick={() => onUpdate(a.id, { notes })}
                className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-black hover:brightness-105"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Request Card ───────────────────────────────────────────────────

function RequestCard({
  request: r,
  applicants,
  onUpdate,
}: {
  request: CareRequest;
  applicants: Applicant[];
  onUpdate: (id: number, patch: Partial<CareRequest>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const activeCarers = applicants.filter((a) => a.status === "active");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <ClipboardList className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{r.facilityName || r.contactName}</div>
            <div className="text-xs text-gray-400">{r.careType} · {r.contactPhone}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[r.status] ?? "bg-gray-100"}`}>
            {r.status}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="font-semibold text-gray-500">Contact:</span> {r.contactName}</div>
            <div><span className="font-semibold text-gray-500">Email:</span> {r.contactEmail}</div>
            <div><span className="font-semibold text-gray-500">Care type:</span> {r.careType}</div>
            <div><span className="font-semibold text-gray-500">Hours/week:</span> {r.hoursPerWeek || "—"}</div>
            <div><span className="font-semibold text-gray-500">Start date:</span> {r.startDate || "—"}</div>
            <div><span className="font-semibold text-gray-500">Shifts:</span> {r.shiftNeeded?.join(", ") || "—"}</div>
          </div>

          {r.specialNeeds && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="font-semibold">Special needs: </span>{r.specialNeeds}
            </div>
          )}

          {/* Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Status:</span>
            {REQUEST_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(r.id, { status: s as CareRequest["status"] })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all hover:opacity-80 ${
                  r.status === s ? STATUS_COLORS[s] : "bg-gray-100 text-gray-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Assign caregiver */}
          {activeCarers.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                <CheckCircle2 className="mr-1 inline h-3 w-3 text-green-500" />
                Assign Active Caregiver
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdate(r.id, { assignedTo: parseInt(e.target.value), status: "matched" });
                    }
                  }}
                >
                  <option value="">Select caregiver…</option>
                  {activeCarers.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
