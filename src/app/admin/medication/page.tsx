"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Pill, Search, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface CareRecipient {
  id: number;
  name: string;
  clientId: number | null;
  careLevel: string | null;
  active: boolean;
}

interface Client {
  id: number;
  name: string;
}

interface Medication {
  id: number;
  recipientId: number;
  name: string;
  dosage: string;
  times: string[];
  active: boolean;
}

interface MedLog {
  medicationId: number;
  logDate: string;
  scheduledTime: string;
  status: "given" | "missed" | "refused" | "held";
}

// ── Helpers ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0];
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const CARE_LEVEL_COLOR: Record<string, string> = {
  companion: "bg-sky-100 text-sky-700",
  personal:  "bg-violet-100 text-violet-700",
  skilled:   "bg-amber-100 text-amber-700",
  memory:    "bg-rose-100 text-rose-700",
  hospice:   "bg-gray-100 text-gray-600",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function MedicationPage() {
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [clients,    setClients]    = useState<Client[]>([]);
  const [allMeds,    setAllMeds]    = useState<Medication[]>([]);
  const [todayLogs,  setTodayLogs]  = useState<MedLog[]>([]);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);

  const todayStr = today();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [rRes, cRes, mRes, lRes] = await Promise.all([
        fetch("/api/admin/care-recipients"),
        fetch("/api/admin/clients"),
        fetch("/api/admin/medications"),
        fetch(`/api/admin/medication-logs?date=${todayStr}`),
      ]);
      const [r, c, m, l] = await Promise.all([rRes.json(), cRes.json(), mRes.json(), lRes.json()]);
      setRecipients(r.filter((x: CareRecipient) => x.active));
      setClients(c);
      setAllMeds(m);
      setTodayLogs(l);
      setLoading(false);
    }
    load();
  }, []);

  const clientMap = useMemo(() => {
    const m: Record<number, string> = {};
    clients.forEach((c) => (m[c.id] = c.name));
    return m;
  }, [clients]);

  // Recipients that have ≥1 active med
  const medRecipients = useMemo(() => {
    const withMeds = new Set(allMeds.map((m) => m.recipientId));
    return recipients.filter((r) => withMeds.has(r.id));
  }, [recipients, allMeds]);

  // Per-recipient adherence summary for today
  function getAdherence(recipientId: number) {
    const meds = allMeds.filter((m) => m.recipientId === recipientId);
    const allDoses: { medId: number; time: string }[] = [];
    meds.forEach((med) => med.times.forEach((t) => allDoses.push({ medId: med.id, time: t })));

    if (allDoses.length === 0) return null;

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    let given = 0, missed = 0, pending = 0;
    allDoses.forEach(({ medId, time }) => {
      const log = todayLogs.find(
        (l) => l.medicationId === medId && l.scheduledTime === time
      );
      if (log) {
        if (log.status === "given") given++;
        else missed++;
      } else {
        const [h, m] = time.split(":").map(Number);
        const doseMins = h * 60 + m;
        if (doseMins < nowMins - 30) missed++;
        else pending++;
      }
    });

    return { total: allDoses.length, given, missed, pending };
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return medRecipients;
    const q = search.toLowerCase();
    return medRecipients.filter((r) => r.name.toLowerCase().includes(q));
  }, [medRecipients, search]);

  // Summary stats
  const totalMeds = allMeds.length;
  const totalRecipients = medRecipients.length;
  const adherences = medRecipients.map((r) => getAdherence(r.id)).filter(Boolean);
  const allGiven   = adherences.filter((a) => a!.missed === 0 && a!.pending === 0).length;
  const hasMissed  = adherences.filter((a) => a!.missed > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Medication</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Pill className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-gray-700">{totalMeds} active meds</span>
          </div>
        </div>

        {/* Today summary */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalRecipients}</div>
            <div className="mt-0.5 text-xs text-gray-500">Recipients</div>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{allGiven}</div>
            <div className="mt-0.5 text-xs text-green-600">All Given</div>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{hasMissed}</div>
            <div className="mt-0.5 text-xs text-red-600">Have Missed</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipients..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Recipient cards */}
      <div className="px-4 py-4 md:px-8">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Pill className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No recipients with active medications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const adherence = getAdherence(r.id);
              const meds = allMeds.filter((m) => m.recipientId === r.id);
              const clientName = r.clientId ? clientMap[r.clientId] : null;

              let statusColor = "bg-gray-100 text-gray-500";
              let StatusIcon = Clock;
              let statusLabel = "No doses yet";
              if (adherence) {
                if (adherence.missed > 0) {
                  statusColor = "bg-red-50 border-red-200 text-red-700";
                  StatusIcon = AlertCircle;
                  statusLabel = `${adherence.missed} missed`;
                } else if (adherence.given === adherence.total) {
                  statusColor = "bg-green-50 border-green-200 text-green-700";
                  StatusIcon = CheckCircle2;
                  statusLabel = "All given";
                } else {
                  statusColor = "bg-amber-50 border-amber-200 text-amber-700";
                  StatusIcon = Clock;
                  statusLabel = `${adherence.given}/${adherence.total} given`;
                }
              }

              return (
                <Link
                  key={r.id}
                  href={`/admin/medication/${r.id}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{r.name}</span>
                      {r.careLevel && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CARE_LEVEL_COLOR[r.careLevel] ?? "bg-gray-100 text-gray-500"}`}>
                          {r.careLevel}
                        </span>
                      )}
                    </div>
                    {clientName && (
                      <p className="mt-0.5 text-xs text-gray-400">{clientName}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {meds.slice(0, 3).map((med) => (
                        <span key={med.id} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
                          {med.name} {med.dosage}
                        </span>
                      ))}
                      {meds.length > 3 && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">
                          +{meds.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Today's times */}
                    {adherence && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {meds.flatMap((med) =>
                          med.times.map((t) => {
                            const log = todayLogs.find(
                              (l) => l.medicationId === med.id && l.scheduledTime === t
                            );
                            const dotColor = log
                              ? log.status === "given"
                                ? "bg-green-500"
                                : "bg-red-400"
                              : "bg-gray-300";
                            return (
                              <span key={`${med.id}-${t}`} className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                {fmtTime(t)}
                              </span>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabel}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
