"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Smartphone, Mail, MapPin, ArrowRight } from "lucide-react";
import bgCheck from "@/assets/bg-check-pic.png";

const OFFICE  = "817-548-1986";
const MOBILE  = "469-853-5038";
const EMAIL   = "info@claracareteam.com";
const ADDRESS = "P.O. Box 200455, Arlington, TX 76006";

export default function CTASection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-label="Contact and final call to action"
    >
      {/* Background image with heavy overlay */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={bgCheck}
          alt=""
          fill
          loading="lazy"
          className="object-cover"
          sizes="100vw"
          aria-hidden="true"
        />
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)", opacity: 0.95 }}
      />

      {/* Gold glow */}
      <div
        className="absolute -left-32 bottom-0 -z-10 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "oklch(0.74 0.14 75)" }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
            Ready When You Are
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Need Coverage Today?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85 sm:text-xl">
            Family-owned, DFW-based, and on-call 24/7.
            Let's talk about your next shift — no commitment required.
          </p>

          {/* Primary CTA row */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`tel:${OFFICE.replace(/-/g, "")}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-black shadow-[var(--shadow-gold)] transition-all hover:scale-[1.03] hover:brightness-105 sm:w-auto"
              data-track="cta-office-call"
            >
              <Phone className="h-4 w-4" /> Office: {OFFICE}
            </a>
            <a
              href={`tel:${MOBILE.replace(/-/g, "")}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-primary sm:w-auto"
              data-track="cta-mobile-call"
            >
              <Smartphone className="h-4 w-4" /> Mobile: {MOBILE}
            </a>
          </div>

          {/* Email */}
          <div className="mt-4">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/8 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/15"
              data-track="cta-email"
            >
              <Mail className="h-4 w-4 text-accent" /> {EMAIL}
            </a>
          </div>

          {/* Contact info grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid gap-4 text-white sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Phone,      label: "Office",   value: OFFICE },
              { icon: Smartphone, label: "Mobile",   value: MOBILE },
              { icon: Mail,       label: "Email",    value: "info@claracareteam.com" },
              { icon: MapPin,     label: "Address",  value: "Arlington, TX 76006" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/25">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/55">
                  {label}
                </div>
                <div className="text-sm font-bold text-white text-center">{value}</div>
              </div>
            ))}
          </motion.div>

          {/* Emergency CTA link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <a
              href="#emergency"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent underline-offset-4 hover:underline"
              data-track="cta-get-care-form"
            >
              Or fill out the Get Care Now form above <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-primary-deep/60 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Clara's CareTeam, LLC · {ADDRESS}</span>
          <span>DFW Residential Care Staffing · 24/7 On-Call</span>
        </div>
      </div>
    </section>
  );
}
