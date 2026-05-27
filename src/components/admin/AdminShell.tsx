"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Building2, ClipboardList,
  Mail, Calendar, Pill, Receipt, Palette, LogOut,
} from "lucide-react";

// ── Navigation config ──────────────────────────────────────────────

const PRIMARY_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/staff",     label: "Staff",      icon: Users },
  { href: "/admin/clients",   label: "Clients",    icon: Building2 },
  { href: "/admin/requests",  label: "Requests",   icon: ClipboardList },
  { href: "/admin/inbox",     label: "Inbox",      icon: Mail },
  { href: "/admin/rota",       label: "Rota",       icon: Calendar },
  { href: "/admin/medication", label: "Medication", icon: Pill },
  { href: "/admin/billing",   label: "Billing",    icon: Receipt },
  { href: "/admin/cms",      label: "CMS",        icon: Palette },
] as const;

const SOON_NAV: never[] = [];

const PAGE_TITLE: Record<string, string> = {
  "/admin/dashboard":  "Dashboard",
  "/admin/staff":      "Staff",
  "/admin/clients":    "Clients",
  "/admin/requests":   "Requests",
  "/admin/inbox":      "Inbox",
  "/admin/rota":       "Rota",
  "/admin/medication": "Medication",
  "/admin/billing":    "Billing",
  "/admin/cms":        "CMS",
};

// ══════════════════════════════════════════════════════════════════

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page — pass through with no chrome
  if (pathname === "/admin/login") return <>{children}</>;

  const title =
    Object.entries(PAGE_TITLE).find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === href || pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-gray-200 bg-white md:flex">

        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "oklch(0.30 0.14 332)" }}
          >
            C
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-gray-900">ClaraCare</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500">OS</div>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Navigation
          </p>
          <div className="space-y-0.5">
            {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  style={active ? { background: "oklch(0.30 0.14 332)" } : {}}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* All phases complete — no locked items */}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="flex flex-1 flex-col md:ml-56">

        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: "oklch(0.30 0.14 332)" }}
            >
              C
            </div>
            <span className="font-bold text-gray-900">{title}</span>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Page content (extra bottom padding on mobile for nav bar) */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-safe md:hidden">
        <div className="flex overflow-x-auto scrollbar-none">
          {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex shrink-0 flex-col items-center py-2 text-[10px] font-semibold transition-colors ${
                  active ? "text-amber-600" : "text-gray-400"
                }`}
                style={{ minWidth: "4rem" }}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-amber-500" />
                )}
                <Icon className={`h-5 w-5 ${active ? "text-amber-500" : "text-gray-400"}`} />
                <span className="mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
