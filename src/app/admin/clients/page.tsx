"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Building2, Plus, Search, X, ChevronRight, Home } from "lucide-react";

type Client = {
  id: number; name: string; type: string; contactName: string | null;
  email: string | null; phone: string | null; address: string | null;
  notes: string | null; referredBy: string | null; active: boolean; createdAt: string;
};

export default function ClientsPage() {
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({
    name: "", type: "facility", contactName: "", email: "", phone: "", address: "", referredBy: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetch("/api/admin/clients").then((r) => r.json());
    if (Array.isArray(rows)) setClientList(rows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = search.toLowerCase();
  const filtered = q
    ? clientList.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.contactName ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q)
      )
    : clientList;

  const facilities = clientList.filter((c) => c.type === "facility" && c.active).length;
  const families   = clientList.filter((c) => c.type === "family"   && c.active).length;

  async function addClient() {
    setSaving(true);
    await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", type: "facility", contactName: "", email: "", phone: "", address: "", referredBy: "" });
    setShowAdd(false);
    setSaving(false);
    load();
  }

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">{facilities} facilities · {families} families</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110"
          style={{ background: "oklch(0.30 0.14 332)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Client
        </button>
      </div>

      {/* Type chips */}
      <div className="mb-4 flex gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{facilities} Facilities</span>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">{families} Families</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Client cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clients/${c.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: c.type === "facility" ? "oklch(0.55 0.18 260)" : "oklch(0.50 0.20 150)" }}
              >
                {c.type === "facility"
                  ? <Building2 className="h-5 w-5 text-white" />
                  : <Home className="h-5 w-5 text-white" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">{c.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    c.type === "facility" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {c.type}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  {c.contactName && <span>{c.contactName}</span>}
                  {c.phone && <span className="ml-2">{c.phone}</span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <Building2 className="mx-auto h-8 w-8 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">
                {search ? `No clients matching "${search}"` : "No clients yet. Add a facility or family."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Add Client Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto modal-sheet-safe">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-gray-900">Add Client</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Organization Name *">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inp} placeholder="Sunrise Senior Living" />
              </Field>
              <Field label="Type *">
                <div className="flex gap-2">
                  {["facility", "family"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                        form.type === t
                          ? "text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                      style={form.type === t ? { background: "oklch(0.30 0.14 332)" } : {}}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Primary Contact Name">
                <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className={inp} placeholder="Jessica Dean" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inp} placeholder="(817) 000-0000" />
                </Field>
                <Field label="Email">
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email" className={inp} placeholder="contact@org.com" />
                </Field>
              </div>
              <Field label="Address">
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inp} placeholder="123 Main St, Arlington TX" />
              </Field>
              <Field label="Referred By">
                <input value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
                  className={inp} placeholder="Kevin Dean" />
              </Field>
              <button
                onClick={addClient}
                disabled={saving || !form.name}
                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                style={{ background: "oklch(0.30 0.14 332)" }}
              >
                {saving ? "Adding…" : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
