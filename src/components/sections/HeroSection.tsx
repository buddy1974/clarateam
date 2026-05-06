"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, CheckCircle2, ArrowRight, Sparkles, ChevronDown, Mic } from "lucide-react";

const OFFICE = "817-548-1986";

const TRUST = [
  "Background Checked",
  "CNA / RN Verified",
  "Available Within Hours",
  "24/7 Support",
];

const FLOAT_STATS = [
  { icon: "🟢", label: "Available Now", sub: "Staff ready to deploy" },
  { icon: "⚡", label: "Same-Day Placement", sub: "Most shifts filled < 4 hrs" },
  { icon: "✅", label: "100% Verified Staff", sub: "6-point due diligence" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export default function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center"
      aria-label="Hero — Clara's CareTeam residential care staffing"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.png"
          alt="Caregiver assisting elderly at home"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Directional overlay — dense left for text legibility, fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#140a1e]/90 to-[#140a1e]/40" />
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#140a1e]/60 to-transparent" />
        {/* Gold ambient glow */}
        <div
          className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/3 translate-x-1/4 rounded-full opacity-15 blur-[130px]"
          style={{ background: "oklch(0.74 0.14 75)" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
        <div className="max-w-2xl">

          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              DFW's Trusted Residential Care Staffing
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="mt-6 font-serif text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4rem]"
          >
            Find Trusted Care for{" "}
            <span className="bg-gradient-to-r from-accent via-amber-300 to-amber-100 bg-clip-text text-transparent">
              Your Loved One
            </span>
            {" "}— Within Hours, Not Days
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/85 sm:text-xl"
          >
            Fully vetted caregivers. Immediate placement.{" "}
            <strong className="text-white">Peace of mind for Dallas families.</strong>
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="mt-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#emergency"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-primary shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
                data-track="hero-request"
              >
                Get Care Today <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`tel:${OFFICE.replace(/-/g, "")}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-6 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
                data-track="hero-call"
              >
                <Phone className="h-4 w-4" /> Call Now • {OFFICE}
              </a>
            </div>

            {/* AI + Voice links */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                className="flex items-center gap-1 text-sm text-white/65 transition-colors hover:text-white"
              >
                Not sure what you need? Ask our AI →
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
                aria-label="Speak to get help"
              >
                <Mic className="h-3.5 w-3.5 text-accent" />
                Speak instead — tell us what you need
              </button>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.4}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3"
          >
            {TRUST.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating glass card — desktop only */}
        <motion.div
          initial={{ opacity: 0, y: 40, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 hidden