"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Plus, Search, X, Phone, Mail, ChevronRight,
  UserCheck, Clock, AlertCircle,
} from "lucide-react";

type StaffMember = {
  id: number; name: string; email: string; phone: string;
  role: string; status: string; hourlyRate: string | null;
  startDate: string | null; certifications: string[]; skills: string[];
  notes: string | null; createdAt: string;
};

type Applicant = {
  id: number; name: string; role: string; phone: string; email: string;
  certifications: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  active:     "bg-green-100 text-green-700",
  inactive:   "bg-gray-100 text-gray-500",
  on_leave:   "bg-amber-100 text-amber-700",
  terminated: "bg-red-100 text-red-700",
};

const ROLES = ["CNA", "LVN", "HHA", "PCA", "RN", "DON", "Administrator", "Other"];

export default function StaffPage() {
  const [staffList, setStaffList]         = useState<StaffMember[]>([]);
  const [applicants, setApplicants]       = useState<Applicant[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [showAdd, setShowAdd]             = useState(false);
  const [showPromote, setShowPromote]     = useState(false);
  const [saving, setSaving]               = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "CNA",
    hourlyRate: "", startDate: "", notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [s, a] = await Promise.all([
      fetch("/api/admin/staff").then((r) => r.json()),
      fetch("/api/admin/applicants").then((r) => r.json()),
    ]);
    if (Array.isArray(s)) setStaffList(s);
    // Applicants eligible for promotion (active status, no staff record yet)
    if (Array.isArray(a)) {
      const staffApplicantIds = new Set((Array.isArray(s) ? s : []).map((m: StaffMember) => m.id));
      setApplicants(a.filter((ap: Applicant & { status: string; applicantId?: number }) =>
        ap.status === "active" && !staffApplicantIds.has(ap.id)
      ));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = search.toLowerCase();
  const filtered = q
    ? staffList.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.phone.includes(q)
      )
    : staffList;

  const counts = {
    active:     staffList.filter((s) => s.status === "active").length,
    onLeave:    staffList.filter((s) => s.status === "on_leave").length,
    inactive:   staffList.filter((s) => s.status === "inactive").length,
  };

  async function addStaff() {
    setSaving(true);
    await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hourlyRate: form.hourlyRate || null,
        startDate: form.startDate || null,
      }),
    });
    setForm({ name: "", email: "", phone: "", role: "CNA", hourlyRate: "", startDate: "", notes: "" });
    setShowAdd(false);
    setSaving(false);
    load();
  }

  async function promoteApplicant(applicantId: number, hourlyRate: string) {
    setSaving(true);
    await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromApplicantId: applicantId, hourlyRate: hourlyRate || null }),
    });
    setShowPromote(false);
    setSaving(false);
    load();
  }

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500">{staffList.length} members · {counts.active} active</p>
        </div>
        <div className="flex gap-2">
          {applicants.length > 0 && (
            <button
              onClick={() => setShowPromote(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Promote ({applicants.length})
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110"
            style={{ background: "oklch(0.30 0.14 332)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Status summary chips */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[
          { label: `${counts.active} Active`,   color: "bg-green-100 text-green-700" },
          { label: `${counts.onLeave} On Leave`, color: "bg-amber-100 text-amber-700" },
          { label: `${counts.inactive} Inactive`,color: "bg-gray-100 text-gray-500" },
        ].map(({ label, color }) => (
          <span key={label} className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{label}</span>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, status…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Staff list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/admin/staff/${s.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">{s.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                  <span>{s.role}</span>
                  {s.hourlyRate && <span className="font-semibold text-gray-600">${s.hourlyRate}/hr</span>}
                  {s.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />{s.phone}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">
                {search ? `No staff matching "${search}"` : "No staff yet. Add a member or promote an applicant."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Add Staff Modal ── */}
      {showAdd && (
        <Modal title="Add Staff Member" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <FormField label="Full Name *">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls} placeholder="Jane Smith" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Role *">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </FormField>
              <FormField label="Hourly Rate ($)">
                <input value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  type="number" step="0.01" className={inputCls} placeholder="18.00" />
              </FormField>
            </div>
            <FormField label="Phone *">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls} placeholder="(817) 000-0000" />
            </FormField>
            <FormField label="Email *">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email" className={inputCls} placeholder="jane@email.com" />
            </FormField>
            <FormField label="Start Date">
              <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                type="date" className={inputCls} />
            </FormField>
            <FormField label="Notes">
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} className={inputCls + " resize-none"} placeholder="Internal notes…" />
            </FormField>
            <button
              onClick={addStaff}
              disabled={saving || !form.name || !form.phone || !form.email}
              className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              style={{ background: "oklch(0.30 0.14 332)" }}
            >
              {saving ? "Adding…" : "Add Staff Member"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Promote Applicant Modal ── */}
      {showPromote && (
        <Modal title="Promote Active Applicant" onClose={() => setShowPromote(false)}>
          <p className="mb-4 text-sm text-gray-500">
            These applicants are marked <strong>active</strong> and don&apos;t have a staff record yet.
          </p>
          <div className="space-y-2">
            {applicants.map((a) => (
              <PromoteCard key={a.id} applicant={a} onPromote={promoteApplicant} saving={saving} />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto modal-sheet-safe">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PromoteCard({
  applicant: a,
  onPromote,
  saving,
}: {
  applicant: Applicant;
  onPromote: (id: number, rate: string) => void;
  saving: boolean;
}) {
  const [rate, setRate] = useState("");
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ background: "oklch(0.30 0.14 332)" }}
      >
        {a.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 truncate">{a.name}</div>
        <div className="text-xs text-gray-400">{a.role}</div>
      </div>
      <input
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        placeholder="$/hr"
        type="number"
        className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-amber-400"
      />
      <button
        onClick={() => onPromote(a.id, rate)}
        disabled={saving}
        className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200 disabled:opacity-50"
      >
        Hire
      </button>
    </div>
  );
}
