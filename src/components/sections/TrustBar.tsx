"use client";

import { Phone } from "lucide-react";

const OFFICE = "817-548-1986";

export default function TrustBar() {
  return (
    <div
      id="trust-bar"
      className="sticky top-16 z-40 border-b border-border/50 bg-white/97 shadow-sm backdrop-blur-sm"
      aria-label="Trust and availability status"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">

        {/* Left — trust signal */}
        <p className="text-xs font-semibold text-foreground/65 sm:text-sm">
          <span className="hidden sm:inline">✔ Trusted Across </span>
          <span className="sm:hidden">✔ </span>
          Dallas–Fort Worth
        </p>

        {/* Center — live availability */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-bold text-foreground/75 sm:text-sm">
            <span className="hidden sm:inline">Coordinator </span>Available Now
          </span>
        </div>

        {/* Right — call CTA */}
        <a
          href={`tel:${OFFICE.replace(/-/g, "")}`}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white transition-a