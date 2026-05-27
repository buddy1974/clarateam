import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ServicesGrid from "@/components/sections/ServicesGrid";
import PageCTA from "@/components/PageCTA";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Phone, ArrowRight, CheckCircle, Building2, Home, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Care Services | Clara's CareTeam DFW",
  description:
    "Clara's CareTeam provides certified CNA, LVN, HHA, PCA, and RN caregivers to DFW families and facilities. 24/7 staffing, fully vetted, fast placement.",
};

function ServicesHero() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pt-40"
      aria-label="Services hero"
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
          Our Services
        </span>
        <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Certified Caregivers for Every Level of Care
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          From companion care to skilled nursing, we place vetted, credentialed caregivers across DFW — quickly, reliably, and with care.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:8172655762"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg transition-all hover:scale-[1.03]"
          >
            <Phone className="h-5 w-5" /> Call 817-265-5762
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

function WhoWeServe() {
  const cards = [
    {
      icon: Building2,
      title: "Assisted Living & Facilities",
      desc: "We staff CNAs, LVNs, HHAs, and RNs for residential care facilities, memory care homes, and assisted living communities across DFW on a per-diem or contract basis.",
    },
    {
      icon: Home,
      title: "Private Families",
      desc: "Whether you need a few hours of companion care or around-the-clock skilled nursing at home, we match your loved one with the right caregiver — fast.",
    },
    {
      icon: User,
      title: "Individual Patients",
      desc: "Recovering from surgery, managing a chronic condition, or needing memory care support — we tailor placement to your specific diagnosis, preferences, and schedule.",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Who We Serve</h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/60">
            We work with families, facilities, and individuals across Dallas/Fort Worth.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-secondary/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.30 0.14 332 / 0.10)" }}>
                <Icon className="h-6 w-6" style={{ color: "oklch(0.30 0.14 332)" }} />
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

function ServicePromise() {
  const points = [
    "Background-checked & credentialed staff",
    "24/7 on-call support",
    "Fast placements — often same or next day",
    "No long-term contracts required",
    "Family-owned and locally operated",
    "Serving 35+ DFW cities",
  ];
  return (
    <section className="bg-secondary/30 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">The Clara Promise</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {points.map((p) => (
            <div key={p} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-accent" />
              <span className="text-sm font-semibold text-foreground">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <ServicesHero />
      <ServicesGrid />
      <WhoWeServe />
      <ServicePromise />
      <PageCTA />
      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
