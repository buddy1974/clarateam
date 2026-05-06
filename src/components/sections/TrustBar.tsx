"use client";

import { Phone } from "lucide-react";

const OFFICE = "817-548-1986";

export default function TrustBar() {
  return (
    <div
      id="trust-bar"
      className="sticky top-16 z-40 border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-sm"
      aria-label="Trust and availability status"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">

        {/* Left — trust signal */}
        <p className="hidden text-sm font-semibold text-foreground/70 sm:block">
          ✔ Trusted Across Dallas–Fort Worth
        </p>

        {/* Center — live availability */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-bold text-foreground/80">
            Coordinator Available Now
          </span>
        </div>

        {/* Right — call CTA */}
        <a
          href={`tel:${OFFICE.replace(/-/g, "")}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-all hover:bg-primary-deep hover:scale-[1.02] active:scale-100"
          data-track="trustbar-call"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Call Now •</span> {OFFICE}
        </a>

      </div>
    </div>
  );
}
