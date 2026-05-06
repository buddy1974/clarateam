"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, CheckCircle2, Phone, Mic, Sparkles } from "lucide-react";

const OFFICE = "817-548-1986";

type Urgency = "today" | "24h" | "this-week";
type CareType = "cna" | "memory" | "companion";

const URGENCY_OPTIONS: { value: Urgency; label: string; sub: string; highlight?: boolean }[] = [
  { value: "today",     label: "Today",           sub: "Within hours",    highlight: true },
  { value: "24h",       label: "Within 24 Hours",  sub: "Tomorrow"         },
  { value: "this-week", label: "This Week",         sub: "Planned ahead"   },
];

const CARE_OPTIONS: { value: CareType; label: string; sub: string }[] = [
  { value: "cna",       label: "CNA / Medical Support", sub: "Certified nursing assistant" },
  { value: "memory",    label: "Memory Care",            sub: "Alzheimer's & dementia" },
  { value: "companion", label: "Companion Care",         sub: "Daily support & comfort" },
];

export default function EmergencyWidget() {
  const [urgency, setUrgency]       = useState<Urgency | null>(null);
  const [careType, setCareType]     = useState<CareType | null>(null);
  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urgency, careType, name, phone }),
      });
    } catch {
      // Non-blocking — still show success to avoid friction
    }

    await new Promise((r) => setTimeout(r, 500));
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
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-5 px-8 py-16 text-center"
                >
                  <div className="flex h-18 w-18 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-9 w-9 text-green-600" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                    We're on it!
                  </h3>
                  <p className="max-w-sm text-base text-foreground/70">
                    Our team will call you within{" "}
                    <strong className="text-primary">15 minutes</strong>. For fastest
                    response, call directly:
                  </p>
                  <a
                    href={`tel:${OFFICE.replace(/-/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-bold text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-deep"
                    data-track="widget-call-after-submit"
                  >
                    <Phone className="h-4 w-4" /> {OFFICE}
                  </a>
                </motion.div>
              ) : (
                <motion.div key="form" className="p-6 sm:p-8 lg:p-10">
                  {/* Header */}
                  <div className="mb-8 flex items-center gap-3">
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

                  <form onSubmit={handleSubmit} noValidate className="space-y-7">

                    {/* Step 1 — Urgency */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/55">
                        When do you need care?
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {URGENCY_OPTIONS.map(({ value, label, sub, highlight }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setUrgency(value)}
                            aria-pressed={urgency === value}
                            className={`relative rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                              urgency === value
                                ? "border-accent bg-accent/8 shadow-sm"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            {highlight && (
                              <span className="absolute -top-2.5 left-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                                Recommended
                              </span>
                            )}
                            <div className={`text-sm font-bold ${urgency === value ? "text-primary" : "text-foreground"}`}>
                              {label}
                            </div>
                            <div className="mt-0.5 text-[11px] text-foreground/50">{sub}</div>
                          </button>
                        ))}
                      </div>

                      {/* Escalation message */}
                      <AnimatePresence>
                        {urgency === "today" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5">
                              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                              <p className="text-sm font-semibold text-green-800">
                                We can likely place someone within hours.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Step 2 — Care type */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/55">
                        What type of care do you need?
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {CARE_OPTIONS.map(({ value, label, sub }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setCareType(value)}
                            aria-pressed={careType === value}
                            className={`rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                              careType === value
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <div className={`text-sm font-bold ${careType === value ? "text-primary" : "text-foreground"}`}>
                              {label}
                            </div>
                            <div className="mt-0.5 text-[11px] text-foreground/50">{sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 3 — Optional contact */}
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/55">
                        Your info{" "}
                        <span className="normal-case font-normal text-foreground/40 tracking-normal">
                          (optional — speeds up matching)
                        </span>
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-xl border-2 border-border bg-background px-4 py-3.5 text-sm font-medium placeholder:text-foreground/35 transition-colors focus:border-primary focus:outline-none"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Best phone number"
                          className="w-full rounded-xl border-2 border-border bg-background px-4 py-3.5 text-sm font-medium placeholder:text-foreground/35 transition-colors focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-base font-extrabold text-primary shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] hover:brightness-105 active:scale-100 disabled:opacity-60"
                        data-track="emergency-widget-submit"
                      >
                        {submitting ? (
                          "Matching…"
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Match Me Instantly
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      {error && (
                        <p className="text-center text-xs text-destructive">{error}</p>
                      )}

                      {/* AI + Voice links */}
                      <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                          className="flex items-center gap-1 text-sm text-foreground/55 transition-colors hover:text-primary"
                        >
                          Not sure? Ask our AI →
                        </button>
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                          className="flex items-center gap-1.5 text-sm font-semibold text-foreground/55 transition-colors hover:text-primary"
                          aria-label="Speak instead of typing"
                        >
                          <Mic className="h-3.5 w-3.5" />
                          Speak instead
                        </button>
                        <span className="text-xs text-foreground/35">
                          Or call:{" "}
                          <a
                            href={`tel:${OFFICE.replace(/-/g, "")}`}
                            className="font-bold text-primary"
                            data-track="widget-inline-call"
                          >
                            {OFFICE}
                          </a>
                        </span>
                      </div>
                    </div>
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
