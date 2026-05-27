"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserCircle2, Plus, Search, X, ChevronRight, Loader2 } from "lucide-react";

interface CareRecipient {
  id:                    number;
  name:                  string;
  firstName:             string | null;
  lastName:              string | null;
  gender:                string | null;
  dateOfBirth:           string | null;
  careLevel:             string | null;
  status:                string;
  active:                boolean;
  emergencyContactName:  string | null;
  emergencyContactPhone: string | null;
  careNeeds:             string | null;
  clientId:              number | null;
  createdAt:             string;
}

const CARE_LEVELS = ["companion", "personal", "skilled", "memory", "hospice"];

const LEVEL_COLOR: Record<string, string> = {
  companion: "bg-blue-100 text-blue-700",
  personal:  "bg-purple-100 text-purple-700",
  skilled:   "bg-amber-100 text-amber-700",
  memory:    "bg-rose-100 text-rose-700",
  hospice:   "bg-gray-200 text-gray-700",
};

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({
    name: "", firstName: "", lastName: "", gender: "",
    dateOfBirth: "", careLevel: "", careNeeds: "",
    emergencyContactName: "", emergencyContactPhone: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/care-recipients");
    if (res.ok) setRecipients(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = search.toLowerCase();
  const filtered = q
    ? recipients.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        (r.firstName ?? "").toLowerCase().includes(q) ||
        (r.lastName  ?? "").toLowerCase().includes(q) ||
        (r.careLevel ?? "").toLowerCase().includes(q) ||
        (r.careNeeds ?? "").toLowerCase().includes(q)
      )
    : recipients;

  const active   = recipients.filter((r) => r.active).length;
  const inactive = recipients.filter((r) => !r.active).length;

  async function addRecipient() {
    if (!form.name && !form.firstName) return;
    setSaving(true);
    const displayName = form.name ||
      `${form.firstName} ${form.lastName}`.trim();
    await fetch("/api/admin/care-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        name: displayName,
        riskFlags: [],
      }),
    });
    setForm({
      name: "", firstName: "", lastName: "", gender: "",
      dateOfBirth: "", careLevel: "", careNeeds: "",
      emergencyContactName: "", emergencyContactPhone: "",
    });
    setShowAdd(false);
    setSaving(false);
    load();
  }

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Care Recipients</h1>
          <p className="text-sm text-gray-500">{active} active · {inactive} inactive</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 min-h-[44px]"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Recipient
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipients…"
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
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={`/admin/recipients/${r.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.95 0.04 332)" }}
              >
                <UserCircle2 className="h-6 w-6" style={{ color: "oklch(0.30 0.14 332)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 truncate">{r.name}</span>
                  {r.careLevel && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${LEVEL_COLOR[r.careLevel] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.careLevel}
                    </span>
                  )}
                  {!r.active && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                      inactive
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-400">
                  {r.dateOfBirth && <span>DOB {r.dateOfBirth}</span>}
                  {r.gender      && <span>{r.gender}</span>}
                  {r.careNeeds   && <span className="truncate max-w-[16rem]">{r.careNeeds}</span>}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <UserCircle2 className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">
                {search ? `No recipients matching "${search}"` : "No care recipients yet."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Add modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto modal-sheet-safe">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Care Recipient</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={inp} placeholder="Mary" />
                </Field>
                <Field label="Last Name">
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={inp} placeholder="Johnson" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth">
                  <input value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    type="date" className={inp} />
                </Field>
                <Field label="Gender">
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className={inp}>
                    <option value="">Select…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
              <Field label="Care Level">
                <select value={form.careLevel} onChange={(e) => setForm({ ...form, careLevel: e.target.value })}
                  className={inp}>
                  <option value="">Select…</option>
                  {CARE_LEVELS.map((l) => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Care Needs">
                <textarea value={form.careNeeds} onChange={(e) => setForm({ ...form, careNeeds: e.target.value })}
                  rows={2} className={`${inp} resize-none`} placeholder="Brief description…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Emergency Contact">
                  <input value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    className={inp} placeholder="Jane Smith" />
                </Field>
                <Field label="EC Phone">
                  <input value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    className={inp} placeholder="(817) 000-0000" />
                </Field>
              </div>
              <button
                onClick={addRecipient}
                disabled={saving || (!form.firstName && !form.name)}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 min-h-[44px]"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {saving ? "Adding…" : "Add Recipient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
