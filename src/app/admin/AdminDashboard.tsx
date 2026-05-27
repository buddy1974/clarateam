"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, ClipboardList, Mail, LayoutDashboard,
  RefreshCw, LogOut, ChevronDown, CheckCircle2,
  AlertCircle, UserCheck, Inbox, Phone, Search,
  X, ChevronRight, Circle,
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

// ── Constants ──────────────────────────────────────────────────────

const APPLICANT_STATUSES = [
  "applied", "screened", "interview_scheduled",
  "background_check", "active", "inactive", "rejected",
] as const;

const REQUEST_STATUSES = ["open", "matched", "active", "closed", "cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  applied:              "bg-blue-100 text-blue-700",
  screened:             "bg-purple-100 text-purple-700",
  interview_scheduled:  "bg-amber-100 text-amber-700",
  background_check:     "bg-orange-100 text-orange-700",
  active:               "bg-green-100 text-green-700",
  inactive:             "bg-gray-100 text-gray-500",
  rejected:             "bg-red-100 text-red-700",
  open:                 "bg-blue-100 text-blue-700",
  matched:              "bg-amber-100 text-amber-700",
  closed:               "bg-gray-100 text-gray-500",
  cancelled:            "bg-red-100 text-red-700",
};

const TAG_COLORS: Record<string, string> = {
  applicant:    "bg-purple-100 text-purple-700",
  care_request: "bg-blue-100 text-blue-700",
  general:      "bg-gray-100 text-gray-500",
};

const TABS = [
  { id: "overview",   label: "Overview",  icon: LayoutDashboard },
  { id: "applicants", label: "Applicants", icon: Users },
  { id: "requests",   label: "Requests",  icon: ClipboardList },
  { id: "inbox",      label: "Inbox",     icon: Mail },
] as const;

type TabId = typeof TABS[number]["id"];

// ══════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [tab, setTab]               = useState<TabId>("overview");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [requests, setRequests]     = useState<CareRequest[]>([]);
  const [emails, setEmails]         = useState<Email[]>([]);
  const [loading, setLoading]       = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [search, setSearch]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, r, e] = await Promise.all([
        fetch("/api/admin/applicants").then((x) => x.json()),
        fetch("/api/admin/requests").then((x) => x.json()),
        fetch("/api/admin/inbox").then((x) => x.json()),
      ]);
      if (Array.isArray(a)) setApplicants(a);
      if (Array.isArray(r)) setRequests(r);
      if (Array.isArray(e)) setEmails(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Clear search when switching tabs
  useEffect(() => { setSearch(""); }, [tab]);

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

  async function markEmailRead(id: number) {
    await fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, isRead: true } : e));
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

  // ── Derived stats ──
  const stats = {
    applied:  applicants.filter((a) => a.status === "applied").length,
    active:   applicants.filter((a) => a.status === "active").length,
    openReqs: requests.filter((r) => r.status === "open").length,
    unread:   emails.filter((e) => !e.isRead).length,
  };

  // ── Filtered lists ──
  const q = search.toLowerCase();
  const filteredApplicants = q
    ? applicants.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.phone.includes(q)
      )
    : applicants;

  const filteredRequests = q
    ? requests.filter((r) =>
        (r.facilityName ?? "").toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.careType.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      )
    : requests;

  const filteredEmails = q
    ? emails.filter((e) =>
        e.sender.toLowerCase().includes(q) ||
        (e.subject ?? "").toLowerCase().includes(q) ||
        (e.bodyText ?? "").toLowerCase().includes(q)
      )
    : emails;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{ background: "oklch(0.30 0.14 332)" }}
            >
              C
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-gray-900">Clara&apos;s CareTeam</div>
              <div className="text-xs text-gray-400">Operations</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desktop tab nav */}
        <div className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 md:flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabButton
              key={id}
              id={id}
              label={label}
              Icon={Icon}
              active={tab === id}
              badge={
                id === "applicants" ? stats.applied :
                id === "requests"   ? stats.openReqs :
                id === "inbox"      ? stats.unread : 0
              }
              badgeColor={
                id === "applicants" ? "bg-blue-100 text-blue-700" :
                id === "requests"   ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }
              onClick={() => setTab(id)}
            />
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

        {/* Search bar (shown on applicants / requests / inbox tabs) */}
        {tab !== "overview" && (
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "applicants" ? "Search by name, role, status…" :
                tab === "requests"   ? "Search by facility, care type…" :
                "Search emails…"
              }
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h2 className="mb-5 font-serif text-2xl font-bold text-gray-900">Overview</h2>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "New Applications", value: stats.applied,  icon: Users,        color: "text-blue-600",   bg: "bg-blue-50",   onClick: () => setTab("applicants") },
                { label: "Active Caregivers", value: stats.active,  icon: UserCheck,    color: "text-green-600",  bg: "bg-green-50",  onClick: () => setTab("applicants") },
                { label: "Open Requests",     value: stats.openReqs, icon: AlertCircle, color: "text-amber-600",  bg: "bg-amber-50",  onClick: () => setTab("requests") },
                { label: "Unread Emails",     value: stats.unread,  icon: Inbox,        color: "text-purple-600", bg: "bg-purple-50", onClick: () => setTab("inbox") },
              ].map(({ label, value, icon: Icon, color, bg, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-left transition-all hover:shadow-md active:scale-95"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-gray-900">{value}</div>
                  <div className="mt-0.5 text-xs text-gray-500 leading-snug">{label}</div>
                  <ChevronRight className="mt-2 h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              ))}
            </div>

            {/* Pipeline summary */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h3 className="font-semibold text-gray-900">Applicant Pipeline</h3>
                <button onClick={() => setTab("applicants")} className="text-xs text-amber-600 font-semibold hover:underline">
                  View all
                </button>
              </div>
              <div className="flex overflow-x-auto divide-x divide-gray-50">
                {APPLICANT_STATUSES.map((s) => {
                  const count = applicants.filter((a) => a.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => { setTab("applicants"); setSearch(s.replace(/_/g, " ")); }}
                      className="flex min-w-[90px] flex-col items-center py-4 px-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[s]}`}>
                        {count}
                      </span>
                      <span className="mt-1.5 text-[10px] text-gray-400 text-center leading-tight">
                        {s.replace(/_/g, " ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent applicants */}
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h3 className="font-semibold text-gray-900">Recent Applications</h3>
                <button onClick={() => setTab("applicants")} className="text-xs text-amber-600 font-semibold hover:underline">
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {applicants.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                        style={{ background: "oklch(0.30 0.14 332)" }}
                      >
                        {a.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">{a.name}</div>
                        <div className="text-xs text-gray-400">{a.role}</div>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {a.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
                {applicants.length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-gray-400">No applications yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICANTS ── */}
        {tab === "applicants" && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                Applicants{" "}
                <span className="text-base font-normal text-gray-400">
                  ({filteredApplicants.length}{filteredApplicants.length !== applicants.length ? ` of ${applicants.length}` : ""})
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {filteredApplicants.map((a) => (
                <ApplicantCard key={a.id} applicant={a} onUpdate={updateApplicant} />
              ))}
              {filteredApplicants.length === 0 && (
                <EmptyState
                  message={search ? `No applicants matching "${search}"` : "No applications yet. They'll appear here when someone submits the form."}
                />
              )}
            </div>
          </div>
        )}

        {/* ── CARE REQUESTS ── */}
        {tab === "requests" && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                Requests{" "}
                <span className="text-base font-normal text-gray-400">
                  ({filteredRequests.length}{filteredRequests.length !== requests.length ? ` of ${requests.length}` : ""})
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {filteredRequests.map((r) => (
                <RequestCard key={r.id} request={r} applicants={applicants} onUpdate={updateRequest} />
              ))}
              {filteredRequests.length === 0 && (
                <EmptyState
                  message={search ? `No requests matching "${search}"` : "No care requests yet."}
                />
              )}
            </div>
          </div>
        )}

        {/* ── INBOX ── */}
        {tab === "inbox" && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                Inbox{" "}
                <span className="text-base font-normal text-gray-400">
                  ({filteredEmails.length})
                </span>
              </h2>
              <button
                onClick={syncInbox}
                disabled={syncing}
                className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-extrabold text-black shadow transition-all hover:brightness-105 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : "Sync"}
              </button>
            </div>
            <div className="space-y-2">
              {filteredEmails.map((e) => (
                <EmailCard key={e.id} email={e} onRead={markEmailRead} />
              ))}
              {filteredEmails.length === 0 && (
                <EmptyState
                  message={search ? `No emails matching "${search}"` : 'Tap "Sync" to pull emails from info@claracareteam.com'}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const badge =
              id === "applicants" ? stats.applied :
              id === "requests"   ? stats.openReqs :
              id === "inbox"      ? stats.unread : 0;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex flex-1 flex-col items-center py-2.5 text-[10px] font-semibold transition-colors ${
                  tab === id ? "text-amber-600" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${tab === id ? "text-amber-500" : "text-gray-400"}`} />
                  {badge > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className="mt-1">{label}</span>
                {tab === id && (
                  <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function TabButton({
  id, label, Icon, active, badge, badgeColor, onClick,
}: {
  id: string; label: string; Icon: React.ElementType;
  active: boolean; badge: number; badgeColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? "border-amber-500 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge > 0 && (
        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center">
      <Circle className="mx-auto h-8 w-8 text-gray-200" />
      <p className="mt-3 text-sm text-gray-400 px-6">{message}</p>
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
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    await onUpdate(a.id, { notes });
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
            style={{ background: "oklch(0.30 0.14 332)" }}
          >
            {a.name[0]}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-gray-900">{a.name}</div>
            <div className="text-xs text-gray-400">{a.role} · {new Date(a.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 ml-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"}`}>
            {a.status.replace(/_/g, " ")}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">

          {/* Contact quick actions */}
          <div className="flex gap-2">
            <a
              href={`tel:${a.phone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
            <a
              href={`mailto:${a.email}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
            <a
              href={`sms:${a.phone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Text
            </a>
          </div>

          {/* Details grid */}
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <Detail label="Phone" value={a.phone} />
            <Detail label="Email" value={a.email} />
            <Detail label="Availability" value={a.availability?.join(", ") || "—"} />
            <Detail label="Experience" value={a.experience || "—"} />
            <Detail label="Certifications" value={a.certifications || "—"} />
          </div>

          {a.message && (
            <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
              <span className="font-semibold text-gray-500">Message: </span>{a.message}
            </div>
          )}

          {/* Status pipeline */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Move to stage</p>
            <div className="flex flex-wrap gap-1.5">
              {APPLICANT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(a.id, { status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 ${
                    a.status === s
                      ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600") + " ring-2 ring-offset-1 ring-current"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes…"
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-2 w-full rounded-xl bg-amber-400 py-2 text-xs font-bold text-black transition-all hover:brightness-105 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Notes"}
            </button>
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
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <ClipboardList className="h-4 w-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-gray-900">{r.facilityName || r.contactName}</div>
            <div className="text-xs text-gray-400">{r.careType} · {r.contactPhone}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 ml-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[r.status] ?? "bg-gray-100"}`}>
            {r.status}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">

          {/* Quick contact */}
          <div className="flex gap-2">
            <a
              href={`tel:${r.contactPhone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100"
            >
              <Phone className="h-3.5 w-3.5" /> Call {r.contactName.split(" ")[0]}
            </a>
            <a
              href={`mailto:${r.contactEmail}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          </div>

          {/* Details */}
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <Detail label="Contact" value={r.contactName} />
            <Detail label="Care type" value={r.careType} />
            <Detail label="Hours/week" value={r.hoursPerWeek ? String(r.hoursPerWeek) : "—"} />
            <Detail label="Start date" value={r.startDate || "—"} />
            <Detail label="Shifts" value={r.shiftNeeded?.join(", ") || "—"} />
          </div>

          {r.specialNeeds && (
            <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <span className="font-semibold">Special needs: </span>{r.specialNeeds}
            </div>
          )}

          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {REQUEST_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(r.id, { status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 ${
                    r.status === s
                      ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600") + " ring-2 ring-offset-1 ring-current"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Assign caregiver */}
          {activeCarers.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Assign Active Caregiver
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white"
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
          )}
        </div>
      )}
    </div>
  );
}

// ── Email Card ─────────────────────────────────────────────────────

function EmailCard({
  email: e,
  onRead,
}: {
  email: Email;
  onRead: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    setExpanded((v) => !v);
    if (!e.isRead) onRead(e.id);
  }

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${
        e.isRead ? "border-gray-100 bg-white" : "border-blue-200 bg-blue-50"
      }`}
    >
      <button className="flex w-full items-start gap-3 px-4 py-3.5 text-left" onClick={toggle}>
        <div className="mt-0.5 shrink-0">
          {!e.isRead
            ? <span className="block h-2.5 w-2.5 rounded-full bg-blue-500" />
            : <span className="block h-2.5 w-2.5 rounded-full bg-gray-200" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`truncate text-sm ${e.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>
              {e.subject || "(no subject)"}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${TAG_COLORS[e.tag] ?? "bg-gray-100 text-gray-500"}`}>
              {e.tag}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="truncate text-xs text-gray-500">{e.sender}</span>
            <span className="shrink-0 text-[10px] text-gray-400">
              {e.receivedAt ? new Date(e.receivedAt).toLocaleDateString() : ""}
            </span>
          </div>
          {!expanded && e.bodyText && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-400">{e.bodyText}</p>
          )}
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && e.bodyText && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{e.bodyText}</p>
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <span className="block text-sm text-gray-800 mt-0.5">{value}</span>
    </div>
  );
}
