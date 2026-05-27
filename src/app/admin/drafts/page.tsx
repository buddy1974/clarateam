"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ClipboardCheck, ChevronRight, Search, X, Loader2 } from "lucide-react";

type DraftStatus = "draft" | "pending" | "approved" | "rejected";

interface Draft {
  id:              number;
  type:            string;
  relatedEntityId: number | null;
  rawData:         string | null;
  aiData:          string | null;
  status:          DraftStatus;
  version:         number;
  createdBy:       string;
  createdAt:       string;
  updatedAt:       string;
}

const STATUS_TABS: { key: DraftStatus | "all"; label: string }[] = [
  { key: "all",      label: "All"       },
  { key: "draft",    label: "Draft"     },
  { key: "pending",  label: "Pending"   },
  { key: "approved", label: "Approved"  },
  { key: "rejected", label: "Rejected"  },
];

const STATUS_STYLE: Record<DraftStatus, string> = {
  draft:    "bg-gray-100 text-gray-600",
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_ICON: Record<DraftStatus, string> = {
  draft:    "📝",
  pending:  "⏳",
  approved: "✅",
  rejected: "❌",
};

const TYPE_LABELS: Record<string, string> = {
  intake:     "Care Intake",
  medication: "Medication",
  report:     "Report",
  care_plan:  "Care Plan",
  incident:   "Incident",
  shift_note: "Shift Note",
};

function patientName(draft: Draft): string {
  if (!draft.aiData) return "—";
  try {
    const d = JSON.parse(draft.aiData) as Record<string, string>;
    return (d.name ?? `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim()) || "—";
  } catch { return "—"; }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function DraftsPage() {
  const [allDrafts, setAllDrafts] = useState<Draft[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<DraftStatus | "all">("all");
  const [search, setSearch]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/drafts");
    if (res.ok) setAllDrafts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = search.toLowerCase();
  const filtered = allDrafts.filter((d) => {
    if (tab !== "all" && d.status !== tab) return false;
    if (!q) return true;
    const name = patientName(d).toLowerCase();
    return (
      name.includes(q) ||
      d.type.includes(q) ||
      d.createdBy.toLowerCase().includes(q)
    );
  });

  const counts: Record<string, number> = { all: allDrafts.length };
  for (const d of allDrafts) counts[d.status] = (counts[d.status] ?? 0) + 1;

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Drafts</h1>
          <p className="text-sm text-gray-500">{allDrafts.length} total · {counts.pending ?? 0} pending review</p>
        </div>
        <Link
          href="/admin/intake"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          + New Intake
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              tab === key
                ? "text-white shadow-sm"
                : "border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
            style={tab === key ? { background: "oklch(0.30 0.14 332)" } : {}}
          >
            {label}
            {counts[key] !== undefined && (
              <span className="ml-1.5 opacity-75">({counts[key]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drafts…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((draft) => (
            <Link
              key={draft.id}
              href={`/admin/drafts/${draft.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              {/* Type icon */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ background: "oklch(0.95 0.04 332)" }}
              >
                <ClipboardCheck className="h-5 w-5" style={{ color: "oklch(0.30 0.14 332)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 truncate">
                    {patientName(draft)}
                  </span>
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {TYPE_LABELS[draft.type] ?? draft.type}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[draft.status]}`}>
                    {STATUS_ICON[draft.status]} {draft.status}
                  </span>
                </div>
                <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                  <span>v{draft.version}</span>
                  <span>by {draft.createdBy}</span>
                  <span>{fmt(draft.createdAt)}</span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <ClipboardCheck className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">
                {search
                  ? `No drafts matching "${search}"`
                  : tab !== "all"
                  ? `No ${tab} drafts`
                  : "No drafts yet. Start with New Intake."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
