"use client";

import { useEffect, useState } from "react";
import { Users, Shield, ShieldOff, Crown, UserCheck } from "lucide-react";

interface AdminUser {
  id:          number;
  name:        string;
  displayName: string;
  role:        string;
  active:      boolean;
  lastLogin:   string | null;
  createdAt:   string;
}

function fmt(dt: string | null) {
  if (!dt) return "Never";
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggle(user: AdminUser, field: "active" | "role") {
    setSaving(user.id);
    const body =
      field === "active"
        ? { id: user.id, active: !user.active }
        : { id: user.id, role: user.role === "super_admin" ? "administrator" : "super_admin" };

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) await load();
    setSaving(null);
  }

  const roleLabel = (r: string) => r === "super_admin" ? "Super Admin" : "Administrator";
  const roleColor = (r: string) =>
    r === "super_admin"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "oklch(0.74 0.14 75 / 0.15)" }}>
          <Users className="h-5 w-5" style={{ color: "oklch(0.60 0.14 75)" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-sm text-gray-500">Manage who can access ClaraCare OS</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-opacity ${
                !user.active ? "opacity-50" : ""
              }`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg ${
                    user.active ? "bg-gray-100 text-gray-700" : "bg-gray-50 text-gray-400"
                  }`}>
                    {user.displayName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-400 font-mono">@{user.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Role badge */}
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColor(user.role)}`}>
                    {user.role === "super_admin" ? <Crown className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                    {roleLabel(user.role)}
                  </span>

                  {/* Active badge */}
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    user.active
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {user.active ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-400">
                  Last login: <span className="text-gray-600">{fmt(user.lastLogin)}</span>
                </p>

                <div className="flex gap-2">
                  {/* Toggle role */}
                  <button
                    onClick={() => toggle(user, "role")}
                    disabled={saving === user.id}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    {user.role === "super_admin" ? "Set Administrator" : "Set Super Admin"}
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => toggle(user, "active")}
                    disabled={saving === user.id}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                      user.active
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {user.active
                      ? <><ShieldOff className="h-3.5 w-3.5" />Disable</>
                      : <><Shield className="h-3.5 w-3.5" />Enable</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800 font-semibold mb-1">TOTP Secrets</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          To regenerate a user&apos;s authenticator code, update their <code className="font-mono bg-amber-100 px-1 rounded">totp_secret</code> in the Neon database and have them re-scan from <a href="/admin/setup-totp" className="underline font-semibold">/admin/setup-totp</a>. Remember to set SETUP_TOKEN first.
        </p>
      </div>
    </div>
  );
}
