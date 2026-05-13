"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, CheckCircle2, Phone, Mic, Sparkles, Check, Loader2 } from "lucide-react";

const OFFICE = "817-265-5762";

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
  const [submitting,     setSubmitting]     = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const [voicePrefilled, setVoicePrefilled] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progress — urgency + care type = 2 steps
  const stepsCompleted = (urgency ? 1 : 0) + (careType ? 1 : 0);
  const progressLabel =
    stepsCompleted === 0 ? "Tell us what you need below"       :
    stepsCompleted === 1 ? "One more — then we'll match you"   :
                           "Ready — we can match you now ✓";

  const selectedUrgencyOption = URGENCY_OPTIONS.find((o) => o.value === urgency);

  // A7 — idle prompt: reset 9s timer on every selection change
  useEffect(() => {
    if (submitted) return;
    setShowIdlePrompt(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setShowIdlePrompt(true), 9000);
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [urgency, careType, submitted]);

  // A8 — voice prefill: listen for "voice-input" event with detail.text
  useEffect(() => {
    const handler = (e: Event) => {
      const text = ((e as CustomEvent).detail?.text ?? "").toLowerCase();
      if (text.includes("today") || text.includes("now") || text.includes("urgent"))
        setUrgency("today");
      else if (text.includes("tomorrow") || text.includes("24"))
        setUrgency("24h");
      else if (text.includes("week"))
        setUrgency("this-week");
      if (text.includes("cna") || text.includes("nurse") || text.includes("medical"))
        setCareType("cna");
      else if (text.includes("memory") || text.includes("dementia") || text.includes("alzheimer"))
        setCareType("memory");
      else if (text.includes("companion") || text.includes("daily") || text.includes("support"))
        setCareType("companion");
      if (text.length > 0) setVoicePrefilled(true);
    };
    window.addEventListener("voice-input", handler);
    return () => window.removeEventListener("voice-input", handler);
  }, []);

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
      className="relative overflow-hidden bg-gray-50 py-16 sm:py-20"
      aria-label="Get care now"
    >
      {/* Section top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
              Get Started
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get Care Today
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Tell us what you need — we'll match you within hours.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="overflow-hidden rounded-xl bg-white shadow-[var(--shadow-elegant)]"
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
                  <h3 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
                    You're all set.
                  </h3>
                  <p className="max-w-sm text-base text-gray-600">
                    A care coordinator will reach out shortly.{" "}
                    <strong className="text-gray-900">
                      We respond within 15 minutes.
                    </strong>
                  </p>
                  <a
                    href={`tel:${OFFICE.replace(/-/g, "")}`}
                    className={`inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-bold text-white shadow-[var(--shadow-soft)] transition-all hover:brightness-105 ${
                      urgency === "today"
                        ? "bg-accent text-primary shadow-lg shadow-amber-500/30 scale-105"
                        : "bg-primary hover:bg-primary-deep"
                    }`}
                    data-track="widget-call-after-submit"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now • {OFFICE}
                  </a>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Ask our AI →
                  </button>
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
                      <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
                        Get Care Now
                      </h2>
                      <p className="mt-0.5 text-sm text-gray-600">
                        Matched to your residents in minutes, not days.
                      </p>
                    </div>
                  </div>

                  {/* A8 — voice prefill notice */}
                  <AnimatePresence>
                    {voicePrefilled && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 rounded-lg bg-accent/10 px-3 py-2 text-xs font-semibold text-accent"
                      >
                        ✔ We filled this based on what you said.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Progress indicator */}
                  <motion.div
                    className="mb-6 flex items-center gap-3"
                    layout
                  >
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
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
                          stepsCompleted === 2 ? "text-accent" : "text-gray-500"
                        }`}
                      >
                        {progressLabel}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-7">

                    {/* Step 1 — Urgency */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                        When do you need care?
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                                  ? "border-accent bg-accent/10 shadow-[0_0_0_3px_oklch(0.74_0.14_75/0.15)]"
                                  : "border-gray-200 hover:border-accent/50"
                              }`}
                            >
                              {highlight && (
                                <span className="absolute -top-2.5 left-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                                  Recommended
                                </span>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-gray-900">
                                  {label}
                                </div>
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex h-5 w-5 items-center justify-center rounded-full bg-accent"
                                    >
                                      <Check className="h-3 w-3 text-primary" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="mt-0.5 text-[11px] text-gray-500">{sub}</div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Contextual urgency message */}
                      <AnimatePresence>
                        {selectedUrgencyOption && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            {(() => {
                              const c = contextColors[selectedUrgencyOption.contextColor];
                              return (
                                <div className={`flex items-center gap-2 rounded-xl border ${c.border} ${c.bg} px-4 py-2.5`}>
                                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${c.dot} ${c.glow}`} />
                                  <p className={`text-sm font-semibold ${c.text}`}>
                                    {selectedUrgencyOption.contextMsg}
                                  </p>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Step 2 — Care type */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                        What type of care do you need?
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {CARE_OPTIONS.map(({ value, label, sub }) => {
                          const isSelected = careType === value;
                          return (
                            <motion.button
                              key={value}
                              type="button"
                              onClick={() => setCareType(value)}
                              aria-pressed={isSelected}
                              animate={{ scale: isSelected ? 1.03 : 1 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ duration: 0.2 }}
                              className={`rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                isSelected
                                  ? "border-accent bg-accent/10 shadow-[0_0_0_3px_oklch(0.74_0.14_75/0.15)]"
                                  : "border-gray-200 hover:border-accent/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-gray-900">
                                  {label}
                                </div>
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex h-5 w-5 items-center justify-center rounded-full bg-accent"
                                    >
                                      <Check className="h-3 w-3 text-black" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="mt-0.5 text-[11px] text-gray-500">{sub}</div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3 — Optional contact */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                        Your info{" "}
                        <span className="normal-case font-normal text-gray-400 tracking-normal">
                          (optional — speeds up matching)
                        </span>
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="min-h-[44px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors focus:border-accent focus:outline-none"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Best phone number"
                          className="min-h-[44px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-3 pt-1">
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileTap={{ scale: 0.98 }}
                        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] hover:brightness-105 disabled:opacity-70"
                        data-track="emergency-widget-submit"
                      >
                        <AnimatePresence mode="wait">
                          {submitting ? (
                            <motion.span
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Finding available caregivers…
                            </motion.span>
                          ) : (
                            <motion.span
                              key="idle"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              Match Me Instantly
                              <ChevronRight className="h-4 w-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Micro-trust line */}
                      <p className="text-center text-[11px] font-semibold text-gray-400">
                        ✔ No obligation &nbsp;•&nbsp; ✔ Fast response &nbsp;•&nbsp; ✔ Fully vetted staff
                      </p>

                      {/* AI + Voice + Phone */}
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                          className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-900"
                        >
                          Not sure? Ask our AI →
                        </button>
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
                        >
                          <Mic className="h-3 w-3" />
                          Speak instead
                        </button>
                        <span className="text-xs text-gray-400">
                          Or call:{" "}
                          <a
                            href={`tel:${OFFICE.replace(/-/g, "")}`}
                            className="font-bold text-gray-900"
                            data-track="widget-inline-call"
                          >
                            {OFFICE}
                          </a>
                        </span>
                      </div>
                    </div>

                    {/* A7 — idle AI nudge */}
                    <AnimatePresence>
                      {showIdlePrompt && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.35 }}
                          className="mt-2 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowIdlePrompt(false);
                              window.dispatchEvent(new CustomEvent("open-ai-chat"));
                            }}
                            className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
                          >
                            Need help choosing? Ask our AI →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
