import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import {
  Phone,
  ArrowRight,
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Activity,
  ClipboardList,
  LineChart,
  ShieldCheck,
  FileBarChart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio & Revenue Insights | Clara's CareTeam DFW",
  description:
    "Performance dashboards and revenue analytics for DFW residential care facilities. Predictive staffing intelligence, benchmarking, and portfolio tracking to protect your revenue.",
};

/* ─── Hero ─── */
function InsightsHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="Portfolio and revenue insights hero"
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
          Portfolio &amp; Revenue Insights
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Know Your Numbers. Protect Your Revenue.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          Performance dashboards and predictive intelligence that help DFW care home operators stay profitable, staffed, and survey-ready.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:18172655762"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
            data-track="insights-hero-call"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
            data-track="insights-hero-demo"
          >
            Get a Demo <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 1: What Insights Give You ─── */
const insightFeatures = [
  {
    icon: DollarSign,
    title: "Revenue Protection",
    body: "Identify billing gaps, reimbursement risks, and staffing cost overruns before they impact your bottom line.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Staffing",
    body: "Anticipate coverage gaps before they happen. Our intelligence layer flags scheduling risks so you're never caught short.",
  },
  {
    icon: BarChart3,
    title: "Performance Benchmarking",
    body: "Compare your facility's performance against DFW market benchmarks and identify areas to improve.",
  },
];

function WhatInsightsGiveYou() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="What insights give you">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            What You Gain
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            What Insights Give You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Move from gut instinct to data-driven decisions across every dimension of your operation.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {insightFeatures.map(({ icon: Icon, title, body }) => (
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

/* ─── Section 2: Dashboard Features ─── */
const dashboardItems = [
  { icon: Users, label: "Occupancy & census tracking" },
  { icon: DollarSign, label: "Staffing cost analysis" },
  { icon: ShieldCheck, label: "Survey readiness score" },
  { icon: Activity, label: "Incident trend analysis" },
  { icon: LineChart, label: "Revenue per resident" },
  { icon: ClipboardList, label: "Compliance adherence rate" },
];

function DashboardFeatures() {
  return (
    <section
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="Dashboard features"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Dashboard
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Dashboard Features
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every metric that matters — in one place, updated in real time.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white px-6 py-5 shadow-[var(--shadow-card)]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.96 0.02 330)" }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Built for Multi-Home Operators ─── */
const operatorCallouts = [
  {
    icon: BarChart3,
    title: "Portfolio-Level View Across Multiple Homes",
    desc: "See your entire portfolio in one dashboard — occupancy, revenue, compliance, and staffing across every location.",
  },
  {
    icon: FileBarChart,
    title: "Operator-Level and Facility-Level Drill-Down",
    desc: "Start at the 30,000-foot view and drill into any individual facility to understand what's driving performance.",
  },
  {
    icon: TrendingUp,
    title: "Exportable Reports for Lenders and Investors",
    desc: "Generate clean, professional reports that lenders, investors, and partners can read and trust.",
  },
];

function BuiltForOperators() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Built for multi-home operators">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Multi-Home Operators
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Built for Multi-Home Operators
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Managing more than one facility? Our insights platform scales with your portfolio.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {operatorCallouts.map(({ icon: Icon, title, desc }) => (
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
              <p className="mt-3 leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function InsightsPage() {
  return (
    <>
      <Navbar />
      <main>
        <InsightsHero />
        <WhatInsightsGiveYou />
        <DashboardFeatures />
        <BuiltForOperators />
        <PageCTA
          headline="Ready to See Your Facility's Full Picture?"
          sub="Talk to our team about performance insights for your DFW care portfolio."
        />
      </main>
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
