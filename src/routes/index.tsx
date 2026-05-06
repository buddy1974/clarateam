import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Phone, Mail, MapPin, Shield, Clock, Users, Heart, CheckCircle2, Sparkles,
  Brain, UserCheck, Briefcase, AlertCircle, ArrowRight, Star, Menu, X,
  Smartphone, Globe, Award, FileCheck, Fingerprint, GraduationCap,
  BadgeCheck, FlaskConical, Search, ClipboardCheck, ChevronDown,
} from "lucide-react";
import logo from "@/assets/logo.png";
import heroHome from "@/assets/hero-home.jpg";
import bgCheck from "@/assets/bg-check-pic.png";
import care1 from "@/assets/care-1.jpg";
import care3 from "@/assets/care-3.jpg";
import care4 from "@/assets/care-4.jpg";
import care5 from "@/assets/care-5.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Clara's CareTeam | Residential Care Staffing DFW – Arlington, Fort Worth, Dallas" },
      {
        name: "description",
        content:
          "Clara's CareTeam provides compliance-first residential care staffing across DFW — Arlington, Fort Worth, Dallas, Grand Prairie & 35+ neighborhoods. PRN coverage, caregivers, memory care & fractional leadership. Call 817-548-1986.",
      },
      { name: "keywords", content: "residential care staffing DFW, caregiver staffing Arlington TX, PRN coverage Fort Worth, residential care home staff Dallas, memory care staffing Grand Prairie, assisted living staffing Texas, home care staffing DFW, certified caregiver placement Arlington, licensed caregiver agency Fort Worth" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Clara's CareTeam | Residential Care Staffing DFW" },
      {
        property: "og:description",
        content: "Peace of mind, every shift. Family-owned, fully vetted caregivers across DFW — Arlington, Fort Worth, Dallas & beyond.",
      },
      { property: "og:url", content: "https://claracareteam.com" },
      { property: "og:image", content: "https://claracareteam.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Clara's CareTeam | Residential Care Staffing DFW" },
      { name: "twitter:description", content: "Family-owned care staffing. Fully vetted professionals. Coverage across Arlington, Fort Worth, Dallas and 35+ DFW neighborhoods." },
    ],
    links: [
      { rel: "canonical", href: "https://claracareteam.com" },
    ],
  }),
});

const OFFICE = "817-548-1986";
const MOBILE = "469-853-5038";
const EMAIL = "info@claracareteam.com";
const ADDRESS = "P.O. Box 200455, Arlington, TX 76006";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://claracareteam.com",
  name: "Clara's CareTeam, LLC",
  description: "Family-owned residential care staffing agency serving DFW. PRN coverage, certified caregivers, memory care specialists & fractional leadership.",
  url: "https://claracareteam.com",
  telephone: `+1${OFFICE.replace(/-/g, "")}`,
  email: EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "P.O. Box 200455",
    addressLocality: "Arlington",
    addressRegion: "TX",
    postalCode: "76006",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 32.7357, longitude: -97.1081 },
  areaServed: [
    "Arlington TX", "Fort Worth TX", "Dallas TX", "Grand Prairie TX",
    "Mansfield TX", "Burleson TX", "Cedar Hill TX", "Irving TX",
    "Duncanville TX", "DeSoto TX", "Garland TX", "Mesquite TX",
    "Euless TX", "Bedford TX", "Hurst TX", "Colleyville TX",
    "North Richland Hills TX", "Haltom City TX", "Keller TX",
    "Southlake TX", "Grapevine TX", "Midlothian TX", "Waxahachie TX",
    "Crowley TX", "Kennedale TX", "Pantego TX", "Forest Hill TX",
    "Everman TX", "Saginaw TX", "White Settlement TX",
  ],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: ["https://www.claracareteam.com"],
};

// Intersection observer hook for scroll-in animations
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.12, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function AnimateIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const NAV_LINKS = [
  ["Services", "#services"],
  ["Due Diligence", "#due-diligence"],
  ["Why Us", "#why"],
  ["Our Story", "#legacy"],
  ["Service Areas", "#areas"],
  ["Contact", "#contact"],
] as const;

const DFW_AREAS = [
  "Arlington", "Fort Worth", "Dallas", "Grand Prairie", "Mansfield",
  "Burleson", "Cedar Hill", "Irving", "Duncanville", "DeSoto",
  "Garland", "Mesquite", "Euless", "Bedford", "Hurst", "Colleyville",
  "North Richland Hills", "Haltom City", "Keller", "Southlake",
  "Grapevine", "Crowley", "Kennedale", "Pantego", "Forest Hill",
  "Everman", "Saginaw", "White Settlement", "Richland Hills",
  "River Oaks", "Watauga", "Azle", "Midlothian", "Waxahachie",
  "Ennis", "Cleburne", "Weatherford", "Carrollton", "Farmers Branch",
];

const TESTIMONIALS = [
  {
    name: "Maria T.",
    role: "Residential Care Home Owner, Arlington",
    quote: "Clara's CareTeam saved me during a last-minute staffing crisis. They had a qualified caregiver at my door within hours. I don't know what I would have done without them.",
    stars: 5,
  },
  {
    name: "James R.",
    role: "Administrator, Fort Worth",
    quote: "Every staff member they've placed has been professional, compassionate, and survey-ready. The background check process gives me total peace of mind.",
    stars: 5,
  },
  {
    name: "Sandra L.",
    role: "Care Home Operator, Grand Prairie",
    quote: "Three years in and they've never let me down. Family-owned, local, and they genuinely care about the residents — not just filling a shift.",
    stars: 5,
  },
];

const DUE_DILIGENCE_ITEMS = [
  { icon: Fingerprint, title: "Criminal Background Check", desc: "County, state & federal multi-jurisdiction search covering 7+ years of records." },
  { icon: Search, title: "Sex Offender Registry", desc: "National Sex Offender Public Website (NSOPW) verification on every candidate." },
  { icon: Shield, title: "OIG / LEIE Exclusion Check", desc: "Office of Inspector General exclusion database checked to protect Medicare/Medicaid compliance." },
  { icon: ClipboardCheck, title: "Reference Verification", desc: "Direct contact with prior supervisors and professional references — not just listed names." },
  { icon: Briefcase, title: "Employment History", desc: "Verified employment timeline to identify gaps and confirm stated credentials." },
  { icon: FlaskConical, title: "Drug Screening", desc: "10-panel drug test administered before placement in any home." },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* ── NAV ── */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "var(--color-background)" : "var(--color-background)",
          borderBottom: scrolled ? "2px solid oklch(0.74 0.14 75 / 0.35)" : "2px solid oklch(0.74 0.14 75 / 0.20)",
          boxShadow: scrolled ? "0 4px 32px oklch(0.30 0.14 332 / 0.18)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5 group">
            <img src={logo} alt="Clara's CareTeam" className="h-12 w-auto sm:h-14 transition-transform group-hover:scale-105" />
          </a>
          <nav className="hidden items-center gap-6 xl:flex">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-bold text-foreground/85 transition-all hover:text-primary hover:underline decoration-accent underline-offset-4"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            <a href={`tel:${OFFICE.replace(/-/g, "")}`}>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary-deep text-sm font-bold shadow-[var(--shadow-soft)] hover:opacity-90 hover:shadow-[var(--shadow-elegant)] transition-all">
                <Phone className="h-4 w-4" /> {OFFICE}
              </Button>
            </a>
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-foreground xl:hidden hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t-2 border-accent/20 bg-background xl:hidden shadow-lg">
            <div className="space-y-0.5 px-4 py-3">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-foreground hover:bg-secondary hover:text-primary transition-colors"
                >
                  <ChevronDown className="h-3 w-3 rotate-[-90deg] text-accent" />
                  {label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border mt-2">
                <a href={`tel:${OFFICE.replace(/-/g, "")}`}>
                  <Button className="w-full gap-1.5 bg-gradient-to-r from-primary to-primary-deep text-xs font-bold">
                    <Phone className="h-3.5 w-3.5" /> {OFFICE}
                  </Button>
                </a>
                <a href={`tel:${MOBILE.replace(/-/g, "")}`}>
                  <Button variant="outline" className="w-full gap-1.5 border-2 border-accent text-accent text-xs font-bold hover:bg-accent/10">
                    <Smartphone className="h-3.5 w-3.5" /> {MOBILE}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section id="top" className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* full-bleed image */}
        <div className="absolute inset-0 -z-20">
          <img src={heroHome} alt="Clara's CareTeam residential care home" className="h-full w-full object-cover" />
        </div>
        {/* dark overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-deep/75" />
        {/* gold glow */}
        <div className="absolute -right-24 top-20 -z-10 h-[500px] w-[500px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "oklch(0.74 0.14 75)" }} />
        {/* dot grid */}
        <div className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent/50 bg-accent/15 px-4 py-2 text-xs font-extrabold tracking-widest text-white uppercase backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              DFW's Compliance-First Care Staffing
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.07] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Reliable Staff for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-accent via-amber-300 to-white bg-clip-text text-transparent">
                  Residential Care Homes
                </span>
                <span className="absolute -inset-1 -z-0 rounded-lg bg-accent/10 blur-sm" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/95 sm:text-xl">
              Peace of mind, every shift — without the stress. Fully vetted, compliance-ready
              professionals matched to your residents in <strong className="text-accent">minutes, not days.</strong>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#contact">
                <Button size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-accent to-amber-400 text-base font-extrabold text-white shadow-[0_8px_32px_oklch(0.74_0.14_75/0.55)] hover:opacity-95 hover:scale-[1.02] transition-all sm:w-auto">
                  Request Coverage <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href={`tel:${OFFICE.replace(/-/g, "")}`}>
                <Button size="lg"
                  className="w-full gap-2 border-2 border-white bg-white/10 backdrop-blur-sm text-base font-bold text-white hover:bg-white hover:text-primary transition-all sm:w-auto">
                  <Phone className="h-4 w-4" /> Call 24/7
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm font-bold text-white">
              <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-accent" /> 6-Point Vetting</div>
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent" /> 24/7 Support</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> TWC & Survey Ready</div>
              <div className="flex items-center gap-1.5"><Award className="h-4 w-4 text-accent" /> Family-Owned</div>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <a href="#trust-bar" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* ── TRUST BAR ── */}
      <section id="trust-bar" className="relative border-y-2 border-accent/30 bg-primary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 divide-x divide-white/10 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { k: "24/7", v: "On-Call Support", icon: Clock },
            { k: "100%", v: "Pre-Screened Staff", icon: BadgeCheck },
            { k: "6-Point", v: "Due Diligence", icon: Shield },
            { k: "35+", v: "DFW Neighborhoods", icon: MapPin },
          ].map(({ k, v, icon: Icon }) => (
            <div key={v} className="flex flex-col items-center gap-1 py-2 px-4 text-center">
              <Icon className="h-5 w-5 text-accent mb-1" />
              <div className="text-3xl font-extrabold text-accent sm:text-4xl">{k}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/80">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <AnimateIn className="mx-auto max-w-2xl text-center">
          <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">Care-First Philosophy</div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            You Don't Have to Do It Alone
          </h2>
          <p className="mt-5 text-lg text-foreground/80 sm:text-xl">
            Running a residential care home means handling everything — especially when staff call out.
            <span className="font-bold text-primary"> We step in so your residents never miss a beat.</span>
          </p>
        </AnimateIn>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: AlertCircle,
              title: "No More Scrambling",
              desc: "Reliable staff exactly when you need them — last-minute PRN coverage without disrupting resident care.",
              gradient: "from-primary to-primary-deep",
              delay: 0,
            },
            {
              icon: Users,
              title: "Reduced Turnover",
              desc: "Better staff matches create better care environments, which drives resident satisfaction and family trust.",
              gradient: "from-accent to-amber-400",
              delay: 100,
            },
            {
              icon: Shield,
              title: "Compliance Shield™",
              desc: "Every placement is EMR/MAR/NAR-verified and aligned with Texas TWC and residential care standards.",
              gradient: "from-primary-glow to-primary",
              delay: 200,
            },
          ].map((c) => (
            <AnimateIn key={c.title} delay={c.delay}>
              <div className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2 hover:border-accent/60 hover:shadow-[var(--shadow-elegant)] h-full">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-secondary/50 transition-transform duration-500 group-hover:scale-150" />
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow-lg`}>
                  <c.icon className="h-7 w-7" />
                </div>
                <h3 className="relative mt-5 text-xl font-extrabold text-primary">{c.title}</h3>
                <p className="relative mt-3 text-base leading-relaxed text-foreground/75">{c.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="bg-gradient-to-b from-secondary/70 via-white to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateIn className="mx-auto max-w-2xl text-center">
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">Our Services</div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Flexible Staffing That Works for You
            </h2>
            <p className="mt-5 text-lg text-foreground/80 sm:text-xl">
              From last-minute PRN coverage to fractional leadership — one trusted local partner.
            </p>
          </AnimateIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: AlertCircle, tag: "PRN / Urgent", title: "Emergency Coverage", desc: "Last-minute staff coverage without disrupting resident care. We respond fast, day or night.", img: care5, delay: 0 },
              { icon: UserCheck, tag: "Caregivers", title: "Professional Caregivers", desc: "CNA, HHA, PCA and companion caregivers — carefully matched to your home's culture and resident needs.", img: care1, delay: 100 },
              { icon: Briefcase, tag: "Leadership", title: "Fractional Management", desc: "Short-term administrators, DONs, and operational managers to keep your facility survey-ready.", img: care3, delay: 200 },
              { icon: Brain, tag: "Specialty", title: "Memory Care Specialists", desc: "Dementia & Alzheimer's trained staff experienced in behavioral redirection and dignity-centered care.", img: care4, delay: 300 },
            ].map((s) => (
              <AnimateIn key={s.title} delay={s.delay}>
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2 hover:border-accent/50 hover:shadow-[var(--shadow-elegant)]">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={s.img}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                      {s.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 pt-3">
                    <div className="flex h-12 w-12 -mt-9 mb-3 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg ring-4 ring-white">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-extrabold text-primary">{s.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed font-medium text-foreground/75">{s.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          {/* Compliance Shield Banner */}
          <AnimateIn delay={100} className="mt-14">
            <div className="overflow-hidden rounded-2xl border-2 border-accent/40 bg-card shadow-[var(--shadow-soft)]">
              <div className="grid items-stretch gap-0 lg:grid-cols-5">
                <div className="p-8 sm:p-10 lg:col-span-3">
                  <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
                    Compliance Shield™
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl">
                    Stay Survey-Ready — Every Single Shift
                  </h3>
                  <p className="mt-3 text-base text-foreground/75">Every placement arrives documentation-complete and competency-verified.</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      "EMR / MAR / NAR verified",
                      "TWC-compliant payroll support",
                      "Background-checked professionals",
                      "Residential care competency validated",
                      "Workers' comp & liability covered",
                      "No minimum hour commitment",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-amber-400">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative lg:col-span-2" style={{ background: "var(--gradient-vibrant)" }}>
                  <div className="flex h-full flex-col items-center justify-center p-8 text-white min-h-[200px]">
                    <Shield className="h-16 w-16 opacity-90 drop-shadow-lg" />
                    <div className="mt-4 text-center">
                      <div className="text-5xl font-extrabold">100%</div>
                      <div className="mt-1 text-base font-bold opacity-90">Pre-screened & verified</div>
                      <div className="mt-3 text-xs font-bold uppercase tracking-widest opacity-70">Every placement, every time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── DUE DILIGENCE ── */}
      <section id="due-diligence" className="relative overflow-hidden py-16 sm:py-24">
        {/* background image with dark overlay */}
        <div className="absolute inset-0 -z-20">
          <img src={bgCheck} alt="Background check process" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/92 via-primary-deep/88 to-primary/90" />
        {/* decorative glow */}
        <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]"
          style={{ background: "oklch(0.74 0.14 75)" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateIn className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent/50 bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent backdrop-blur-sm">
              <BadgeCheck className="h-3.5 w-3.5" /> 6-Point Due Diligence Process
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              We Vet. You Trust. Residents Thrive.
            </h2>
            <p className="mt-5 text-lg text-white/90 sm:text-xl">
              Before any caregiver sets foot in your home, they pass our rigorous 6-point screening — because your residents deserve nothing less.
            </p>
          </AnimateIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DUE_DILIGENCE_ITEMS.map((item, i) => (
              <AnimateIn key={item.title} delay={i * 80}>
                <div className="group flex items-start gap-4 rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-white/12 hover:-translate-y-1">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-amber-400 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-accent">Step {i + 1}</span>
                    </div>
                    <h3 className="font-extrabold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/80">{item.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn delay={200} className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border-2 border-accent/40 bg-white/8 px-8 py-5 backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-accent flex-shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-white">Every staff member is competency-evaluated</div>
                <div className="text-sm text-white/80 mt-0.5">Including EMR, MAR, NAR documentation and hands-on care skills</div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── CAREGIVER GALLERY ── */}
      <section className="bg-gradient-to-b from-white to-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateIn className="mx-auto max-w-xl text-center mb-10">
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">Our People</div>
            <h2 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl">
              Professionals Who Genuinely Care
            </h2>
            <p className="mt-3 text-base text-foreground/75">Each caregiver we place is vetted, trained, and committed to dignified, resident-first care.</p>
          </AnimateIn>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { img: care1, caption: "Compassionate Personal Care", alt: "Clara's CareTeam caregiver providing personal care" },
              { img: care3, caption: "Daily Living Assistance", alt: "Clara's CareTeam caregiver assisting resident" },
              { img: care4, caption: "Memory Care Support", alt: "Clara's CareTeam memory care specialist" },
              { img: care5, caption: "PRN Emergency Coverage", alt: "Clara's CareTeam PRN caregiver" },
            ].map((photo, i) => (
              <AnimateIn key={photo.caption} delay={i * 80}>
                <div className="group relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-2 ring-accent/20 hover:ring-accent/60 transition-all duration-300">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={photo.img}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-accent flex-shrink-0" fill="currentColor" />
                      <span className="text-xs font-bold text-white">{photo.caption}</span>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGACY / OUR STORY ── */}
      <section id="legacy" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimateIn className="relative order-2 lg:order-1" delay={0}>
            <div className="group overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)] ring-4 ring-accent/30 hover:ring-accent/60 transition-all duration-300">
              <img
                src={care1}
                alt="Clara's CareTeam — three generations of caregivers"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 hidden rounded-2xl p-6 shadow-[var(--shadow-elegant)] ring-2 ring-accent/40 lg:block"
              style={{ background: "var(--gradient-vibrant)" }}>
              <div className="text-center text-white">
                <div className="text-3xl font-extrabold">3</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-90">Generations</div>
              </div>
            </div>
          </AnimateIn>
          <AnimateIn className="order-1 lg:order-2" delay={150}>
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">Our Story</div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Built on a Legacy of Care
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80 sm:text-xl">
              Clara's CareTeam is built on the legacy of <span className="font-extrabold text-primary">Mother Clara</span> —
              a standard of compassion, integrity, and excellence that has guided our family for decades.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80 sm:text-xl">
              For three generations, our family has served the healthcare community — from administrators
              and nurses to direct caregivers and mental health professionals.
            </p>
            <div className="mt-6 rounded-xl border-l-4 border-accent bg-gradient-to-r from-secondary to-transparent p-5">
              <p className="text-lg font-extrabold text-primary">
                We don't just provide staff. We deliver continuity of care your residents can trust.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Heart, label: "Family-Owned", sub: "Since day one" },
                { icon: Award, label: "Care-First", sub: "Our core value" },
                { icon: Shield, label: "Compliant", sub: "TWC & survey-ready" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl border-2 border-border bg-card p-4 text-center shadow-[var(--shadow-card)]">
                  <Icon className="h-6 w-6 text-primary mx-auto" />
                  <div className="mt-2 text-sm font-extrabold text-primary">{label}</div>
                  <div className="text-xs text-foreground/60">{sub}</div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gradient-to-b from-secondary/60 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateIn className="mx-auto max-w-xl text-center mb-12">
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">Testimonials</div>
            <h2 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl lg:text-4xl">
              What Care Home Operators Say
            </h2>
          </AnimateIn>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <AnimateIn key={t.name} delay={i * 100}>
                <div className="flex h-full flex-col rounded-2xl border-2 border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-soft)]">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-accent" fill="currentColor" />
                    ))}
                  </div>
                  <p className="flex-1 text-base leading-relaxed text-foreground/80 italic">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-sm font-extrabold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-primary">{t.name}</div>
                      <div className="text-xs text-foreground/60">{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE AREAS ── */}
      <section id="areas" className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateIn className="mx-auto max-w-2xl text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent/50 bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
              <MapPin className="h-3.5 w-3.5" /> Service Areas — DFW Metroplex
            </div>
            <h2 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Covering 35+ Neighborhoods Across DFW
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Based in <strong className="text-accent">Arlington, TX</strong> — serving residential care homes throughout
              the Dallas–Fort Worth metroplex, Tarrant County, Dallas County, and surrounding areas.
            </p>
          </AnimateIn>

          <AnimateIn delay={100}>
            <div className="rounded-2xl border border-white/15 bg-white/8 p-8 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2 justify-center">
                {DFW_AREAS.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-accent/25 hover:border-accent/70 transition-colors cursor-default"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3 text-center">
                {[
                  { label: "Tarrant County", cities: "Fort Worth, Arlington, Mansfield, Burleson, Crowley, Kennedale, Grand Prairie (west)", icon: MapPin },
                  { label: "Dallas County", cities: "Dallas, Irving, Cedar Hill, Duncanville, DeSoto, Garland, Mesquite, Grand Prairie (east)", icon: MapPin },
                  { label: "Mid-Cities & Beyond", cities: "Euless, Bedford, Hurst, Colleyville, North Richland Hills, Grapevine, Southlake, Keller", icon: MapPin },
                ].map((region) => (
                  <div key={region.label} className="rounded-xl border border-white/15 bg-white/8 p-5 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <region.icon className="h-4 w-4 text-accent" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-accent">{region.label}</span>
                    </div>
                    <p className="text-xs text-white/75 leading-relaxed">{region.cities}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── CTA / CONTACT ── */}
      <section id="contact" className="relative overflow-hidden bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimateIn className="text-center">
            <div className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary mb-4">Get in Touch</div>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Need Coverage Today?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-foreground/80 sm:text-xl">
              Family-owned, DFW-based, and on-call 24/7. Let's talk about your next shift — no commitment required.
            </p>
          </AnimateIn>

          <AnimateIn delay={100} className="mt-10">
            <div className="overflow-hidden rounded-2xl border-2 border-accent/30 bg-card shadow-[var(--shadow-elegant)]">
              <div className="bg-gradient-to-r from-primary to-primary-deep p-6 sm:p-8 text-center">
                <h3 className="text-2xl font-extrabold text-white">Ready to Get Started?</h3>
                <p className="mt-2 text-white/80">Call, text, or email — we respond fast</p>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                  <a href={`tel:${OFFICE.replace(/-/g, "")}`}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-primary/20 bg-secondary/40 p-5 text-center hover:border-primary/60 hover:bg-secondary/80 transition-all hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-white shadow-md">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-widest text-primary/70">Office</div>
                      <div className="text-lg font-extrabold text-primary">{OFFICE}</div>
                    </div>
                  </a>
                  <a href={`tel:${MOBILE.replace(/-/g, "")}`}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-accent/30 bg-accent/8 p-5 text-center hover:border-accent/60 hover:bg-accent/15 transition-all hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-amber-400 text-white shadow-md">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-widest text-accent">Mobile</div>
                      <div className="text-lg font-extrabold text-primary">{MOBILE}</div>
                    </div>
                  </a>
                  <a href={`mailto:${EMAIL}`}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-5 text-center hover:border-primary/40 hover:bg-secondary/40 transition-all hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-white shadow-md">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-widest text-foreground/60">Email</div>
                      <div className="text-sm font-extrabold text-primary break-all">{EMAIL}</div>
                    </div>
                  </a>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <a href="#contact">
                    <Button size="lg"
                      className="w-full gap-2 bg-gradient-to-r from-primary to-primary-deep text-base font-extrabold shadow-[var(--shadow-soft)] hover:opacity-90 hover:scale-[1.02] transition-all sm:w-auto">
                      Request Coverage <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <a href={`tel:${OFFICE.replace(/-/g, "")}`}>
                    <Button size="lg" variant="outline"
                      className="w-full gap-2 border-2 border-accent text-accent text-base font-extrabold hover:bg-accent/10 hover:scale-[1.02] transition-all sm:w-auto">
                      <Phone className="h-4 w-4" /> Call Now — 24/7
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-2 border-accent/20 bg-primary py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <img src={logo} alt="Clara's CareTeam" className="h-12 w-auto brightness-0 invert" />
              <p className="mt-3 text-sm text-white/75 leading-relaxed">
                Family-owned residential care staffing agency serving the DFW metroplex with compassion, compliance, and care.
              </p>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-accent mb-3">Quick Links</div>
              <div className="grid grid-cols-2 gap-1.5">
                {NAV_LINKS.map(([label, href]) => (
                  <a key={href} href={href} className="text-sm text-white/70 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-accent mb-3">Contact</div>
              <div className="space-y-2 text-sm text-white/75">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent flex-shrink-0" /><span>{OFFICE}</span></div>
                <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-accent flex-shrink-0" /><span>{MOBILE}</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent flex-shrink-0" /><span>{EMAIL}</span></div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" /><span>{ADDRESS}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-xs font-medium text-white/50">
              © {new Date().getFullYear()} Clara's CareTeam, LLC. All rights reserved.
            </div>
            <div className="text-xs text-white/50">Arlington, TX · {ADDRESS}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
