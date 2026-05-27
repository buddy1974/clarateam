import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Heart, Shield, Clock, Users, ArrowRight, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Clara's CareTeam DFW",
  description:
    "Clara's CareTeam is a family-owned DFW care staffing agency. Learn our story, our values, and why families and facilities trust us with their most important care needs.",
};

function AboutHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="About hero"
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
          About Us
        </span>
        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Care Rooted in Family
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          Clara's CareTeam was founded on a simple belief — every person deserves compassionate, expert care delivered by people who genuinely show up.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:8172655762"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg transition-all hover:scale-[1.03]"
          >
            <Phone className="h-5 w-5" /> 817-265-5762
          </a>
          <a
            href="/caregiving-opportunities"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary"
          >
            Join Our Team <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function OurStory() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Our Story</h2>
            <div className="mt-5 space-y-4 text-foreground/65 leading-relaxed">
              <p>
                Clara's CareTeam was born out of a deeply personal understanding of what it means to need reliable, compassionate care — and how hard it can be to find it. Based in the Dallas/Fort Worth metroplex, we set out to bridge that gap.
              </p>
              <p>
                We're a family-owned staffing agency with deep roots in the DFW community. We work with residential care facilities, assisted living homes, and private families to place certified caregivers who don't just fill a shift — they make a difference.
              </p>
              <p>
                Our team is available 24/7 because care doesn't run on a 9-to-5 schedule. Whether it's a planned placement or an urgent same-day need, we answer the call.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "DFW Cities Served",    value: "35+",  color: "oklch(0.30 0.14 332)" },
              { label: "Available 24/7",        value: "Always", color: "oklch(0.74 0.14 75)" },
              { label: "Caregiver Roles",       value: "CNA · LVN · HHA · PCA · RN", color: "oklch(0.30 0.14 332)" },
              { label: "Response Time",         value: "Same Day", color: "oklch(0.74 0.14 75)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-border bg-secondary/40 p-5 text-center">
                <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
                <div className="mt-1 text-xs font-semibold text-foreground/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OurValues() {
  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      desc: "We treat every client and caregiver with the dignity and respect they deserve. This isn't just staffing — it's people caring for people.",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      desc: "Every caregiver is thoroughly background-checked, credentialed, and vetted before being placed. Your safety is our baseline, not an afterthought.",
    },
    {
      icon: Clock,
      title: "Reliability",
      desc: "We show up. No-call-no-show is not in our vocabulary. When you need coverage, we deliver — and we stay in communication until you're taken care of.",
    },
    {
      icon: Users,
      title: "Community Roots",
      desc: "Family-owned and DFW-based, we're not a national franchise. We know this community, we live in it, and we're invested in making it better.",
    },
  ];

  return (
    <section className="bg-secondary/30 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Our Values</h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/55">
            These aren't words on a wall — they're how we make every decision.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.30 0.14 332 / 0.10)" }}>
                <Icon className="h-5 w-5" style={{ color: "oklch(0.30 0.14 332)" }} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutHero />
      <OurStory />
      <OurValues />
      <TestimonialsSection />
      <PageCTA />
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
