"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, ArrowLeft, Edit3, Save, X, UserCheck } from "lucide-react";

type StaffMember = {
  id: number; name: string; email: string; phone: string;
  role: string; status: string; hourlyRate: string | null;
  startDate: string | null; emergencyContactName: string | null;
  emergencyContactPhone: string | null; certifications: string[];
  skills: string[]; notes: string | null; applicantId: number | null;
  createdAt: string; updatedAt: string;
};

const STAFF_STATUSES = ["active", "inactive", "on_leave", "terminated"] as const;
const ROLES          = ["CNA", "LVN", "HHA", "PCA", "RN", "DON", "Administrator", "Other"];

const STATUS_COLORS: Record<string, string> = {
  active:     "bg-green-100 text-green-700",
  inactive:   "bg-gray-100 text-gray-500",
  on_leave:   "bg-amber-100 text-amber-700",
  terminated: "bg-red-100 text-red-700",
};

export default function StaffProfilePage() {
  const { id }      = useParams<{ id: string }>();
  const router      = useRouter();
  const [member, setMember]   = useState<StaffMember | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<Partial<StaffMember>>({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const all = await fetch("/api/admin/staff").then((r) => r.json());
    const found = Array.isArray(all) ? all.find((s: StaffMember) => s.id === parseInt(id)) : null;
    if (found) { setMember(found); setForm(found); }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), ...form }),
    });
    setEditing(false);
    setSaving(false);
    load();
  }

  async function updateStatus(status: string) {
    await fetch("/api/admin/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), status }),
    });
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-gray-400">Staff member not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm font-semibold text-amber-600 hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Back + actions */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Staff
        </button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setForm(member); }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Profile header */}
      <div className="mb-5 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          {member.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-2 py-1 text-lg font-bold outline-none focus:border-amber-400"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 truncate">{member.name}</h1>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {editing ? (
              <select
                value={form.role ?? member.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="rounded-lg border border-gray-200 px-2 py-0.5 text-xs outline-none focus:border-amber-400"
              >
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            ) : (
              <span className="text-sm font-semibold text-gray-600">{member.role}</span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[member.status] ?? "bg-gray-100 text-gray-500"}`}>
              {member.status.replace(/_/g, " ")}
            </span>
            {member.hourlyRate && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                ${member.hourlyRate}/hr
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick contact */}
      <div className="mb-4 flex gap-2">
        <a href={`tel:${member.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-3 text-xs font-bold text-green-700 hover:bg-green-100">
          <Phone className="h-4 w-4" /> Call
        </a>
        <a href={`mailto:${member.email}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-3 text-xs font-bold text-blue-700 hover:bg-blue-100">
          <Mail className="h-4 w-4" /> Email
        </a>
        <a href={`sms:${member.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 py-3 text-xs font-bold text-purple-700 hover:bg-purple-100">
          <UserCheck className="h-4 w-4" /> Text
        </a>
      </div>

      {/* Status pipeline */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Employment Status</p>
        <div className="flex flex-wrap gap-2">
          {STAFF_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                member.status === s
                  ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-500") + " ring-2 ring-offset-1 ring-current"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Details grid */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Details</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EditField label="Phone" value={form.phone ?? ""} editing={editing}
            onChange={(v) => setForm({ ...form, phone: v })} />
          <EditField label="Email" value={form.email ?? ""} editing={editing}
            onChange={(v) => setForm({ ...form, email: v })} />
          <EditField label="Hourly Rate ($)" value={form.hourlyRate ?? ""} editing={editing} type="number"
            onChange={(v) => setForm({ ...form, hourlyRate: v })} />
          <EditField label="Start Date" value={form.startDate ?? ""} editing={editing} type="date"
            onChange={(v) => setForm({ ...form, startDate: v })} />
          <EditField label="Emergency Contact" value={form.emergencyContactName ?? ""} editing={editing}
            onChange={(v) => setForm({ ...form, emergencyContactName: v })} />
          <EditField label="Emergency Phone" value={form.emergencyContactPhone ?? ""} editing={editing}
            onChange={(v) => setForm({ ...form, emergencyContactPhone: v })} />
        </div>
      </div>

      {/* Certifications + skills */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Certifications & Skills</p>
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Certifications (comma-separated)</label>
              <input
                value={(form.certifications ?? []).join(", ")}
                onChange={(e) => setForm({ ...form, certifications: e.target.value.split(",").map((c) => c.trim()).filter(Boolean) })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="CNA, CPR, BLS"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Skills (comma-separated)</label>
              <input
                value={(form.skills ?? []).join(", ")}
                onChange={(e) => setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="Dementia care, Wound care"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {member.certifications.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-gray-400">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.certifications.map((c) => (
                    <span key={c} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {member.skills.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-gray-400">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((s) => (
                    <span key={s} className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {member.certifications.length === 0 && member.skills.length === 0 && (
              <p className="text-sm text-gray-400">No certifications or skills recorded. Click Edit to add.</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Internal Notes</p>
        {editing ? (
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Internal notes…"
          />
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {member.notes || <span className="text-gray-400">No notes.</span>}
          </p>
        )}
      </div>

      {/* Meta */}
      <p className="mt-4 text-center text-xs text-gray-400">
        Added {new Date(member.createdAt).toLocaleDateString()} · ID #{member.id}
        {member.applicantId ? " · Promoted from applicant" : ""}
      </p>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function EditField({
  label, value, editing, onChange, type = "text",
}: {
  label: string; value: string; editing: boolean;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-full bg-transparent text-sm text-gray-900 outline-none focus:text-amber-700"
        />
      ) : (
        <span className="block text-sm text-gray-800 mt-0.5">{value || "—"}</span>
      )}
    </div>
  );
}
