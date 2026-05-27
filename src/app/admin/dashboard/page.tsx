"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Building2, ClipboardList, Mail,
  ChevronRight, UserCheck, AlertCircle, Inbox,
} from "lucide-react";

type Counts = {
  totalStaff: number; activeStaff: number;
  totalClients: number;
  newApplicants: number;
  openRequests: number;
  unreadEmails: number;
};

type RecentApplicant = {
  id: number; name: string; role: string; status: string; createdAt: string;
};

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
  const [counts, setCounts]     = useState<Counts | null>(null);
  const [recent, setRecent]     = useState<RecentApplicant[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [staffRes, applicantsRes, clientsRes, requestsRes, emailsRes] = await Promise.all([
      fetch("/api/admin/staff").then((r) => r.json()),
      fetch("/api/admin/applicants").then((r) => r.json()),
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/requests").then((r) => r.json()),
      fetch("/api/admin/inbox").then((r) => r.json()),
    ]);

    const staffList      = Array.isArray(staffRes)      ? staffRes      : [];
    const applicantList  = Array.isArray(applicantsRes) ? applicantsRes : [];
    const clientList     = Array.isArray(clientsRes)    ? clientsRes    : [];
    const requestList    = Array.isArray(requestsRes)   ? requestsRes   : [];
    const emailList      = Array.isArray(emailsRes)     ? emailsRes     : [];

    setCounts({
      totalStaff:    staffList.length,
      activeStaff:   staffList.filter((s: { status: string }) => s.status === "active").length,
      totalClients:  clientList.filter((c: { active: boolean }) => c.active).length,
      newApplicants: applicantList.filter((a: { status: string }) => a.status === "applied").length,
      openRequests:  requestList.filter((r: { status: string }) => r.status === "open").length,
      unreadEmails:  emailList.filter((e: { isRead: boolean }) => !e.isRead).length,
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

  const statCards = [
    { label: "Active Staff",    value: counts?.activeStaff ?? 0,   sub: `${counts?.totalStaff ?? 0} total`,   icon: UserCheck,    color: "text-green-600",  bg: "bg-green-50",  href: "/admin/staff" },
    { label: "Active Clients",  value: counts?.totalClients ?? 0,  sub: "facilities & families",              icon: Building2,    color: "text-blue-600",   bg: "bg-blue-50",   href: "/admin/clients" },
    { label: "New Applications",value: counts?.newApplicants ?? 0, sub: "awaiting review",                    icon: Users,        color: "text-purple-600", bg: "bg-purple-50", href: "/admin/staff" },
    { label: "Open Requests",   value: counts?.openRequests ?? 0,  sub: "need matching",                      icon: AlertCircle,  color: "text-amber-600",  bg: "bg-amber-50",  href: "/admin/requests" },
    { label: "Unread Emails",   value: counts?.unreadEmails ?? 0,  sub: "in inbox",                           icon: Inbox,        color: "text-red-600",    bg: "bg-red-50",    href: "/admin/inbox" },
  ];

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">ClaraCare OS — Operations overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-4.5 w-4.5 ${color}`} />
            </div>
            <div className="mt-3 text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-xs font-semibold text-gray-700 leading-tight">{label}</div>
            <div className="mt-0.5 text-[11px] text-gray-400">{sub}</div>
            <ChevronRight className="mt-2 h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-gray-500" />
          </Link>
        ))}
      </div>

      {/* Quick nav */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Manage Staff",    desc: "HR pipeline & profiles", icon: Users,        href: "/admin/staff",    color: "oklch(0.30 0.14 332)" },
          { label: "Client Accounts", desc: "Facilities & families",   icon: Building2,    href: "/admin/clients",  color: "oklch(0.55 0.18 260)" },
          { label: "Care Requests",   desc: "Incoming & matched",      icon: ClipboardList,href: "/admin/requests", color: "oklch(0.60 0.18 60)" },
          { label: "Email Inbox",     desc: "info@claracareteam.com",  icon: Mail,         href: "/admin/inbox",    color: "oklch(0.50 0.20 150)" },
        ].map(({ label, desc, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: color }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Recent applicants */}
      {recent.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link href="/admin/staff" className="text-xs font-semibold text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
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
    </div>
  );
}
