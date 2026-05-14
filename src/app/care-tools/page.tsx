import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import {
  Phone,
  ArrowRight,
  Pill,
  Layers,
  Calendar,
  ClipboardList,
  CheckCircle2,
  FileText,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Care Tools | Clara's CareTeam DFW",
  description:
    "Caregiver workflow tools for DFW residential care homes. MAR/EMR documentation, shift management, and care coordination tools that save time and improve outcomes.",
};

/* ─── Hero ─── */
function CareToolsHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="Care tools hero"
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
          Care Tools
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Better Tools. Better Care. Better Outcomes.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          Practical tools that help caregivers document, coordinate, and deliver excellent care — every shift.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:18172655762"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
            data-track="tools-hero-call"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
            data-track="tools-hero-explore"
          >
            Explore Tools <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 1: Tools Caregivers Actually Use ─── */
const tools = [
  {
    icon: Pill,
    title: "MAR / NAR Documentation",
    body: "Medication and nursing administration records built for Texas residential care home requirements.",
  },
  {
    icon: Layers,
    title: "EMR Compatibility",
    body: "Seamlessly integrates with common electronic medical record systems your facility already uses.",
  },
  {
    icon: Calendar,
    title: "Shift Management",
    body: "Easy shift scheduling, handoff notes, and coverage tracking — so nothing falls through the cracks.",
  },
  {
    icon: ClipboardList,
    title: "Care Plan Coordination",
    body: "Centralized care plans accessible to every caregiver on every shift.",
  },
];

function ToolsCaregiversUse() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Tools caregivers actually use">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Built to Be Used
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Tools Caregivers Actually Use
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No bloated software. No training manuals. Just practical tools designed around how care actually works.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ icon: Icon, title, body }) => (
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

/* ─── Section 2: Why Tools Matter for Compliance ─── */
const complianceBullets = [
  "Proper documentation protects your facility during state surveys",
  "Consistent records reduce liability and improve resident outcomes",
  "Digital tools mean fewer errors and faster communication",
];

function WhyToolsMatter() {
  return (
    <section
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="Why tools matter for compliance"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Compliance Impact
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Why Tools Matter for Compliance
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Left: bullets */}
          <div className="flex flex-col justify-center gap-5">
            {complianceBullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <p className="text-lg leading-relaxed text-foreground">{bullet}</p>
              </div>
            ))}
          </div>

          {/* Right: stat card */}
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-10 text-center shadow-[var(--shadow-card)]"
          >
            <span className="font-serif text-6xl font-bold text-primary">6-Point</span>
            <span className="mt-3 text-lg font-bold text-foreground">
              Due Diligence on every caregiver we place
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Because documentation starts with who&apos;s in the building
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Designed for DFW Care Homes ─── */
const dfwCards = [
  {
    icon: FileText,
    title: "Survey-Ready Records",
    desc: "All documentation is structured to meet Texas state survey requirements — no scrambling when inspectors arrive.",
  },
  {
    icon: CheckCircle2,
    title: "TWC-Compliant Documentation",
    desc: "Worker classification and payroll documentation that satisfies Texas Workforce Commission standards.",
  },
  {
    icon: UserCheck,
    title: "Real-Time Caregiver Accountability",
    desc: "Know who is on shift, what was completed, and what needs follow-up — in real time.",
  },
];

function DesignedForDFW() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Designed for DFW care homes">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            DFW-Focused
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Designed for DFW Care Homes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tools that fit how Texas residential care homes actually operate.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {dfwCards.map(({ icon: Icon, title, desc }) => (
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
export default function CareToolsPage() {
  return (
    <>
      <Navbar />
      <main>
        <CareToolsHero />
        <ToolsCaregiversUse />
        <WhyToolsMatter />
        <DesignedForDFW />
        <PageCTA
          headline="Want Better Tools for Your Care Team?"
          sub="Talk to us about care tools and workflow support for your facility."
        />
      </main>
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
