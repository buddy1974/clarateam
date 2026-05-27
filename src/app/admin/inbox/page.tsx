"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, RefreshCw, Search, X, ChevronDown } from "lucide-react";

type Email = {
  id: number; sender: string; subject: string | null; bodyText: string | null;
  receivedAt: string | null; tag: string | null; isRead: boolean;
};

const TAG_COLORS: Record<string, string> = {
  applicant:    "bg-purple-100 text-purple-700",
  care_request: "bg-blue-100 text-blue-700",
  general:      "bg-gray-100 text-gray-500",
};

export default function InboxPage() {
  const [emails, setEmails]   = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetch("/api/admin/inbox").then((r) => r.json());
    if (Array.isArray(rows)) setEmails(rows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function syncInbox() {
    setSyncing(true);
    await fetch("/api/admin/sync-inbox");
    await load();
    setSyncing(false);
  }

  async function markRead(id: number) {
    await fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, isRead: true } : e));
  }

  const q = search.toLowerCase();
  const filtered = q
    ? emails.filter((e) =>
        e.sender.toLowerCase().includes(q) ||
        (e.subject ?? "").toLowerCase().includes(q) ||
        (e.bodyText ?? "").toLowerCase().includes(q)
      )
    : emails;

  const unread = emails.filter((e) => !e.isRead).length;

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500">{emails.length} emails · {unread} unread</p>
        </div>
        <button
          onClick={syncInbox}
          disabled={syncing}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-black shadow transition-all hover:brightness-105 disabled:opacity-50"
          style={{ background: "oklch(0.74 0.14 75)" }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Inbox"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emails…"
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
        <div className="space-y-2">
          {filtered.map((e) => (
            <EmailCard key={e.id} email={e} onRead={markRead} />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <Mail className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">
                {search
                  ? `No emails matching "${search}"`
                  : 'Tap "Sync Inbox" to pull emails from info@claracareteam.com'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmailCard({ email: e, onRead }: { email: Email; onRead: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    setExpanded((v) => !v);
    if (!e.isRead) onRead(e.id);
  }

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${
      e.isRead ? "border-gray-100 bg-white" : "border-blue-200 bg-blue-50"
    }`}>
      <button className="flex w-full items-start gap-3 px-4 py-3.5 text-left" onClick={toggle}>
        <div className="mt-1 shrink-0">
          {!e.isRead
            ? <span className="block h-2.5 w-2.5 rounded-full bg-blue-500" />
            : <span className="block h-2.5 w-2.5 rounded-full bg-gray-200" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`truncate text-sm ${e.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>
              {e.subject || "(no subject)"}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${TAG_COLORS[e.tag ?? "general"] ?? "bg-gray-100 text-gray-500"}`}>
              {e.tag ?? "general"}
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
