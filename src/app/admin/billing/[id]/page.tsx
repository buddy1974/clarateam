"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle2, Send, Ban } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface InvoiceLine {
  id: number;
  staffName: string;
  description: string;
  hours: string;
  rate: string;
  amount: string;
}

interface InvoiceDetail {
  id: number;
  clientId: number;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  invoiceNo: string;
  periodFrom: string;
  periodTo: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  lines: InvoiceLine[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt$(n: string | number) {
  return `$${parseFloat(String(n)).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const STATUS_STYLE: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-600",
  sent:      "bg-blue-50 text-blue-700",
  paid:      "bg-green-50 text-green-700",
  overdue:   "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-400",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  async function load() {
    setLoading(true);
    const res  = await fetch(`/api/admin/invoices/${id}`);
    const data = await res.json();
    setInvoice(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus(status: string, extra: Record<string, string> = {}) {
    setSaving(true);
    await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), status, ...extra }),
    });
    setSaving(false);
    load();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/admin/billing" className="text-sm text-amber-600 underline">Back to Billing</Link>
      </div>
    );
  }

  const taxRate = parseFloat(invoice.taxRate);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Action bar (hidden when printing) ── */}
      <div className="no-print border-b border-gray-200 bg-white px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/billing"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 font-mono">{invoice.invoiceNo}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS_STYLE[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{invoice.clientName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {invoice.status === "draft" && (
              <button
                onClick={() => updateStatus("sent")}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Mark Sent
              </button>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <button
                onClick={() => updateStatus("paid", { paidAt: new Date().toISOString().split("T")[0] })}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Paid
              </button>
            )}
            {invoice.status !== "cancelled" && invoice.status !== "paid" && (
              <button
                onClick={() => updateStatus("cancelled")}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-100 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Printable Invoice ── */}
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 print:p-0 print:py-6">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">

          {/* Invoice header */}
          <div className="p-8 pb-6">
            <div className="flex items-start justify-between">
              {/* From */}
              <div>
                <div
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ background: "oklch(0.30 0.14 332)" }}
                >
                  C
                </div>
                <div className="font-bold text-gray-900 text-lg">Clara's CareTeam</div>
                <div className="mt-1 text-sm text-gray-500">DFW, Texas</div>
                <div className="text-sm text-gray-500">817-265-5762</div>
                <div className="text-sm text-gray-500">info@claracareteam.com</div>
              </div>

              {/* Invoice info */}
              <div className="text-right">
                <div className="text-3xl font-black tracking-tight text-gray-900">INVOICE</div>
                <div className="mt-2 font-mono text-sm font-bold text-gray-700">{invoice.invoiceNo}</div>
                <div className="mt-1 text-xs text-gray-400">
                  Issued: {fmtDate(invoice.createdAt.split("T")[0])}
                </div>
                {invoice.dueDate && (
                  <div className="text-xs text-gray-400">Due: {fmtDate(invoice.dueDate)}</div>
                )}
                {invoice.paidAt && (
                  <div className="mt-1 text-xs font-bold text-green-600">
                    PAID {fmtDate(invoice.paidAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Bill-to */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="rounded-2xl bg-gray-50 p-4 print:bg-gray-50">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Bill To</p>
                <p className="font-bold text-gray-900">{invoice.clientName}</p>
                {invoice.clientAddress && <p className="text-sm text-gray-500">{invoice.clientAddress}</p>}
                {invoice.clientEmail   && <p className="text-sm text-gray-500">{invoice.clientEmail}</p>}
                {invoice.clientPhone   && <p className="text-sm text-gray-500">{invoice.clientPhone}</p>}
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 print:bg-gray-50">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Service Period</p>
                <p className="font-bold text-gray-900">{fmtDate(invoice.periodFrom)}</p>
                <p className="text-sm text-gray-500">to</p>
                <p className="font-bold text-gray-900">{fmtDate(invoice.periodTo)}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-100 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="py-3 pr-4">Staff / Service</th>
                  <th className="py-3 pr-4 text-right">Hours</th>
                  <th className="py-3 pr-4 text-right">Rate</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.lines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                      No line items — no completed shifts found for this period.
                    </td>
                  </tr>
                ) : (
                  invoice.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-gray-900">{line.staffName}</div>
                        <div className="text-xs text-gray-400">{line.description}</div>
                      </td>
                      <td className="py-4 pr-4 text-right text-gray-700">{parseFloat(line.hours).toFixed(2)}</td>
                      <td className="py-4 pr-4 text-right text-gray-700">{fmt$(line.rate)}/hr</td>
                      <td className="py-4 text-right font-semibold text-gray-900">{fmt$(line.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-8 pt-4">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{fmt$(invoice.subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({taxRate}%)</span>
                  <span className="font-medium text-gray-900">{fmt$(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between rounded-2xl border border-gray-900 bg-gray-900 px-4 py-3 text-white print:rounded-xl">
                <span className="font-bold">Total</span>
                <span className="text-lg font-black">{fmt$(invoice.total)}</span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-gray-400">
              Thank you for trusting Clara's CareTeam with your care needs.
            </p>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { margin: 0.75in; }
        }
      `}</style>
    </div>
  );
}
