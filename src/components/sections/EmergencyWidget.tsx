"use client";

import { useState, useEffect, useRef } from "react";
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
      className="relative overflow-hidden bg-gradient-to-br from-[#140a1e] via-[#1e0f2e] to-[#140a1e] py-16 sm:py-20"
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
            className="overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm"
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
                    className="text-sm text-foreground/50 transition-colors hover:text-primary"
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
                      <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                        Get Care Now
                      </h2>
                      <p className="mt-0.5 text-sm text-foreground/60">
                        Tell us what you need — we'll match you within hours.
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
                  </Anim