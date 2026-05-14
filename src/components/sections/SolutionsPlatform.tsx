"use client";

import { motion } from "framer-motion";
import {
  Users2,
  Home,
  Activity,
  Wrench,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";

const MODULES = [
  {
    icon: Users2,
    tag: "Staffing",
    title: "Healthcare Staffing Registry",
    desc: "Caregivers, CNA, LVN, and Fractional Managers — placed PRN or long-term, matched to your shift within hours.",
    href: "/#services",
    color: "from-primary/10 to-primary/5",
    iconBg: "bg-primary",
  },
  {
    icon: Home,
    tag: "Placement",
    title: "Residential Placement",
    desc: "Assisted living facility matching — we place families in the right licensed care home based on needs, location, and budget.",
    href: "/residential-placement",
    color: "from-accent/15 to-accent/5",
    iconBg: "bg-accent",
    iconColor: "text-black",
  },
  {
    icon: Activity,
    tag: "Monitoring",
    title: "Advanced Residential Monitoring",
    desc: "AI infrastructure with anonymized computer vision — real-time room activity monitoring with privacy by design.",
    href: "/care-monitoring",
    color: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-600",
  },
  {
    icon: Wrench,
    tag: "Tools",
    title: "Care Tools",
    desc: "Personalized care tools for residents — workflow support, documentation, and care coordination in one place.",
    href: "/care-tools",
    color: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-600",
  },
  {
    icon: BarChart3,
    tag: "Insights",
    title: "Portfolio & Revenue Insights",
    desc: "Predictive intelligence and live analytics for better outcomes — performance dashboards that protect your revenue.",
    href: "/insights",
    color: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-600",
  },
  {
    icon: Shield,
    tag: "Compliance",
    title: "Third Party Compliance",
    desc: "Managing risk and regulatory adherence — attorney-authored assessments, custom workflows, and full compliance reporting.",
    href: "/compliance",
    color: "from-rose-500/10 to-rose-500/5",
    iconBg: "bg-rose-600",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function SolutionsPlatform() {
  return (
    <section
      id="solutions"
      className="relative overflow-hidden bg-gradient-to-b from-white to-secondary/30 py-20 sm:py-28"
      aria-label="Our Solutions Platform"
    >
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.30 0.14 332) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Our Solutions Platform
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            More Than Staffing —{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              A Full Care Operations System
            </span>
          </h2>
          <p className="mt-5 text-lg text-foreground/70 sm:text-xl">
            We combine staffing, compliance management, and smart care tools so
            your facility runs safely, stays survey-ready, and scales with
            confidence.
          </p>
        </motion.div>

        {/* 2×3 grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {MODULES.map(({ icon: Icon, tag, title, desc, href, color, iconBg, iconColor }) => (
            <motion.a
              key={title}
              href={href}
              variants={card}
              className={`group relative flex flex-col rounded-3xl border border-border bg-gradient-to-br ${color} p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)]`}
            >
              {/* Tag */}
              <span className="mb-4 inline-block self-start rounded-full bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-foreground/60 shadow-sm">
                {tag}
              </span>

              {/* Icon */}
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} shadow-lg`}
              >
                <Icon className={`h-5 w-5 ${iconColor ?? "text-white"}`} />
              </div>

              {/* Content */}
              <h3 className="font-serif text-lg font-bold text-primary">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{desc}</p>

              {/* CTA row */}
              <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-primary transition-all group-hover:gap-2.5">
                Explore
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center text-sm font-semibold text-foreground/50"
        >
          ✔ All modules. One trusted DFW partner. &nbsp;•