import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  Eye,
  Users,
  Activity,
  FileText,
  Pill,
  ClipboardList,
  Bell,
  CheckCircle2,
  Brain,
  Lock,
  MonitorPlay,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Care Monitoring | Clara's CareTeam DFW",
  description:
    "Advanced resident monitoring for DFW care homes. Privacy-first smart oversight that keeps residents safe, staff accountable, and families informed — 24/7.",
};

/* ─── Hero ─── */
function MonitoringHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="Care monitoring hero"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.98) 0%, oklch(0.22 0.12 332 / 0.98) 50%, oklch(0.16 0.10 332 / 0.98) 100%)",
        }}
      />
      <div
        className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />
      <div
        className="absolute -left-24 bottom-0 h-96 w-96 rounded-full opacity-20 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
          Advanced Care Monitoring
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Smart Oversight. Safer Residents. Peace of Mind.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          Real-time care monitoring that protects residents and keeps families informed — without compromising privacy.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:18172655762"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
            data-track="monitoring-hero-call"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
            data-track="monitoring-hero-learn"
          >
            Learn More <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 0: AI Infrastructure / Core Technology ─── */
const coreTech = [
  {
    icon: Brain,
    title: "Smart Monitoring Infrastructure",
    sub: "AI Infrastructure",
    body: "Our monitoring layer uses advanced AI infrastructure to analyze care environments in real time — detecting patterns, flagging anomalies, and surfacing insights that manual oversight alone cannot catch.",
  },
  {
    icon: MonitorPlay,
    title: "Real-Time Room Activity Monitoring",
    sub: "Live Visibility",
    body: "Know what's happening in every room, every moment. Real-time room activity monitoring keeps care teams responsive and gives administrators the situational awareness they need to act fast when it matters.",
  },
  {
    icon: Lock,
    title: "Anonymized Computer Vision",
    sub: "Privacy by Design",
    body: "Our computer vision system monitors resident activity without recording identifiable images — protecting dignity while delivering the safety intelligence your facility depends on. Privacy is not an afterthought; it is built into the architecture.",
  },
];

function AIInfrastructure() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28"
      aria-label="AI monitoring infrastructure"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.20 0.10 332 / 0.97) 0%, oklch(0.26 0.12 332 / 0.97) 100%)",
      }}
    >
      <div
        className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent backdrop-blur-sm">
            AI Infrastructure
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">
            The Technology Behind the Care
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Advanced monitoring infrastructure — built for residential care homes,
            designed around resident dignity, and always on.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {coreTech.map(({ icon: Icon, title, sub, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/8 p-8 backdrop-blur-sm transition-all hover:bg-white/12"
            >
              <div className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-accent/80">
                {sub}
              </div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 leading-relaxed text-white/65">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 1: What Monitoring Means for You ─── */
const monitoringFeatures = [
  {
    icon: ShieldCheck,
    title: "Always-On Safety",
    body: "Continuous monitoring ensures residents are safe, cared for, and accounted for — every hour of every day.",
  },
  {
    icon: Eye,
    title: "Privacy-First by Design",
    body: "Our system protects resident dignity. All data is handled with strict confidentiality and compliance with Texas privacy standards.",
  },
  {
    icon: Users,
    title: "Family Transparency",
    body: "Families stay informed with real-time updates, reducing anxiety and building trust in the care their loved one receives.",
  },
];

function WhatMonitoringMeans() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="What care monitoring means">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            The Difference
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            What Care Monitoring Means for You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Smart oversight built around residents, families, and the people who care for them.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {monitoringFeatures.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-soft)]"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.96 0.02 330)" }}
              >
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold text-primary">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: What We Monitor ─── */
const monitorItems = [
  { icon: ShieldCheck, label: "Resident safety & wellness" },
  { icon: Users, label: "Staff activity & shift coverage" },
  { icon: FileText, label: "Incident tracking & documentation" },
  { icon: Pill, label: "Medication administration records" },
  { icon: ClipboardList, label: "Care plan adherence" },
  { icon: Bell, label: "Emergency alerts & response times" },
];

function WhatWeMonitor() {
  return (
    <section
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="What we monitor"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Coverage
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            What We Monitor
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            End-to-end visibility across every dimension of resident care and staff activity.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monitorItems.map(({ icon: Icon, lab