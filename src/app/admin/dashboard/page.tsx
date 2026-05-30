"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Building2, ClipboardList, Mail,
  ChevronRight, UserCheck, AlertCircle, Inbox,
  Calendar, Pill, Heart, Sparkles, Receipt,
  TrendingUp, Activity, ShieldCheck,
} from "lucide-react";

type Counts = {
  totalStaff: number;    activeStaff: number;
  totalClients: number;
  newApplicants: number;
  openRequests: number;  unreadEmails: number;
  activeRecipients: number;
  todayShifts: number;
  pendingInvoices: number;
  activeAlerts: number;
};

type RecentApplicant = { id: number; name: string; role: string; status: string; createdAt: string };

const STATUS_COLORS: Record<string, string> = {
  applied:             "bg-blue-100 text-blue-700",
  screened:            "bg-purple-100 text-purple-700",
  interview_scheduled: "bg-amber-100 text-amber-700",
  background_check:    "bg-orange-100 text-orange-700",
  active:              "bg-green-100 text-green-700",
  inactive:            "bg-gray-100 text-gray-500",
  rejected:            "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [counts, setCounts]   = useState<Counts | null>(null);
  const [recent, setRecent]   = useState<RecentApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime]       = useState(new Date());
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Greet the actually-logged-in user (same source AdminShell uses).
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.userName) setUserName(d.userName); })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [staffRes, applicantsRes, clientsRes, requestsRes, emailsRes, recipientsRes, shiftsRes, invoicesRes, alertsRes] =
      await Promise.all([
        fetch("/api/admin/staff").then((r) => r.json()).catch(() => []),
        fetch("/api/admin/applicants").then((r) => r.json()).catch(() => []),
        fetch("/api/admin/clients").then((r) => r.json()).catch(() => []),
        fetch("/api/admin/requests").then((r) => r.json()).catch(() => []),
        fetch("/api/admin/inbox").then((r) => r.json()).catch(() => []),
        fetch("/api/admin/care-recipients").then((r) => r.json()).catch(() => []),
        fetch(`/api/admin/shifts?from=${new Date().toISOString().slice(0,10)}&to=${new Date().toISOString().slice(0,10)}`).then((r) => r.json()).catch(() => []),
        fetch("/api/admin/invoices?status=draft").then((r) => r.json()).catch(() => []),
        fetch("/api/admin/alerts").then((r) => r.json()).catch(() => []),
      ]);

    const staffList     = Array.isArray(staffRes)      ? staffRes      : [];
    const applicantList = Array.isArray(applicantsRes) ? applicantsRes : [];
    const clientList    = Array.isArray(clientsRes)    ? clientsRes    : [];
    const requestList   = Array.isArray(requestsRes)   ? requestsRes   : [];
    const emailList     = Array.isArray(emailsRes)     ? emailsRes     : [];
    const recipientList = Array.isArray(recipientsRes) ? recipientsRes : [];
    const shiftList     = Array.isArray(shiftsRes)     ? shiftsRes     : [];
    const invoiceList   = Array.isArray(invoicesRes)   ? invoicesRes   : [];
    const alertList     = Array.isArray(alertsRes)     ? alertsRes     : [];

    setCounts({
      totalStaff:       staffList.length,
      activeStaff:      staffList.filter((s: { status: string }) => s.status === "active").length,
      totalClients:     clientList.filter((c: { active: boolean }) => c.active).length,
      newApplicants:    applicantList.filter((a: { status: string }) => a.status === "applied").length,
      openRequests:     requestList.filter((r: { status: string }) => r.status === "open").length,
      unreadEmails:     emailList.filter((e: { isRead: boolean }) => !e.isRead).length,
      activeRecipients: recipientList.filter((r: { status: string }) => r.status === "active").length,
      todayShifts:      shiftList.length,
      pendingInvoices:  invoiceList.length,
      activeAlerts:     alertList.filter((a: { resolved: boolean }) => !a.resolved).length,
    });

    setRecent(applicantList.slice(-5).reverse());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const primaryStats = [
    { label: "Active Staff",      value: counts?.activeStaff ?? 0,      sub: `${counts?.totalStaff ?? 0} total`,       icon: UserCheck,  color: "text-green-600",  bg: "bg-green-50",   href: "/admin/staff" },
    { label: "Care Recipients",   value: counts?.activeRecipients ?? 0,  sub: "under active care",                      icon: Heart,      color: "text-rose-500",   bg: "bg-rose-50",    href: "/admin/recipients" },
    { label: "Active Clients",    value: counts?.totalClients ?? 0,      sub: "facilities & families",                  icon: Building2,  color: "text-blue-600",   bg: "bg-blue-50",    href: "/admin/clients" },
    { label: "Today's Shifts",    value: counts?.todayShifts ?? 0,       sub: "scheduled today",                        icon: Calendar,   color: "text-indigo-600", bg: "bg-indigo-50",  href: "/admin/rota" },
    { label: "Applications",      value: counts?.newApplicants ?? 0,     sub: "awaiting review",                        icon: Users,      color: "text-purple-600", bg: "bg-purple-50",  href: "/admin/staff" },
    { label: "Open Requests",     value: counts?.openRequests ?? 0,      sub: "need matching",                          icon: AlertCircle,color: "text-amber-600",  bg: "bg-amber-50",   href: "/admin/requests" },
    { label: "Unread Emails",     value: counts?.unreadEmails ?? 0,      sub: "in inbox",                               icon: Inbox,      color: "text-red-600",    bg: "bg-red-50",     href: "/admin/inbox" },
    { label: "Draft Invoices",    value: counts?.pendingInvoices ?? 0,   sub: "pending review",                         icon: Receipt,    color: "text-teal-600",   bg: "bg-teal-50",    href: "/admin/billing" },
    { label: "Active Alerts",     value: counts?.activeAlerts ?? 0,      sub: "require attention",                      icon: Activity,   color: "text-orange-600", bg: "bg-orange-50",  href: "/admin/alerts" },
  ];

  const quickModules = [
    { label: "Operations",   desc: "Live shifts & task status",      icon: Activity,    href: "/admin/operations", color: "oklch(0.30 0.14 332)" },
    { label: "Medication",   desc: "MAR & dose tracking",            icon: Pill,        href: "/admin/medication", color: "oklch(0.50 0.22 300)" },
    { label: "Compliance",   desc: "MAR grid, shift & task logs",    icon: ShieldCheck, href: "/admin/compliance", color: "oklch(0.45 0.18 180)" },
    { label: "AI Tools",     desc: "Care plans, reports & insights", icon: Sparkles,    href: "/admin/ai",         color: "oklch(0.55 0.22 260)" },
    { label: "Billing",      desc: "Generate & manage invoices",     icon: Receipt,     href: "/admin/billing",    color: "oklch(0.55 0.18 150)" },
    { label: "Email Inbox",  desc: "info@claracareteam.com",         icon: Mail,        href: "/admin/inbox",      color: "oklch(0.55 0.20 45)" },
  ];

  return (
    <div className="px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {greeting()}{userName ? `, ${userName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ClaraCare OS
          </p>
        </div>
        {(counts?.activeAlerts ?? 0) > 0 && (
          <Link
            href="/admin/alerts"
            className="flex items-center gap-2 self-start rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition-all hover:bg-orange-100 sm:self-auto"
          >
            <Activity className="h-4 w-4" />
            {counts?.activeAlerts} active alert{(counts?.activeAlerts ?? 0) !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-9">
        {primaryStats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="group col-span-1 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 lg:p-4"
          >
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="mt-2.5 text-xl font-extrabold text-gray-900 lg:text-2xl">{value}</div>
            <div className="mt-0.5 text-[11px] font-bold leading-tight text-gray-700">{label}</div>
            <div className="mt-0.5 hidden text-[10px] text-gray-400 lg:block">{sub}</div>
          </Link>
        ))}
      </div>

      {/* AI Banner */}
      <Link
        href="/admin/ai"
        className="mt-5 flex items-center gap-4 overflow-hidden rounded-2xl p-5 transition-all hover:brightness-105"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.14 332) 0%, oklch(0.35 0.18 300) 100%)" }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-white">AI Enhancement Tools</div>
          <div className="mt-0.5 text-sm text-white/65">
            Generate care plans · Summarize patients · Enhance reports · Match caregivers
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-bold text-amber-300">
          <TrendingUp className="h-3.5 w-3.5" /> Try Now
        </div>
      </Link>

      {/* Quick modules */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickModules.map(({ label, desc, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: color }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900">{label}</div>
              <div className="truncate text-xs text-gray-400">{desc}</div>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Recent applicants */}
      {recent.length > 0 && (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Applications</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest caregiver candidates</p>
            </div>
            <Link href="/admin/staff" className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "oklch(0.30 0.14 332)" }}
                  >
                    {a.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.role} · {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {a.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System status footer */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-500">ClaraCare OS — All systems operational</span>
        </div>
        <Link href="/admin/compliance" className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Compliance
        </Link>
      </div>
    </div>
  );
}
