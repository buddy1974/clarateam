"use client";

import { motion } from "framer-motion";
import { PhoneCall, ClipboardList, UserCheck, Heart } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: PhoneCall,
    title: "You Contact Us",
    desc:  "Tell us what you need",
    detail: "Call, text, or fill out our form — 24/7.",
  },
  {
    n: "02",
    icon: ClipboardList,
    title: "We Assess Your Needs",
    desc:  "We understand your situation",
    detail: "We listen and match against your care environment.",
  },
  {
    n: "03",
    icon: UserCheck,
    title: "We Match a Caregiver",
    desc:  "We find the right professional",
    detail: "Selected from our fully vetted pool, matched on skill and fit.",
  },
  {
    n: "04",
    icon: Heart,
    title: "Care Begins",
    desc:  "Support starts quickly",
    detail: "Your professional arrives prepared and ready. Every time.",
  },
];

export default function ProcessTimeline() {
  return (
    <section
      id="process"
      className="bg-gradient-to-b from-secondary/40 to-white py-16 sm:py-24"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl text-center"
        >
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-foreground/65">
            Simple. Fast. Reliable care when you need it.
          </p>
        </motion.div>

        {/* ── Desktop: horizontal 4-col ── */}
        <div className="mt-14 hidden md:grid md:grid-cols-4 md:gap-6 lg:gap-10">
          {STEPS.map(({ n, icon: Icon, title, desc, detail }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.12 + 0.35 }}
                  className="absolute left-[calc(50%+40px)] top-10 h-[2px] w-[calc(100%-80px)] origin-left bg-gradient-to-r from-accent/50 to-accent/20"
                />
              )}

              {/* Icon badge */}
              <div className="relative mb-5">
                <motion.div
                  whileHover={{ scale: 1.07 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-[var(--shadow-soft)]"
                >
                  <Icon className="h-9 w-9" />
                </motion.div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-primary">
                  {n}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-primary">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-accent">{desc}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{detail}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Mobile: vertical timeline ── */}
        <div className="mt-12 md:hidden">
          <div className="relative ml-4">
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-[2px] origin-top bg-gradient-to-b from-accent/60 via-accent/30 to-transparent"
            />

            <div className="space-y-8">
              {STEPS.map(({ n, icon: Icon, title, desc, detail }, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
           