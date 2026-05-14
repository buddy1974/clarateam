"use client";

import { Phone, ArrowRight } from "lucide-react";

const OFFICE = "817-265-5762";

interface PageCTAProps {
  headline?: string;
  sub?: string;
}

export default function PageCTA({
  headline = "Ready to Get Started?",
  sub = "Family-owned. DFW-based. Available 24/7.",
}: PageCTAProps) {
  return (
    <section
      className="relative overflow-hidden py-20"
      aria-label="Call to action"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.98) 0%, oklch(0.22 0.12 332 / 0.98) 50%, oklch(0.16 0.10 332 / 0.98) 100%)",
        }}
      />
      <div
        className="absolute -left-24 bottom-0 h-96 w-96 rounded-full opacity-20 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
          {headline}
        </h2>
        <p className="mt-4 text-lg text-white/70">{sub}</p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={`tel:${OFFICE.replace(/-/g, "")}`}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
            data-track="page-cta-call"
          >
            <Phone className="h-5 w-5" />
            Call Now • {OFFICE}
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
            data-track="page-cta-care"
          >
            Get Care Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Clara&apos;s CareTeam, LLC · P.O. Box 200455, Arlington, TX 76006 ·{" "}
          DFW Residential Care Staffing · 24/7 On-Call
        </div>
      </div>
    </section>
  );
}
