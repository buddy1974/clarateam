"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Receipt, Plus, Search, ChevronRight, X,
  CheckCircle2, Clock, AlertCircle, FileText, Ban,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Invoice {
  id: number;
  clientId: number;
  clientName: string | null;
  invoiceNo: string;
  periodFrom: string;
  periodTo: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: string;
  total: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt$(n: string | number) {
  return `$${parseFloat(String(n)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  draft:     { bg: "bg-gray-100",   text: "text-gray-600",   icon: FileText },
  sent:      { bg: "bg-blue-50",    text: "text-blue-700",   icon: Clock },
  paid:      { bg: "bg-green-50",   text: "text-green-700",  icon: CheckCircle2 },
  overdue:   { bg: "bg-red-50",     text: "text-red-700",    icon: AlertCircle },
  cancelled: { bg: "bg-gray-100",   text: "text-gray-400",   icon: Ban },
};

const TABS = ["all", "draft", "sent", "paid", "overdue"] as const;

// ── New Invoice Modal ──────────────────────────────────────────────────────

function NewInvoiceModal({
  clients,
  onClose,
  onCreated,
}: {
  clients: Client[];
  onClose: () => void;
  onCreated: (id: number) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.slice(0, 8) + "01";

  const [form, setForm] = useState({
    clientId: "",
    periodFrom: firstOfMonth,
    periodTo: today,
    taxRate: "0",
    dueDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.clientId || !form.periodFrom || !form.periodTo) return;
    setSaving(true);
    setInfo(null);
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId:   parseInt(form.clientId),
        periodFrom: form.periodFrom,
        periodTo:   form.periodTo,
        taxRate:    parseFloat(form.taxRate) || 0,
        dueDate:    form.dueDate || null,
        notes:      form.notes || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      onCreated(data.id);
      onClose();
    } else {
      setInfo("Error creating invoice. Try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New Invoice</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Client *</label>
            <select
              value={form.clientId}
              onChange={(e) => set("clientId", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
            >
              <option value="">— Select client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Period From *</label>
              <input type="date" value={form.periodFrom} onChange={(e) => set("periodFrom", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Period To *</label>
              <input type="date" value={form.periodTo} onChange={(e) => set("periodTo", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Tax Rate (%)</label>
              <input type="number" min="0" max="30" step="0.5" value={form.taxRate}
                onChange={(e) => set("taxRate", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              placeholder="Payment terms, bank details..." />
          </div>

          {info && <p className="text-xs text-red-500">{info}</p>}

          <p className="text-xs text-gray-400">
            Shifts with status <strong>completed</strong> for the selected client + period will be pulled automatically.
          </p>
        </div>

        <button
          onClick={submit}
          disabled={saving || !form.clientId || !form.periodFrom || !form.periodTo}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: "oklch(0.74 0.14 75)" }}
        >
          {saving ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [clients,     setClients]     = useState<Client[]>([]);
  const [search,      setSearch]      = useState("");
  const [tab,         setTab]         = useState<typeof TABS[number]>("all");
  const [showNew,     setShowNew]     = useState(false);
  const [loading,     setLoading]     = useState(true);

  async function load() {
    setLoading(true);
    const [iRes, cRes] = await Promise.all([
      fetch("/api/admin/invoices"),
      fetch("/api/admin/clients"),
    ]);
    const [i, c] = await Promise.all([iRes.json(), cRes.json()]);
    setInvoiceList(i);
    setClients(c.filter((x: Client & { active: boolean }) => x.active));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Summary stats (this calendar month)
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthInvoices = useMemo(() => invoiceList.filter(
    (i) => i.createdAt.startsWith(thisMonth)
  ), [invoiceList, thisMonth]);

  const totalInvoiced  = monthInvoices.reduce((s, i) => s + parseFloat(i.total), 0);
  const totalPaid      = monthInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + parseFloat(i.total), 0);
  const outstanding    = invoiceList
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + parseFloat(i.total), 0);

  // Filtered list
  const filtered = useMemo(() => {
    let list = tab === "all" ? invoiceList : invoiceList.filter((i) => i.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.invoiceNo.toLowerCase().includes(q) ||
        (i.clientName ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoiceList, tab, search]);

  async function markPaid(inv: Invoice) {
    await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id, status: "paid", paidAt: new Date().toISOString().split("T")[0] }),
    });
    load();
  }

  async function markSent(inv: Invoice) {
    await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id, status: "sent" }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Billing</h1>
            <p className="mt-0.5 text-sm text-gray-400">{invoiceList.length} total invoices</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm"
            style={{ background: "oklch(0.74 0.14 75)" }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-gray-900">{fmt$(totalInvoiced)}</div>
            <div className="mt-0.5 text-[11px] text-gray-400">Invoiced (month)</div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
            <div className="text-lg font-bold text-amber-700">{fmt$(outstanding)}</div>
            <div className="mt-0.5 text-[11px] text-amber-600">Outstanding</div>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
            <div className="text-lg font-bold text-green-700">{fmt$(totalPaid)}</div>
            <div className="mt-0.5 text-[11px] text-green-600">Paid (month)</div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl bg-gray-100 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or client..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>

      {/* Invoice list */}
      <div className="px-4 py-4 md:px-8">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="mx-auto h-10 w-10 text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">No invoices yet</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              + Generate first invoice
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const st = STATUS_STYLE[inv.status] ?? STATUS_STYLE.draft;
              const StatusIcon = st.icon;
              return (
                <div key={inv.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <Link
                    href={`/admin/billing/${inv.id}`}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-900 font-mono text-sm">{inv.invoiceNo}</span>
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${st.bg} ${st.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {inv.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-gray-700">{inv.clientName}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {fmtDate(inv.periodFrom)} – {fmtDate(inv.periodTo)}
                        {inv.dueDate && <> · Due {fmtDate(inv.dueDate)}</>}
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1">
                      <span className="text-lg font-bold text-gray-900">{fmt$(inv.total)}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </Link>

                  {/* Quick action buttons */}
                  {(inv.status === "draft" || inv.status === "sent" || inv.status === "overdue") && (
                    <div className="flex gap-2 border-t border-gray-100 px-4 pb-3 pt-2.5">
                      {inv.status === "draft" && (
                        <button
                          onClick={() => markSent(inv)}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Mark Sent
                        </button>
                      )}
                      {(inv.status === "sent" || inv.status === "overdue") && (
                        <button
                          onClick={() => markPaid(inv)}
                          className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                        >
                          Mark Paid
                        </button>
                      )}
                      <Link
                        href={`/admin/billing/${inv.id}`}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        View / Print
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNew && (
        <NewInvoiceModal
          clients={clients}
          onClose={() => setShowNew(false)}
          onCreated={(id) => {
            load();
            // Navigate to new invoice detail
            window.location.href = `/admin/billing/${id}`;
          }}
        />
      )}
    </div>
  );
}
