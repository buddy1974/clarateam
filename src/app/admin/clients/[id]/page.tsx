"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Phone, Mail, Edit3, Save, X, User, AlertTriangle } from "lucide-react";

type Client = {
  id: number; name: string; type: string; contactName: string | null;
  email: string | null; phone: string | null; address: string | null;
  notes: string | null; referredBy: string | null; active: boolean; createdAt: string;
};

type CareRecipient = {
  id: number; name: string; dateOfBirth: string | null; careLevel: string | null;
  careNeeds: string | null; riskFlags: string[]; emergencyContactName: string | null;
  emergencyContactPhone: string | null; active: boolean;
};

const CARE_LEVELS = ["companion", "personal", "skilled", "memory", "hospice"];

const LEVEL_COLORS: Record<string, string> = {
  companion: "bg-green-100 text-green-700",
  personal:  "bg-blue-100 text-blue-700",
  skilled:   "bg-purple-100 text-purple-700",
  memory:    "bg-amber-100 text-amber-700",
  hospice:   "bg-red-100 text-red-700",
};

const RISK_OPTIONS = ["fall_risk", "dementia", "diabetes", "heart_condition", "mobility_impaired", "behavioral", "infection_risk"];

export default function ClientProfilePage() {
  const { id }      = useParams<{ id: string }>();
  const router      = useRouter();
  const [client, setClient]         = useState<Client | null>(null);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [editing, setEditing]       = useState(false);
  const [form, setForm]             = useState<Partial<Client>>({});
  const [saving, setSaving]         = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [loading, setLoading]       = useState(true);

  // New recipient form state
  const [rForm, setRForm] = useState({
    name: "", dateOfBirth: "", careLevel: "personal",
    careNeeds: "", riskFlags: [] as string[],
    emergencyContactName: "", emergencyContactPhone: "",
  });

  const load = useCallback(async () => {
    const [allClients, recs] = await Promise.all([
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch(`/api/admin/care-recipients?clientId=${id}`).then((r) => r.json()),
    ]);
    const found = Array.isArray(allClients)
      ? allClients.find((c: Client) => c.id === parseInt(id))
      : null;
    if (found) { setClient(found); setForm(found); }
    if (Array.isArray(recs)) setRecipients(recs);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function saveClient() {
    setSaving(true);
    await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), ...form }),
    });
    setEditing(false);
    setSaving(false);
    load();
  }

  async function addRecipient() {
    setSaving(true);
    await fetch("/api/admin/care-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rForm, clientId: parseInt(id) }),
    });
    setRForm({ name: "", dateOfBirth: "", careLevel: "personal", careNeeds: "",
               riskFlags: [], emergencyContactName: "", emergencyContactPhone: "" });
    setShowAdd(false);
    setSaving(false);
    load();
  }

  function toggleRisk(flag: string) {
    setRForm((prev) => ({
      ...prev,
      riskFlags: prev.riskFlags.includes(flag)
        ? prev.riskFlags.filter((f) => f !== flag)
        : [...prev.riskFlags, flag],
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }
  if (!client) return (
    <div className="px-4 py-20 text-center">
      <p className="text-gray-400">Client not found.</p>
    </div>
  );

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Back + actions */}
      <div className="mb-5 flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Clients
        </button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setForm(client); }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
              <button onClick={saveClient} disabled={saving}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "oklch(0.30 0.14 332)" }}>
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Client header */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: client.type === "facility" ? "oklch(0.55 0.18 260)" : "oklch(0.50 0.20 150)" }}
          >
            <span className="text-lg font-bold">{client.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mb-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-xl font-bold outline-none focus:border-amber-400" />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              client.type === "facility" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
            }`}>{client.type}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Contact", field: "contactName" as const, placeholder: "Name" },
            { label: "Phone",   field: "phone"       as const, placeholder: "(817) 000-0000" },
            { label: "Email",   field: "email"       as const, placeholder: "email@org.com" },
            { label: "Address", field: "address"     as const, placeholder: "123 Main St" },
            { label: "Referred By", field: "referredBy" as const, placeholder: "Kevin Dean" },
          ].map(({ label, field, placeholder }) => (
            <div key={field} className="rounded-lg bg-gray-50 px-3 py-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
              {editing ? (
                <input value={(form[field] ?? "") as string}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  placeholder={placeholder}
                  className="mt-0.5 w-full bg-transparent text-sm outline-none focus:text-amber-700" />
              ) : (
                <span className="block text-sm text-gray-800 mt-0.5">{(client[field] as string | null) || "—"}</span>
              )}
            </div>
          ))}
        </div>

        {/* Quick contact */}
        {(client.phone || client.email) && (
          <div className="mt-3 flex gap-2">
            {client.phone && (
              <a href={`tel:${client.phone}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100">
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
          </div>
        )}
      </div>

      {/* Care Recipients */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Care Recipients <span className="ml-1 text-sm font-normal text-gray-400">({recipients.length})</span>
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-200"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {recipients.map((r) => (
            <div key={r.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{r.name}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {r.careLevel && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${LEVEL_COLORS[r.careLevel] ?? "bg-gray-100 text-gray-500"}`}>
                          {r.careLevel}
                        </span>
                      )}
                      {r.dateOfBirth && (
                        <span className="text-[10px] text-gray-400">
                          DOB: {r.dateOfBirth}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {r.riskFlags.length > 0 && (
                  <div className="flex shrink-0 items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold">{r.riskFlags.length} risk{r.riskFlags.length > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>

              {r.riskFlags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.riskFlags.map((f) => (
                    <span key={f} className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      {f.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}

              {r.careNeeds && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{r.careNeeds}</p>
              )}
            </div>
          ))}

          {recipients.length === 0 && (
            <div className="px-5 py-10 text-center">
              <User className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-2 text-sm text-gray-400">No care recipients yet. Add one above.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Care Recipient Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Care Recipient</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <RF label="Full Name *">
                <input value={rForm.name} onChange={(e) => setRForm({ ...rForm, name: e.target.value })}
                  className={ri} placeholder="Mary Johnson" />
              </RF>
              <div className="grid grid-cols-2 gap-3">
                <RF label="Date of Birth">
                  <input type="date" value={rForm.dateOfBirth}
                    onChange={(e) => setRForm({ ...rForm, dateOfBirth: e.target.value })} className={ri} />
                </RF>
                <RF label="Care Level">
                  <select value={rForm.careLevel}
                    onChange={(e) => setRForm({ ...rForm, careLevel: e.target.value })} className={ri}>
                    {CARE_LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </RF>
              </div>
              <RF label="Care Needs">
                <textarea value={rForm.careNeeds}
                  onChange={(e) => setRForm({ ...rForm, careNeeds: e.target.value })}
                  rows={2} className={ri + " resize-none"} placeholder="Describe specific care needs…" />
              </RF>
              <RF label="Risk Flags">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {RISK_OPTIONS.map((f) => (
                    <button key={f} type="button"
                      onClick={() => toggleRisk(f)}
                      className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                        rForm.riskFlags.includes(f)
                          ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {f.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </RF>
              <div className="grid grid-cols-2 gap-3">
                <RF label="Emergency Contact">
                  <input value={rForm.emergencyContactName}
                    onChange={(e) => setRForm({ ...rForm, emergencyContactName: e.target.value })}
                    className={ri} placeholder="Contact name" />
                </RF>
                <RF label="Emergency Phone">
                  <input value={rForm.emergencyContactPhone}
                    onChange={(e) => setRForm({ ...rForm, emergencyContactPhone: e.target.value })}
                    className={ri} placeholder="(817) 000-0000" />
                </RF>
              </div>
              <button
                onClick={addRecipient}
                disabled={saving || !rForm.name}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {saving ? "Adding…" : "Add Care Recipient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ri = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";
function RF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
