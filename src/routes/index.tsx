import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone, Mail, MapPin, Shield, Clock, Users, Heart, CheckCircle2, Sparkles,
  Brain, UserCheck, Briefcase, AlertCircle, ArrowRight, Star, Menu, X, Smartphone, Globe,
} from "lucide-react";
import logo from "@/assets/logo.png";
import heroHome from "@/assets/hero-home.jpg";
import caregiver from "@/assets/caregiver-resident.jpg";
import care1 from "@/assets/care-1.jpg";
import care3 from "@/assets/care-3.jpg";
import care4 from "@/assets/care-4.jpg";
import care5 from "@/assets/care-5.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Clara's CareTeam | Reliable Residential Care Staffing in DFW" },
      {
        name: "description",
        content:
          "AI-powered, compliance-first residential care staffing for DFW. PRN coverage, professional caregivers, memory care specialists & fractional leadership — 24/7.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Clara's CareTeam | Residential Care Staffing" },
      {
        property: "og:description",
        content: "Peace of mind, every shift. Family-owned, fully vetted caregivers across DFW.",
      },
      { property: "og:url", content: "https://claracareteam.com" },
      { property: "og:image", content: "https://claracareteam.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [
      { rel: "canonical", href: "https://claracareteam.com" },
    ],
  }),
});

const OFFICE = "817-265-5762";
const MOBILE = "469-853-5038";
const EMAIL = "info@claracareteam.com";

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b-2 border-accent/30 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={logo} alt="Clara's CareTeam" className="h-12 w-auto sm:h-14" />
          </a>
          <nav className="hidden items-center gap-8 lg:flex">
            {[
              ["Services", "#services"],
              ["Why Us", "#why"],
              ["Legacy", "#legacy"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="text-base font-semibold text-foreground transition-colors hover:text-primary">
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <a href={`tel:${OFFICE.replace(/-/g, "")}`}>
              <Button className="bg-gradient-to-r from-primary to-primary-deep text-base font-semibold shadow-[var(--shadow-soft)] hover:opacity-95">
                <Phone className="h-4 w-4" /> Office {OFFICE}
              </Button>
            </a>
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-2 text-foreground lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background lg:hidden">
            <div className="space-y-1 px-4 py-3">
              {[
                ["Services", "#services"],
                ["Why Us", "#why"],
                ["Legacy", "#legacy"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-base font-semibold text-foreground hover:bg-secondary hover:text-primary"
                >
                  {label}
                </a>
              ))}
              <a href={`tel:${OFFICE.replace(/-/g, "")}`} className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-primary to-primary-deep text-base">
                  <Phone className="h-4 w-4" /> Office {OFFICE}
                </Button>
              </a>
              <a href={`tel:${MOBILE.replace(/-/g, "")}`} className="block pt-2">
                <Button variant="outline" className="w-full border-2 border-accent text-accent text-base">
                  <Smartphone className="h-4 w-4" /> Mobile {MOBILE}
                </Button>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        {/* gold radial glow */}
        <div
          className="absolute -right-32 top-10 -z-10 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div className="absolute inset-0 -z-10 opacity-[0.08]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-28">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent/60 bg-accent/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              AI-Powered Staff Matching · DFW
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Reliable Staffing for{" "}
              <span className="bg-gradient-to-r from-accent via-accent-soft to-white bg-clip-text text-transparent">
                Residential Care Homes
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/95 sm:text-xl">
              Peace of mind, every shift — without the stress. Fully vetted, compliance-ready
              professionals matched to your residents in minutes, not days.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#contact">
                <Button size="lg" className="w-full bg-gradient-to-r from-accent to-accent/80 text-base font-bold text-white shadow-[var(--shadow-gold)] hover:opacity-95 sm:w-auto">
                  Request Coverage <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href={`tel:${OFFICE.replace(/-/g, "")}`}>
                <Button
                  size="lg"
                  className="w-full border-2 border-white bg-white text-base font-bold text-primary hover:bg-white/95 sm:w-auto"
                >
                  <Phone className="h-4 w-4" /> Call 24/7
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-white">
              <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-accent" /> Fully Vetted</div>
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent" /> 24/7 Support</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Compliance Ready</div>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)] ring-4 ring-accent/40">
              <img
                src={heroHome}
                alt="Bright, modern assisted living home interior"
                width={1536}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl bg-white p-4 shadow-[var(--shadow-elegant)] ring-2 ring-accent/40 sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70">
                  <Star className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-primary">3 Generations</div>
                  <div className="text-xs font-medium text-foreground/70">of caregivers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y-2 border-accent/30 bg-gradient-to-r from-secondary via-white to-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { k: "24/7", v: "Local Support" },
            { k: "100%", v: "Pre-Screened" },
            { k: "0", v: "Minimum Hours" },
            { k: "DFW", v: "Specialists" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <div className="bg-gradient-to-br from-primary to-accent bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">{s.k}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-foreground/80">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM/SOLUTION */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">The Promise</div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            You Don't Have to Do It Alone
          </h2>
          <p className="mt-5 text-lg text-foreground/80 sm:text-xl">
            Running a residential care home means handling everything — especially when staff call out.
            <span className="font-semibold text-foreground"> We step in so you don't have to.</span>
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: AlertCircle, title: "No More Scrambling", desc: "Reliable staff exactly when you need them — last-minute coverage without disruption.", color: "from-primary to-primary-deep" },
            { icon: Users, title: "Reduced Turnover", desc: "Better matches lead to better care, which leads to better stability for your residents.", color: "from-accent to-accent/70" },
            { icon: Shield, title: "Compliance First", desc: "Fully pre-screened professionals aligned with Texas residential care standards.", color: "from-primary-glow to-primary" },
          ].map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-secondary/60 transition-transform group-hover:scale-125" />
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg`}>
                <c.icon className="h-7 w-7" />
              </div>
              <h3 className="relative mt-6 text-xl font-extrabold text-primary">{c.title}</h3>
              <p className="relative mt-3 text-base leading-relaxed text-foreground/75">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-gradient-to-b from-secondary/60 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">Services</div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Flexible Staffing That Works for You
            </h2>
            <p className="mt-5 text-lg text-foreground/80 sm:text-xl">
              From last-minute PRN coverage to long-term leadership — one trusted partner.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: AlertCircle, tag: "PRN", title: "Emergency Coverage", desc: "Last-minute coverage without disruption.", img: care5 },
              { icon: UserCheck, tag: "Caregivers", title: "Professional Caregivers", desc: "Carefully matched to your residents.", img: care1 },
              { icon: Briefcase, tag: "Leadership", title: "Fractional Leadership", desc: "Short-term administrators & managers.", img: care3 },
              { icon: Brain, tag: "Specialty", title: "Memory Care Specialists", desc: "Dementia & Alzheimer's trained staff.", img: care4 },
            ].map((s) => (
              <div
                key={s.title}
                className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={s.img} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                    {s.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex h-11 w-11 -mt-10 mb-3 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg ring-4 ring-white">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-primary">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm font-medium text-foreground/75">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Survey Ready */}
          <div className="mt-14 overflow-hidden rounded-2xl border-2 border-accent/40 bg-card shadow-[var(--shadow-soft)]">
            <div className="grid items-center gap-0 lg:grid-cols-5">
              <div className="p-8 sm:p-10 lg:col-span-3">
                <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                  Stay Survey-Ready — Every Shift
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl lg:text-4xl">
                  Compliance handled. Care delivered.
                </h3>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "EMR / MAR / NAR verified",
                    "Background-checked professionals",
                    "Payroll, tax & insurance support",
                    "Residential care competency validated",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-base">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-56 lg:col-span-2 lg:h-full">
                <div className="absolute inset-0" style={{ background: "var(--gradient-vibrant)" }} />
                <div className="relative flex h-full flex-col items-center justify-center p-8 text-white">
                  <Shield className="h-14 w-14 opacity-95" />
                  <div className="mt-4 text-center">
                    <div className="text-4xl font-extrabold">100%</div>
                    <div className="text-base font-semibold opacity-95">Pre-screened & verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEGACY */}
      <section id="legacy" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)] ring-4 ring-accent/40">
              <img
                src={caregiver}
                alt="Caregiver smiling with elderly resident"
                width={1280}
                height={1280}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-2xl sm:block"
              style={{ background: "var(--gradient-gold)" }}
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">Our Legacy</div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Built on a Legacy of Care
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80 sm:text-xl">
              Clara's CareTeam is built on the legacy of <span className="font-extrabold text-primary">Mother Clara</span>{" "}
              — a standard of compassion, integrity, and excellence.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80 sm:text-xl">
              For three generations, our family has served the healthcare community — from
              administrators and nurses to caregivers and mental health professionals.
            </p>
            <div className="mt-6 rounded-xl border-l-4 border-accent bg-gradient-to-r from-secondary to-transparent p-5">
              <p className="text-lg font-bold text-primary">
                We don't just provide staff. We deliver continuity of care your residents can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div
          className="absolute -left-40 bottom-0 -z-10 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Need coverage today?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/95 sm:text-xl">
            Family-owned, DFW-based, and on-call 24/7. Let's talk about your next shift.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={`tel:${OFFICE.replace(/-/g, "")}`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-accent to-accent/80 text-base font-bold text-white shadow-[var(--shadow-gold)] hover:opacity-95 sm:w-auto">
                <Phone className="h-4 w-4" /> Office {OFFICE}
              </Button>
            </a>
            <a href={`tel:${MOBILE.replace(/-/g, "")}`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-base font-bold text-primary hover:bg-white/95 sm:w-auto">
                <Smartphone className="h-4 w-4" /> Mobile {MOBILE}
              </Button>
            </a>
            <a href={`mailto:${EMAIL}`} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-transparent text-base font-bold text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Mail className="h-4 w-4" /> Email Us
              </Button>
            </a>
          </div>
          <div className="mt-12 grid gap-6 text-white sm:grid-cols-4">
            {[
              { icon: Phone, label: "Office", value: OFFICE },
              { icon: Smartphone, label: "Mobile", value: MOBILE },
              { icon: Globe, label: "Website", value: "claracareteam.com" },
              { icon: MapPin, label: "Based in", value: "Arlington, TX" },
            ].map((i) => (
              <div key={i.label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 ring-2 ring-accent/60">
                  <i.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-accent">{i.label}</div>
                <div className="text-base font-bold">{i.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-accent/30 bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Clara's CareTeam" className="h-12 w-auto" />
            <div className="text-sm">
              <div className="font-extrabold text-primary">Clara's CareTeam, LLC</div>
              <div className="text-xs font-medium text-foreground/70">Arlington, TX · claracareteam.com</div>
            </div>
          </div>
          <div className="text-xs font-medium text-foreground/70">
            © {new Date().getFullYear()} Clara's CareTeam. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
