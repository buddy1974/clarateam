"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, CheckCircle2, Phone, Mic, Sparkles, Check, Loader2 } from "lucide-react";

const OFFICE = "817-548-1986";

type Urgency  = "today" | "24h" | "this-week";
type CareType = "cna"   | "memory" | "companion";

const URGENCY_OPTIONS: {
  value: Urgency;
  label: string;
  sub: string;
  highlight?: boolean;
  contextMsg: string;
  contextColor: "green" | "blue" | "purple";
}[] = [
  {
    value: "today",
    label: "Today",
    sub: "Within hours",
    highlight: true,
    contextMsg: "We can likely place a caregiver within hours.",
    contextColor: "green",
  },
  {
    value: "24h",
    label: "Within 24 Hours",
    sub: "Tomorrow",
    contextMsg: "We'll match you within the same day.",
    contextColor: "blue",
  },
  {
    value: "this-week",
    label: "This Week",
    sub: "Planned ahead",
    contextMsg: "We'll find the best long-term fit for your needs.",
    contextColor: "purple",
  },
];

const CARE_OPTIONS: { value: CareType; label: string; sub: string }[] = [
  { value: "cna",       label: "CNA / Medical Support", sub: "Certified nursing assistant" },
  { value: "memory",    label: "Memory Care",            sub: "Alzheimer's & dementia"      },
  { value: "companion", label: "Companion Care",         sub: "Daily support & comfort"     },
];

const contextColors = {
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  dot: "bg-green-500",  glow: "shadow-[0_0_6px_rgba(34,197,94,0.6)]"   },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-800",   dot: "bg-blue-500",   glow: "shadow-[0_0_6px_rgba(59,130,246,0.6)]"  },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", dot: "bg-purple-500", glow: "shadow-[0_0_6px_rgba(147,51,234,0.6)]"  },
};

export default function EmergencyWidget() {
  const [urgency,    setUrgency]    = useState<Urgency | null>(null);
  const [careType,   setCareType]   = useState<CareType | null>(null);
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  // Progress — urgency + care type = 2 steps
  const stepsCompleted = (urgency ? 1 : 0) + (careType ? 1 : 0);
  const progressLabel =
    stepsCompleted === 0 ? "Tell us what you need below"       :
    stepsCompleted === 1 ? "One more — then we'll match you"   :
                           "Ready — we can match you now ✓";

  const selectedUrgencyOption = URGENCY_OPTIONS.find((o) => o.value === urgency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urgency, careType, name, phone }),
      });
    } catch {
      // Non-blocking — submit always succeeds client-side
    }

    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section
      id="emergency"
      className="relative overflow-hidden bg-gradient-to-br from-secondary/60 via-white to-secondary/30 py-16 sm:py-20"
      aria-label="Get care now"
    >
      {/* Gold accent rule */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-elegant)] ring-1 ring-border"
          >
            <AnimatePresence mode="wait">

              {/* ── Success state ───────────────────────────────────────── */}
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-5 px-8 py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </motion.div>
                  <h3 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                    You're all set.
                  </h3>
                  <p className="max-w-sm text-base text-foreground/65">
                    A care coordinator will reach out shortly.{" "}
                    <strong className="text-primary">
                      We respond within 15 minutes.
                    </strong>
                  </p>
                  <a
                    href={`tel:${OFFICE.replace(/-/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-bold text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-deep"
                    data-track="widget-call-after-submit"
                  >
                    <Phone className="h-4 w-4" />
                    Or call now for immediate help
                  </a>
                  <p className="text-xs text-foreground/40">{OFFICE}</p>
                </motion.div>

              ) : (

                /* ── Form ────────────────────────────────────────────────── */
                <motion.div key="form" className="p-6 sm:p-8 lg:p-10">

                  {/* Header */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Zap className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                        Get Care Now
                      </h2>
                      <p className="mt-0.5 text-sm text-foreground/60">
                        Tell us what you need — we'll match you within hours.
                      </p>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <motion.div
                    className="mb-6 flex items-center gap-3"
                    layout
                  >
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        animate={{ width: `${(stepsCompleted / 2) * 100}%` }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={progressLabel}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className={`whitespace-nowrap text-xs font-bold ${
                          stepsCompleted === 2 ? "text-accent" : "text-foreground/50"
                        }`}
                      >
                        {progressLabel}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-7">

                    {/* Step 1 — Urgency */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/55">
                        When do you need care?
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {URGENCY_OPTIONS.map(({ value, label, sub, highlight }) => {
                          const isSelected = urgency === value;
                          return (
                            <motion.button
                              key={value}
                              type="button"
                              onClick={() => setUrgency(value)}
                              aria-pressed={isSelected}
                              animate={{ scale: isSelected ? 1.03 : 1 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ duration: 0.2 }}
                              className={`relative rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                isSelected
                                  ? "border-accent bg-accent/8 shadow-[0_0_0_3px_oklch(0.74_0.14_75/0.15)]"
                                  : "border-border hover:border-accent/50"
