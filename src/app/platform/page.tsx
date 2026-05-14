import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import {
  Users2, Home, Activity, Wrench, BarChart3, Shield,
  CheckCircle2, ArrowRight, Phone, Brain, Lock, MonitorPlay,
  UserCheck, Briefcase, Star, TrendingUp, FileText,
  ClipboardCheck, AlertTriangle, Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Platform | Clara's CareTeam DFW — Full Care Operations System",
  description:
    "Clara's CareTeam is more than a staffing agency. Explore our complete care operations platform: Healthcare Staffing, Residential Placement, Advanced Monitoring, Care Tools, Revenue Insights, and Third Party Compliance — all serving DFW.",
};

const PHONE = "817-265-5762";

/* ══════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════ */
function PlatformHero() {
  return (
    <section
      className="relative overflow-hidden pb-28 pt-36 sm:pt-44"
      aria-label="Platform overview hero"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.10 332 / 0.98) 0%, oklch(0.20 0.12 332 / 0.98) 60%, oklch(0.14 0.10 332 / 0.98) 100%)",
        }}
      />
      <div
        className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full opacity-15 blur-[130px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />
      <div
        className="absolute -left-24 bottom-0 h-96 w-96 rounded-full opacity-10 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent backdrop-blur-sm">
          Our Solutions Platform
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Staffing, Compliance &amp; Care Operations —{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, oklch(0.74 0.14 75), oklch(0.85 0.12 75))",
            }}
          >
            All in One Place
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
          Clara&apos;s CareTeam is not just a staffing agency. We provide a full care
          operations system for DFW residential care homes and families — from
          caregiver placement to real-time monitoring, compliance, and beyond.
        </p>

        <p className="mt-3 text-base font-semibold text-accent/90 italic">
          Our Team. Your Care.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={`tel:${PHONE.replace(/-/g, "")}`}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 sm:w-auto"
            data-track="platform-hero-call"
          >
            <Phone className="h-5 w-5" />
            Call Now • {PHONE}
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
          >
            Get Care Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Quick-jump anchors */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[
            ["Staffing",   "#staffing"],
            ["Placement",  "#placement"],
            ["Monitoring", "#monitoring"],
            ["Care Tools", "#care-tools"],
            ["Insights",   "#insights"],
            ["Compliance", "#compliance"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs font-bold text-white/75 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   1 — HEALTHCARE STAFFING REGISTRY
══════════════════════════════════════════════════════════════ */
const staffingRoles = [
  { icon: UserCheck, label: "Certified Nursing Assistants (CNA)" },
  { icon: UserCheck, label: "Licensed Vocational Nurses (LVN)" },
  { icon: UserCheck, label: "Home Health Aides (HHA)" },
  { icon: UserCheck, label: "Personal Care Aides (PCA)" },
  { icon: UserCheck, label: "Companion Caregivers" },
  { icon: Briefcase, label: "Fractional Managers" },
  { icon: Briefcase, label: "Directors of Nursing (DON)" },
  { icon: Briefcase, label: "Administrators & Operational Leaders" },
];

const staffingPoints = [
  "PRN, short-term, and long-term placements — no minimums",
  "Same-day and emergency coverage available 24/7",
  "6-point due diligence: background check, drug screen, OIG/LEIE, references",
  "EMR / MAR / NAR competency verified before every placement",
  "TWC-compliant payroll — workers' comp and liability covered",
];

function StaffingSection() {
  return (
    <section id="staffing" className="bg-white py-20 sm:py-28" aria-label="Healthcare Staffing Registry">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                <Users2 className="h-6 w-6 text-white" />
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary">
                Module 01
              </span>
            </div>
            <h2 className="mt-5 font-serif text-3xl font-bold text-primary sm:text-4xl">
              Healthcare Staffing Registry
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/70">
              Our staffing registry connects residential care homes across DFW with
              fully vetted, compliance-ready caregivers and clinical leaders — exactly
              when you need them, without contracts or minimums.
            </p>
            <ul className="mt-6 space-y-3">
              {staffingPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-foreground/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
            <a
              href="/#services"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"
            >
              View staffing details <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {staffingRoles.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-4 text-sm font-semibold text-foreground"
              >
                <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   2 — RESIDENTIAL PLACEMENT
══════════════════════════════════════════════════════════════ */
const placementSteps = [
  { n: "01", title: "Free Consultation", desc: "Tell us about your loved one's care level, location preference, and budget." },
  { n: "02", title: "Home Matching",     desc: "We identify licensed, vetted assisted living facilities that fit." },
  { n: "03", title: "Guided Tours",      desc: "We coordinate tours and answer every question alongside you." },
  { n: "04", title: "Care Begins",       desc: "Once you choose, we support the transition so care starts smoothly." },
];

function PlacementSection() {
  return (
    <section
      id="placement"
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="Residential Placement"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
              <Home className="h-6 w-6 text-black" />
            </div>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary">
              Module 02
            </span>
          </div>
          <h2 className="mt-5 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Residential Placement
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/70">
            We match families to the right assisted living facility across DFW —
            at no cost. Our placement experts assess care needs, location, budget,
            and culture fit to find the home where your loved one will thrive.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {placementSteps.map(({ n, title, desc }) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <div className="font-serif text-4xl font-extrabold text-accent/30">{n}</div>
              <h3 className="mt-3 font-serif text-lg font-bold text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/residential-placement"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"
          >
            Full placement details <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   3 — ADVANCED RESIDENTIAL MONITORING
══════════════════════════════════════════════════════════════ */
const monitoringCapabilities = [
  {
    icon: Brain,
    title: "AI Infrastructure",
    desc: "Smart monitoring technology analyzes care environments in real time — detecting patterns and surfacing insights that manual oversight alone cannot catch.",
  },
  {
    icon: MonitorPlay,
    title: "Real-Time Room Activity",
    desc: "Know what's happening in every room, every moment. Live activity tracking gives administrators the situational awareness to act fast when it matters.",
  },
  {
    icon: Lock,
    title: "Anonymized Computer Vision",
    desc: "Privacy by design — our computer vision monitors resident activity without recording identifiable images, protecting dignity while delivering safety intelligence.",
  },
  {
    icon: Activity,
    title: "24/7 Always-On Safety",
    desc: "Continuous monitoring ensures residents are safe and accounted for every hour of every day, including nights, weekends, and holidays.",
  },
];

function MonitoringSection() {
  return (
    <section
      id="monitoring"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-label="Advanced Residential Monitoring"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.18 0.10 332 / 0.97) 0%, oklch(0.24 0.12 332 / 0.97) 100%)",
      }}
    >
      <div
        className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-accent">
            Module 03
          </span>
        </div>
        <h2 className="mt-5 font-serif text-3xl font-bold text-white sm:text-4xl">
          Advanced Residential Monitoring
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
          Smart, privacy-first oversight built on AI infrastructure — giving care
          home operators real-time visibility and giving families peace of mind, without
          compromising resident dignity.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {monitoringCapabilities.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm transition-all hover:bg-white/12"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href="/care-monitoring"
            className="inline-flex items-center gap-2 text-sm font-bold text-accent transition-colors hover:text-accent/80"
          >
            Full monitoring details <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   4 — CARE TOOLS
══════════════════════════════════════════════════════════════ */
const careTools = [
  { icon: ClipboardCheck, title: "MAR / NAR Documentation",   desc: "Medication and nursing records built for Texas residential care requirements." },
  { icon: FileText,       title: "EMR Compatibility",          desc: "Integrates with common electronic medical record systems already in use." },
  { icon: Users2,         title: "Shift Management",           desc: "Scheduling, handoff notes, and coverage tracking so nothing falls through the cracks." },
  { icon: Star,           title: "Personalized Resident Tools", desc: "Care plans and workflow tools tailored to each resident's individual needs." },
];

function CareToolsSection() {
  return (
    <section
      id="care-tools"
      className="bg-white py-20 sm:py-28"
      aria-label="Care Tools"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-blue-700">
                Module 04
              </span>
            </div>
            <h2 className="mt-5 font-serif text-3xl font-bold text-primary sm:text-4xl">
              Care Tools
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/70">
              Practical, personalized care tools that help caregivers document,
              coordinate, and deliver excellent care every shift. Less paperwork
              friction, better resident outcomes.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground/65">
              Proper documentation is not just good practice — it is your facility&apos;s
              protection during state surveys and audits. Our tools are designed around
              Texas residential care requirements so your team is always compliant and
              confident.
            </p>
            <a
              href="/care-tools"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"
            >
              Explore care tools <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {careTools.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-secondary/20 p-6 transition-all hover:shadow-[var(--shadow-card)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-serif text-base font-bold text-primary">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   5 — PORTFOLIO & REVENUE INSIGHTS
══════════════════════════════════════════════════════════════ */
const insightFeatures = [
  { icon: TrendingUp,  title: "Predictive Intelligence",    desc: "Anticipate staffing gaps and revenue risks before they happen. Act on data, not gut instinct." },
  { icon: BarChart3,   title: "Live Analytics",              desc: "Real-time dashboards showing occupancy, census, staffing costs, and compliance adherence." },
  { icon: Star,        title: "Performance Benchmarking",   desc: "See how your facility compares against DFW market benchmarks — and where to improve." },
  { icon: FileText,    title: "Better Outcomes Reporting",  desc: "Exportable reports for operators, lenders, and investors with the metrics that matter." },
];

function InsightsSection() {
  return (
    <section
      id="insights"
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="Portfolio and Revenue Insights"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-violet-700">
              Module 05
            </span>
          </div>
          <h2 className="mt-5 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Portfolio &amp; Revenue Insights
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/70">
            Predictive intelligence and live analytics for better outcomes. Performance
            dashboards that help DFW care home operators protect their revenue,
            stay fully staffed, and make smarter decisions.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {insightFeatures.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10">
                <Icon className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-serif text-base font-bold text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"
          >
            Full insights details <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   6 — THIRD PARTY COMPLIANCE
══════════════════════════════════════════════════════════════ */
const complianceBullets = [
  {
    icon: AlertTriangle,
    title: "Risk Identification & Management",
    exact: "Identify and manage risks that jeopardize adherence to regulations",
    desc:
      "Proactive risk tracking flags issues before a surveyor walks through your door — so you are always ahead of the curve, not reacting to citations.",
  },
  {
    icon: CheckCircle2,
    title: "Quality Measure Control",
    exact: "Control quality measures to assure reimbursement",
    desc:
      "Track, document, and improve the metrics that matter most to payers and regulators — protecting your revenue while improving resident outcomes.",
  },
  {
    icon: BarChart3,
    title: "Provider Performance Monitoring",
    exact: "Monitor, benchmark, and report on provider performance",
    desc:
      "Understand how your caregivers, administrators, and contractors are performing across your facility or portfolio — and act on data.",
  },
  {
    icon: Settings,
    title: "Custom Compliance Workflows",
    exact: "Create unique workflows for compliance reporting",
    desc:
      "Workflows designed around your care model, your state requirements, and your team's actual processes — not generic checklists.",
  },
  {
    icon: FileText,
    title: "Attorney-Authored Risk Assessments",
    exact: "Conduct risk assessments with attorney-authored content",
    desc:
      "Compliance decisions grounded in legal expertise — protecting your facility from regulatory exposure with assessments that hold up to scrutiny.",
  },
];

function ComplianceSection() {
  return (
    <section
      id="compliance"
      className="bg-white py-20 sm:py-28"
      aria-label="Third Party Compliance"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-rose-700">
            Module 06
          </span>
        </div>
        <h2 className="mt-5 font-serif text-3xl font-bold text-primary sm:text-4xl">
          Third Party Compliance
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/70">
          Managing risk and regulatory adherence — end-to-end compliance infrastructure
          built for Texas residential care homes, so you stay survey-ready every shift,
          every day.
        </p>

        {/* 5 required bullets — full cards */}
        <div className="mt-12 space-y-4">
          {complianceBullets.map(({ icon: Icon, title, exact, desc }, i) => (
            <div
              key={title}
              className="flex gap-5 rounded-2xl border border-border bg-secondary/20 p-6 transition-all hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-600/10">
                <Icon className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-extrabold text-rose-600/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-primary">{title}</h3>
                </div>
                <p className="mb-2 text-xs font-semibold italic text-foreground/40">
                  &ldquo;{exact}&rdquo;
                </p>
                <p className="text-sm leading-relaxed text-foreground/70">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href="/compliance"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"
          >
            Full compliance system details <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function PlatformPage() {
  return (
    <>
      <Navbar />
      <main>
        <PlatformHero />
        <StaffingSection />
        <PlacementSection />
        <MonitoringSection />
        <CareToolsSection />
        <InsightsSection />
        <ComplianceSection />
        <PageCTA
          headline="Ready to Work with a True Care Operations Partner?"
          sub="Call us or request care now — DFW families and facilities, available 24/7."
        />
      </main>
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
