import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import {
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  UserCheck,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Compliance System | Clara's CareTeam DFW",
  description:
    "End-to-end compliance system for DFW residential care homes. Risk management, quality control, provider benchmarking, custom workflows, and attorney-authored risk assessments — all built for Texas care regulations.",
};

/* ─── Hero ─── */
function ComplianceHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="Compliance system hero"
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
          Compliance System
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Stay Survey-Ready. Every Shift. Every Day.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          A complete compliance infrastructure for Texas residential care homes — built around your regulatory obligations, not around paperwork.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:18172655762"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
            data-track="compliance-hero-call"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
            data-track="compliance-hero-team"
          >
            Talk to Compliance Team <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 1: The 5 Core Compliance Capabilities ─── */
const complianceCapabilities = [
  {
    icon: ShieldAlert,
    title: "Risk Identification & Management",
    body: "We identify and manage risks that jeopardize your facility's adherence to state and federal regulations — before a surveyor walks through your door. Proactive risk tracking means you're always ahead of the curve, not reacting to citations.",
    infographic: "Identify and manage risks that jeopardize adherence to regulations",
  },
  {
    icon: CheckCircle2,
    title: "Quality Measure Control",
    body: "Control the quality measures that directly impact your reimbursement rates. We help you track, document, and improve the metrics that matter most to payers and regulators — protecting your revenue while improving resident outcomes.",
    infographic: "Control quality measures to assure reimbursement",
  },
  {
    icon: BarChart3,
    title: "Provider Performance Monitoring",
    body: "Monitor, benchmark, and report on provider performance across your facility or portfolio. Understand how your caregivers, administrators, and contractors are performing — and act on data, not gut instinct.",
    infographic: "Monitor, benchmark, and report on provider performance",
  },
  {
    icon: Settings,
    title: "Custom Compliance Workflows",
    body: "Create unique workflows for compliance reporting tailored to your facility's specific obligations. No generic checklists — workflows designed around your care model, your state requirements, and your team's actual processes.",
    infographic: "Create unique workflows for compliance reporting",
  },
  {
    icon: FileText,
    title: "Attorney-Authored Risk Assessments",
    body: "Conduct risk assessments built on attorney-authored content — so your compliance decisions are grounded in legal expertise, not guesswork. Protect your facility from regulatory exposure with assessments that hold up to scrutiny.",
    infographic: "Conduct risk assessments with attorney-authored content",
  },
];

function CoreCapabilities() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Five core compliance capabilities">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Core System
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Five Capabilities. One System.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every piece of the compliance puzzle — in a single, coordinated platform built for Texas care operators.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-6">
          {complianceCapabilities.map(({ icon: Icon, title, body, infographic }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "oklch(0.96 0.02 330)" }}
                >
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-bold text-primary">{title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">
                      {infographic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: Why Compliance Is a Revenue Issue ─── */
const revenueStats = [
  { value: "100%", label: "Pre-Screened Staff" },
  { value: "TWC", label: "Compliant Payroll" },
  { value: "Survey-Ready", label: "Every Placement" },
];

function ComplianceAsRevenue() {
  return (
    <section
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="Why compliance is a revenue issue"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Revenue Impact
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Why Compliance Is a Revenue Issue
          </h2>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Left: prose */}
          <div className="flex flex-col justify-center gap-6 text-lg leading-relaxed text-foreground">
            <p>
              Texas state surveys are not just a checkbox exercise. Citations and deficiencies have a direct and immediate effect on your reimbursement rates, census, and reputation. A single poorly documented shift can create months of regulatory headaches.
            </p>
            <p>
              Every citation costs money — in remediation, in lost residents, and in the staff time consumed by corrective action plans. Facilities that treat compliance as a cost center miss the bigger picture: proactive compliance is one of the highest-return investments a care home operator can make.
            </p>
            <p>
              Operators who maintain strong compliance programs consistently outperform competitors in census, staff retention, and reimbursement capture. In DFW's competitive residential care market, compliance is a differentiator — not just an obligation.
            </p>
          </div>

          {/* Right: stat callouts */}
          <div className="grid gap-4">
            {revenueStats.map(({ value, label }) => (
              <div
                key={label}
                className="flex items-center gap-6 rounded-2xl border border-border bg-white px-8 py-6 shadow-[var(--shadow-card)]"
              >
                <span className="font-serif text-4xl font-bold text-primary">{value}</span>
                <span className="text-lg font-bold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Compliance Coverage Across DFW ─── */
const coverageAreas = [
  {
    icon: ShieldCheck,
    title: "Texas DADS Regulations",
    desc: "Full alignment with Texas Department of Aging and Disability Services standards for residential care operations.",
  },
  {
    icon: FileText,
    title: "CMS Requirements",
    desc: "Federal Centers for Medicare & Medicaid Services requirements addressed where they apply to your facility type.",
  },
  {
    icon: UserCheck,
    title: "Worker Classification (TWC)",
    desc: "Texas Workforce Commission-compliant worker classification so you never face misclassification exposure.",
  },
  {
    icon: Search,
    title: "Background & Exclusion Checks",
    desc: "Every caregiver we place passes OIG exclusion checks, criminal background screening, and reference verification.",
  },
];

function ComplianceCoverage() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Compliance coverage across DFW">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Full Coverage
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Compliance Coverage Across DFW
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From state inspections to federal requirements, we cover every dimension of your regulatory footprint.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coverageAreas.map(({ icon: Icon, title, desc }) => (
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
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function CompliancePage() {
  return (
    <>
      <Navbar />
      <main>
        <ComplianceHero />
        <CoreCapabilities />
        <ComplianceAsRevenue />
        <ComplianceCoverage />
        <PageCTA
          headline="Make Compliance Your Competitive Advantage"
          sub="Talk to our compliance team — free consultation for DFW residential care facilities."
        />
      </main>
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
