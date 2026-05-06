"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Shield, Clock, CheckCircle2, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import heroHome from "@/assets/hero-home.jpg";

const OFFICE = "817-548-1986";

const STATS = [
  { k: "24/7", v: "On-Call" },
  { k: "35+", v: "DFW Areas" },
  { k: "100%", v: "Pre-Screened" },
  { k: "0", v: "Min. Hours" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export default function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center"
      aria-label="Hero — Clara's CareTeam residential care staffing"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src={heroHome}
          alt="Bright, welcoming residential care home"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay — dark plum for contrast */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.93) 0%, oklch(0.26 0.14 332 / 0.86) 50%, oklch(0.36 0.16 332 / 0.72) 100%)",
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gold accent glow */}
      <div
        className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full opacity-20 blur-[120px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              DFW's Compliance-First Care Staffing
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="mt-6 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            Reliable Staff for{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-accent via-amber-300 to-amber-100 bg-clip-text text-transparent">
                Residential Care Homes
              </span>
            </span>
{" "}<span className="inline-block">Across DFW</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl"
          >
            Peace of mind, every shift — without the stress. Fully vetted,{" "}
            <strong className="text-white">6-point screened</strong> professionals
            matched to your residents in minutes, not days.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="mt-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#emergency"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-primary shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:opacity-95 active:scale-100 sm:w-auto"
                data-track="hero-request"
              >
                Get Care Today <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`tel:${OFFICE.replace(/-/g, "")}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-white/10 px-6 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
                data-track="hero-call"
              >
                <Phone className="h-4 w-4" /> Call Now • {OFFICE}
              </a>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
              className="mt-4 flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
            >
              Not sure what you need? Ask our AI →
            </button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.4}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-white/85"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              6-Point Due Diligence
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              24/7 On-Call
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              TWC & Survey Ready
            </div>
          </motion.div>
          {/* Mobile stat pills — desktop shows floating card instead */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden"
            aria-hidden="true"
          >
            {STATS.map(({ k, v }) => (
              <span
                key={v}
                className="flex-shrink-0 