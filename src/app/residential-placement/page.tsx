import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Phone, ArrowRight, Star, DollarSign, MapPin, CheckCircle, Users, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Residential Placement | Clara's CareTeam DFW",
  description:
    "Clara's CareTeam helps DFW families find the right residential care home. Free placement matching based on care needs, location, and budget. Serving Arlington, Fort Worth, Dallas and 35+ cities.",
};

/* ─── Hero ─── */
function PlacementHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="Residential placement hero"
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
          Residential Placement
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Find the Right Care Home for Your Loved One
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          We match families to licensed residential care homes across DFW — at no cost to you.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:18172655762"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
            data-track="placement-hero-call"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
          <a
            href="/#emergency"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
            data-track="placement-hero-match"
          >
            Get a Match <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 1: What Is Residential Placement ─── */
const features = [
  {
    icon: Star,
    title: "Expert Matching",
    body: "We assess your loved one's care level, preferences, and budget, then recommend homes we trust.",
  },
  {
    icon: DollarSign,
    title: "No Cost to Families",
    body: "Our placement service is completely free to families. We work with licensed care homes directly.",
  },
  {
    icon: MapPin,
    title: "Local DFW Knowledge",
    body: "We know every neighborhood and care home in Arlington, Fort Worth, Dallas, Grand Prairie and beyond.",
  },
];

function WhatIsPlacement() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="What is residential placement">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            What We Do
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            What Is Residential Placement?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Residential placement means we help you find a licensed care home that fits your family — not just any bed that's open.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
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

/* ─── Section 2: Our Placement Process ─── */
const steps = [
  {
    num: "01",
    title: "Free Consultation",
    body: "Tell us about your loved one's needs, location preference, and budget.",
  },
  {
    num: "02",
    title: "Home Matching",
    body: "We identify licensed, vetted residential care homes that are the right fit.",
  },
  {
    num: "03",
    title: "Guided Tours",
    body: "We coordinate tours and answer every question alongside you.",
  },
  {
    num: "04",
    title: "Care Begins",
    body: "Once you choose, we help with the transition so care starts smoothly.",
  },
];

function PlacementProcess() {
  return (
    <section
      className="bg-gradient-to-b from-secondary/30 to-white py-20 sm:py-28"
      aria-label="Our placement process"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Our Process
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Our Placement Process
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four simple steps from first call to first day of care.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ num, title, body }) => (
            <div
              key={num}
              className="relative rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-card)]"
            >
              <span
                className="font-serif text-5xl font-bold"
                style={{ color: "oklch(0.74 0.14 75 / 0.25)" }}
              >
                {num}
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold text-primary">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Types of Care ─── */
const careTypes = [
  { icon: Users, label: "Memory Care", desc: "Specialized environments for residents living with Alzheimer's or dementia." },
  { icon: CheckCircle, label: "Personal Care", desc: "Daily living assistance — bathing, dressing, meals — in a home-like setting." },
  { icon: Home, label: "Assisted Living", desc: "Supportive residential care for those who need help but value their independence." },
  { icon: ArrowRight, label: "Respite / Short-Term Stays", desc: "Temporary care to give family caregivers a break or aid recovery after hospitalization." },
];

function TypesOfCare() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Types of care we place">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Care Options
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Types of Care We Place
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From long-term personal care to short-term respite, we find the right fit.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {careTypes.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-soft)]"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.96 0.02 330)" }}
              >
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 font-serif text-lg font-bold text-primary">{label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function ResidentialPlacementPage() {
  return (
    <>
      <Navbar />
      <main>
        <PlacementHero />
        <WhatIsPlacement />
        <PlacementProcess />
        <TypesOfCare />
        <PageCTA
          headline="Ready to Find the Right Home?"
          sub="Free, no-obligation placement consultation for DFW families."
        />
      </main>
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
