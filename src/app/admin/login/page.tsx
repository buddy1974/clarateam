"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Shield, Smartphone, ChevronDown } from "lucide-react";

const USERS = [
  { handle: "kevin",   label: "Kevin James Dean" },
  { handle: "jessica", label: "Jessica" },
  { handle: "carter",  label: "Chantay Carter" },
  { handle: "marcel",  label: "Marcel" },
];

export default function AdminLogin() {
  const [handle, setHandle]   = useState(USERS[0].handle);
  const [digits, setDigits]   = useState(["", "", "", "", "", ""]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs             = useRef<(HTMLInputElement | null)[]>([]);
  const router                = useRouter();

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  async function submit(code: string) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, code }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect code — try again.");
      setDigits(["", "", "", "", "", ""]);
      setLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (digit && index === 5) {
      const code = [...next.slice(0, 5), digit].join("");
      if (code.length === 6) submit(code);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setDigits(pasted.split("")); submit(pasted); }
  }

  function handleUserChange(newHandle: string) {
    setHandle(newHandle);
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  const code = digits.join("");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, oklch(0.12 0.10 332) 0%, oklch(0.20 0.14 332) 55%, oklch(0.16 0.10 332) 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(0.74 0.14 75 / 0.25), transparent)" }} />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="inline-flex items-center rounded-3xl px-5 py-2 shadow-2xl"
            style={{ background: "oklch(0.74 0.14 75)", boxShadow: "0 0 60px oklch(0.74 0.14 75 / 0.50), 0 16px 40px rgba(0,0,0,0.60)" }}>
            <Image src="/logo2.png" alt="Clara's CareTeam" width={240} height={96} className="h-14 w-auto" priority />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-400/70" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Secure Admin Access</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.07)" }}>
          <h2 className="mb-1 text-center font-serif text-xl font-bold text-white">ClaraCare OS</h2>

          {/* User selector */}
          <div className="mb-5 mt-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/50">
              Who&apos;s signing in?
            </label>
            <div className="relative">
              <select
                value={handle}
                onChange={(e) => handleUserChange(e.target.value)}
                disabled={loading}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition-all focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-40"
                style={{ colorScheme: "dark" }}
              >
                {USERS.map((u) => (
                  <option key={u.handle} value={u.handle} style={{ background: "#1a0a1e", color: "#fff" }}>
                    {u.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
            <p className="text-xs leading-relaxed text-white/55">
              Open your authenticator app and enter the 6-digit code for your account.
            </p>
          </div>

          <label className="mb-3 block text-center text-xs font-bold uppercase tracking-widest text-white/50">
            Authentication Code
          </label>

          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className="h-12 w-10 rounded-xl border border-white/20 bg-white/10 text-center text-lg font-bold text-white outline-none transition-all focus:border-amber-400/70 focus:bg-white/15 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-40"
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-center text-sm font-semibold text-red-300">{error}</p>
          )}

          <button
            onClick={() => code.length === 6 && submit(code)}
            disabled={loading || code.length < 6}
            className="mt-5 w-full rounded-full py-3.5 text-sm font-extrabold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            style={{ background: "oklch(0.74 0.14 75)" }}
          >
            {loading ? "Verifying…" : "Enter Operations Center"}
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/25">
          Clara&apos;s CareTeam · Operations Platform · Secure Access
        </p>
      </div>
    </div>
  );
}
