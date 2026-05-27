"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, ClipboardCheck, Users, Loader2 } from "lucide-react";

interface DraftResult {
  id:        number;
  type:      string;
  status:    string;
  createdBy: string;
  createdAt: string;
  aiData:    string | null;
}

interface RecipientResult {
  id:          number;
  name:        string;
  firstName:   string | null;
  lastName:    string | null;
  status:      string;
  careNeeds:   string | null;
  createdAt:   string;
}

interface SearchResults {
  drafts:         DraftResult[];
  careRecipients: RecipientResult[];
}

const TYPE_LABELS: Record<string, string> = {
  intake:     "Care Intake",
  medication: "Medication",
  report:     "Report",
  care_plan:  "Care Plan",
  incident:   "Incident",
  shift_note: "Shift Note",
};

function patientFromDraft(d: DraftResult): string {
  if (!d.aiData) return "—";
  try {
    const p = JSON.parse(d.aiData) as Record<string, string>;
    return (p.name ?? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()) || "—";
  } catch { return "—"; }
}

export default function SearchPage() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st);
    (window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => search(v), 350);
  }

  const totalResults = (results?.drafts.length ?? 0) + (results?.careRecipients.length ?? 0);

  return (
    <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-sm text-gray-500">Search drafts and care recipients</p>
      </div>

      {/* Search input */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={handleChange}
          placeholder="Name, care type, document content…"
          autoFocus
          className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-amber-400" />
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-5">
          <p className="text-xs font-semibold text-gray-400">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          {/* Drafts */}
          {results.drafts.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Drafts ({results.drafts.length})
                </p>
              </div>
              <div className="space-y-2">
                {results.drafts.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/drafts/${d.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{patientFromDraft(d)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {TYPE_LABELS[d.type] ?? d.type} · {d.status} · #{d.id}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      d.status === "approved" ? "bg-green-100 text-green-700" :
                      d.status === "pending"  ? "bg-amber-100 text-amber-700" :
                      d.status === "rejected" ? "bg-red-100 text-red-700"    :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {d.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Care Recipients */}
          {results.careRecipients.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Care Recipients ({results.careRecipients.length})
                </p>
              </div>
              <div className="space-y-2">
                {results.careRecipients.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <p className="font-semibold text-gray-900 text-sm">
                      {r.name || `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim()}
                    </p>
                    {r.careNeeds && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.careNeeds}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">Recipient #{r.id} · {r.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">Start typing to search</p>
          <p className="text-xs text-gray-300 mt-1">Min. 2 characters</p>
        </div>
      )}
    </div>
  );
}
