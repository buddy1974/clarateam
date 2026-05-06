"use client";

import { motion } from "framer-motion";
import { Phone, Smartphone, Mail, MapPin, ArrowRight } from "lucide-react";

const OFFICE  = "817-548-1986";
const MOBILE  = "469-853-5038";
const EMAIL   = "info@claracareteam.com";
const ADDRESS = "P.O. Box 200455, Arlington, TX 76006";

const CONTACTS = [
  { icon: Phone,      label: "Office",   value: OFFICE,                    href: `tel:${OFFICE.replace(/-/g, "")}` },
  { icon: Smartphone, label: "Mobile",   value: MOBILE,                    href: `tel:${MOBILE.replace(/-/g, "")}` },
  { icon: Mail,       label: "Email",    value: EMAIL,                     href: `mailto:${EMAIL}` },
  { icon: MapPin,     label: "Location", value: "Arlington, TX 76006",     href: null },
];

export default function CTASection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden pb-24 pt-20 sm:pt-28"
      aria-label="Contact and final call to action"
    >
      {/* Background — same dark gradient as hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.98) 0%, oklch(0.22 0.12 332 / 0.98) 50%, oklch(0.16 0.10 332 / 0.98) 100%)",
        }}
      />

      {/* Gold ambient glow — bottom left */}
      <div
        className="absolute -left-32 bottom-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />
      {/* Gold ambient glow — top right */}
      <div
        className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="text-center"
        >
          {/* Badge */}
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent backdrop-blur-sm">
            Ready When You Are
          </span>

          {/* Headline */}
          <h2 className="mt-5 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Need Care Today?
          </h2>

          {/* Subtext */}
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/80">
            Family-owned. Dallas-based. Available 24/7.{" "}
            <span className="font-semibold text-white">
              We'll match you with the right caregiver — fast.
            </span>
          </p>

          {/* Micro trust line */}
          <p className="mt-5 text-sm font-semibold text-white/50">
            ✔ No obligation &nbsp;•&nbsp; ✔ Fast response &nbsp;•&nbsp; ✔ Fully vetted caregivers
          </p>

          {/* Primary + Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-8"
          >
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* PRIMARY — Call */}
              <a
                href={`tel:${OFFICE.replace(/-/g, "")}`}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.04] hover:brightness-105 active:scale-100 sm:w-auto"
                data-track="cta-call-primary"
              >
                <Phone className="h-5 w-5" />
                Call Now • {OFFICE}
              </a>

              {/* SECONDARY — Get Care Today */}
              <a
                href="#emergency"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary active:scale-100 sm:w-auto"
                data-track="cta-get-care"
              >
                Get Care Today <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* AI tertiary link */}
            <div className="mt-5">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                className="text-sm text-white/55 transition-colors hover:text-white"
              >
                Or ask our AI →
              </button>
            </div>
          </motion.div>

          {/* Contact cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {CONTACTS.map(({ icon: Icon, label, value, href }) => {
              const Wrapper = href ? "a" : "div";
              return (
                <Wrapper
                  key={label}
                  {...(href ? { href, "data-track": `cta-contact-${label.toLowerCase()}` } : {})}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm transition-all hover:bg-white/15"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/45">
                    {label}
                  </div>
                  <div className="text-center text-xs font-bold leading-snug text-white">
                    {value}
                  </div>
       