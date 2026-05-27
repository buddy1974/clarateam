"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect PIN. Try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, oklch(0.16 0.10 332) 0%, oklch(0.22 0.12 332) 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 backdrop-blur">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-white/55">Clara&apos;s CareTeam Operations</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <label className="mb-1.5 block text-sm font-semibold text-white/70">PIN</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !pin}
            className="mt-5 w-full rounded-full bg-accent py-3 text-sm font-extrabold text-black transition-all hover:brightness-105 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
