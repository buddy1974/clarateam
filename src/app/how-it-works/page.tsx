import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import FAQSection from "@/components/sections/FAQSection";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Phone, ArrowRight, Clock, ShieldCheck, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | Clara's CareTeam DFW",
  description:
    "See how Clara's CareTeam matches DFW families and facilities with certified caregivers in 3 simple steps. Fast, transparent, and personal.",
};

function HowItWorksHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="How it works hero"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.98) 0%, oklch(0.22 0.12 332 / 0.98) 50%, oklch(0.16 0.10 332 / 0.98) 100%)",
        }}
      />
      <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }} />
      <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full opacity-20 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }} />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
          How It Works
        </span>
        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Simple, Fast, and Personal
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          Getting the right caregiver shouldn't be complicated. Our process gets you matched and staffed — often the same day.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:8172655762"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg transition-all hover:scale-[1.03]"
          >
            <Phone className="h-5 w-5" /> Start Now — 817-265-5762
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary"
          >
            Send a Message <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function WhyItWorks() {
  const cards = [
    {
      icon: Clock,
      title: "Same-Day Placement",
      desc: "We maintain an active roster of credentialed caregivers so we can often fill a shift the same day you call.",
    },
    {
      icon: ShieldCheck,
      title: "Fully Vetted Staff",
      desc: "Every caregiver is background-checked, credentialed, and personally screened before joining our team.",
    },
    {
      icon: HeartHandshake,
      title: "Personal Matching",
      desc: "We don't just fill a slot — we consider personality, care needs, and schedule to find the right fit.",
    },
  ];

  return (
    <section className="bg-secondary/30 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Why Our Process Works</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.74 0.14 75 / 0.15)" }}>
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <HowItWorksHero />
      <ProcessTimeline />
      <WhyItWorks />
      <FAQSection />
      <PageCTA />
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
