import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Clock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Caregiving Opportunities | Clara's CareTeam DFW",
  description:
    "Join Clara's CareTeam — caregiving opportunities for CNAs, LVNs, HHAs, and PCAs across Dallas / Fort Worth. Page coming soon.",
  robots: { index: false },
};

export default function CaregivingOpportunitiesPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.97) 0%, oklch(0.22 0.12 332 / 0.97) 60%, oklch(0.16 0.10 332 / 0.97) 100%)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[130px]"
          style={{ background: "oklch(0.74 0.14 75)" }}
        />

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Clara&apos;s CareTeam
          </span>

          <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Caregiving{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-100 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h1>

          <div className="mt-6 flex items-center justify-center gap-3 text-white/70">
            <Clock className="h-5 w-5 text-amber-400" />
            <p className="text-lg font-semibold">Coming Soon</p>
          </div>

          <p className="mt-4 text-base leading-relaxed text-white/60">
            We&apos;re building a dedicated space for CNAs, LVNs, HHAs, and PCAs looking
            to join our DFW care team. Check back shortly — or call us now to ask about
            open shifts.
          </p>

          <a
            href="tel:18172655762"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100"
          >
            Call 817-265-5762
          </a>
        </div>
      </main>
    </>
  );
}
