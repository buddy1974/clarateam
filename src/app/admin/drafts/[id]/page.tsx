"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Pencil,
  ShieldCheck, AlertTriangle, Loader2, ClipboardCheck,
} from "lucide-react";

type DraftStatus = "draft" | "pending" | "approved" | "rejected";
type Action      = "pending" | "approve" | "reject" | "edit" | "edit_approve";

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

interface AuditLog {
  id:          number;
  action:      string;
  performedBy: string;
  meta:        string | null;
  timestamp:   string;
}

interface StructuredData {
  name?:            string;
  firstName?:       string;
  lastName?:        string;
  dateOfBirth?:     string;
  gender?:          string;
  address?:         string;
  emergencyContact?: string;
  careNeeds?:       string;
  notes?:           string;
  detectedType?:    string;
  confidence?:      number;
  [key: string]:    unknown;
}

const STATUS_STYLE: Record<DraftStatus, string> = {
  draft:    "bg-gray-100 text-gray-600",
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

const FIELD_LABELS: [keyof StructuredData, string][] = [
  ["firstName",       "First Name"],
  ["lastName",        "Last Name"],
  ["dateOfBirth",     "Date of Birth"],
  ["gender",          "Gender"],
  ["address",         "Address"],
  ["emergencyContact","Emergency Contact"],
  ["careNeeds",       "Care Needs"],
  ["notes",           "Notes"],
];

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function DraftDetailPage() {
  const router   = useRouter();
  const { id }   = useParams<{ id: string }>();
  const draftId  = parseInt(id, 10);

  const [draft,     setDraft]     = useState<Draft | null>(null);
  const [logs,      setLogs]      = useState<AuditLog[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [editData,  setEditData]  = useState<StructuredData>({});
  const [rejReason, setRejReason] = useState("");
  const [showReject,setShowReject]= useState(false);
  const [acting,    setActing]    = useState<Action | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [dRes, aRes] = await Promise.all([
      fetch("/api/admin/drafts"),
      fetch(`/api/admin/audit-logs?entityType=draft&entityId=${draftId}`),
    ]);
    if (dRes.ok) {
      const all: Draft[] = await dRes.json();
      const found = all.find((d) => d.id === draftId) ?? null;
      setDraft(found);
      if (found?.aiData) {
        try { setEditData(JSON.parse(found.aiData)); } catch { /* ignore */ }
      }
    }
    if (aRes.ok) setLogs(await aRes.json());
    setLoading(false);
  }, [draftId]);

  useEffect(() => { load(); }, [load]);

  async function act(action: Action) {
    if (!draft) return;
    setActing(action);
    setError(null);
    try {
      const body: Record<string, unknown> = { id: draftId, action };
      if (action === "reject")                  body.rejectReason = rejReason;
      if (action === "edit" || action === "edit_approve") body.aiData = editData;
      const res = await fetch("/api/admin/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      if (action === "approve" || action === "edit_approve") {
        setTimeout(() => router.push("/admin/drafts"), 800);
      } else {
        await load();
        setShowReject(false);
        setEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-gray-500">Draft not found.</p>
        <button onClick={() => router.push("/admin/drafts")} className="mt-4 text-sm text-amber-600 underline">
          Back to Drafts
        </button>
      </div>
    );
  }

  const rawParsed: Record<string, unknown> = (() => {
    try { return draft.rawData ? JSON.parse(draft.rawData) : {}; } catch { return {}; }
  })();

  const isApproved = draft.status === "approved";
  const isRejected = draft.status === "rejected";
  const isDone     = isApproved || isRejected;

  const fullName = (
    editData.name ??
    `${editData.firstName ?? ""} ${editData.lastName ?? ""}`.trim()
  ) || "Unknown";

  return (
    <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto">

      {/* Back */}
      <button
        onClick={() => router.push("/admin/drafts")}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Drafts
      </button>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-xl font-bold text-gray-900">{fullName}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[draft.status]}`}>
              {draft.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Draft #{draft.id} · {draft.type} · v{draft.version} · by {draft.createdBy} · {fmt(draft.createdAt)}
          </p>
        </div>

        {/* Role: operator edits, validator approves */}
        {!isDone && (
          <div className="flex flex-wrap gap-2">
            {draft.status === "draft" && !editing && (
              <button
                onClick={() => act("pending")}
                disabled={!!acting}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50 min-h-[44px]"
              >
                {acting === "pending" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                Submit for Review
              </button>
            )}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 min-h-[44px]"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {draft.status === "pending" && !editing && (
              <>
                <button
                  onClick={() => act("approve")}
                  disabled={!!acting}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                  style={{ background: "oklch(0.50 0.18 150)" }}
                >
                  {acting === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 min-h-[44px]"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Approved banner */}
      {isApproved && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Approved — Care Record Created</p>
            {draft.relatedEntityId && (
              <p className="text-xs text-green-600">Care Recipient ID: #{draft.relatedEntityId}</p>
            )}
          </div>
        </div>
      )}

      {/* Rejected banner */}
      {isRejected && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-700">Draft was rejected</p>
        </div>
      )}

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReject(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl">
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Reject Draft</h2>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Reason (optional)</label>
            <textarea
              value={rejReason}
              onChange={(e) => setRejReason(e.target.value)}
              placeholder="Missing information, duplicate entry…"
              rows={3}
              className={`${inp} resize-none mb-4`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => act("reject")}
                disabled={!!acting}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
                style={{ background: "oklch(0.55 0.22 25)" }}
              >
                {acting === "reject" ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Left: Raw data */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Raw Extracted Text
            </p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
              {(rawParsed.rawText as string) || draft.rawData || "—"}
            </pre>
          </div>

          {/* AI Summary */}
          {rawParsed.aiSummary && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                AI Summary
              </p>
              <p className="text-sm text-amber-800">{rawParsed.aiSummary as string}</p>
            </div>
          )}
        </div>

        {/* Right: AI-structured data (editable) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Structured Data {editing && <span className="text-amber-600">(Editing)</span>}
            </p>
          </div>

          {editing ? (
            <div className="space-y-3">
              {FIELD_LABELS.map(([key, label]) => (
                <div key={key as string}>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
                  {key === "careNeeds" || key === "notes" ? (
                    <textarea
                      value={(editData[key] as string) ?? ""}
                      onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      rows={2}
                      className={`${inp} resize-none`}
                    />
                  ) : (
                    <input
                      value={(editData[key] as string) ?? ""}
                      onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      className={inp}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => act("edit")}
                  disabled={!!acting}
                  className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                  style={{ background: "oklch(0.55 0.18 260)" }}
                >
                  {acting === "edit" ? "Saving…" : "Save Edit"}
                </button>
                {draft.status === "pending" && (
                  <button
                    onClick={() => act("edit_approve")}
                    disabled={!!acting}
                    className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                    style={{ background: "oklch(0.50 0.18 150)" }}
                  >
                    {acting === "edit_approve" ? "Approving…" : "Edit + Approve"}
                  </button>
                )}
                <button
                  onClick={() => { setEditing(false); if (draft.aiData) try { setEditData(JSON.parse(draft.aiData)); } catch { /**/ } }}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {FIELD_LABELS.map(([key, label]) => {
                const val = editData[key];
                if (!val) return null;
                return (
                  <div key={key as string} className="flex gap-2 text-sm">
                    <span className="w-36 shrink-0 text-xs font-semibold text-gray-400">{label}</span>
                    <span className="text-gray-800 break-words">{val as string}</span>
                  </div>
                );
              })}
              {Object.values(editData).every((v) => !v) && (
                <p className="text-sm text-gray-400">No structured data extracted.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck className="h-4 w-4 text-gray-400" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Trail</p>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No audit entries yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <span className="text-xs text-gray-400 w-36 shrink-0">{fmt(log.timestamp)}</span>
                <span className="font-semibold text-gray-700 capitalize">{log.action}</span>
                <span className="text-gray-400">by {log.performedBy}</span>
                {log.meta && (() => {
                  try {
                    const m = JSON.parse(log.meta) as Record<string, unknown>;
                    if (m.careRecipientId) return (
                      <span className="text-xs text-green-600">→ Recipient #{m.careRecipientId as number}</span>
                    );
                  } catch { /**/ }
                  return null;
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
