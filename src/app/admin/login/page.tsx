"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLogin() {
  const [pin, setPin]       = useState("");
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState("");
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
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background: "linear-gradient(160deg, oklch(0.12 0.10 332) 0%, oklch(0.20 0.14 332) 55%, oklch(0.16 0.10 332) 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(0.74 0.14 75 / 0.25), transparent)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="inline-flex items-center rounded-3xl px-5 py-2 shadow-2xl"
            style={{
              background: "oklch(0.74 0.14 75)",
              boxShadow: "0 0 60px oklch(0.74 0.14 75 / 0.50), 0 16px 40px rgba(0,0,0,0.60)",
            }}
          >
            <Image
              src="/logo2.png"
              alt="Clara's CareTeam"
              width={240}
              height={96}
              className="h-14 w-auto"
              priority
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-400/70" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Secure Admin Access</span>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <h2 className="mb-5 text-center font-serif text-xl font-bold text-white">ClaraCare OS</h2>

          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/50">PIN</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/60"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-center text-sm font-semibold text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="mt-5 w-full rounded-full py-3.5 text-sm font-extrabold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            style={{ background: "oklch(0.74 0.14 75)" }}
          >
            {loading ? "Verifying…" : "Enter Operations Center"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-white/25">
          Clara&apos;s CareTeam · Operations Platform · Secure Access
        </p>
      </div>
    </div>
  );
}
