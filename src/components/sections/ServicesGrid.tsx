"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, UserCheck, Briefcase, Brain, Shield, CheckCircle2 } from "lucide-react";
import care1 from "@/assets/care-1.jpg";
import care3 from "@/assets/care-3.jpg";
import care4 from "@/assets/care-4.jpg";
import care5 from "@/assets/care-5.jpg";

const services = [
  {
    icon: AlertCircle,
    tag: "PRN / Urgent",
    title: "Emergency Coverage",
    desc: "Last-minute staff coverage without disrupting resident care. We respond fast, day or night — including weekends and holidays.",
    img: care5,
  },
  {
    icon: UserCheck,
    tag: "Caregivers",
    title: "Professional Caregivers",
    desc: "CNA, HHA, PCA and companion caregivers — carefully matched to your care home's culture, residents, and documentation requirements.",
    img: care1,
  },
  {
    icon: Briefcase,
    tag: "Leadership",
    title: "Fractional Management",
    desc: "Short-term administrators, Directors of Nursing (DONs), and operational managers to keep your facility survey-ready during transitions.",
    img: care3,
  },
  {
    icon: Brain,
    tag: "Specialty",
    title: "Memory Care Specialists",
    desc: "Dementia & Alzheimer's trained staff experienced in behavioral redirection, validation therapy, and dignity-centered care.",
    img: care4,
  },
];

const complianceItems = [
  "EMR / MAR / NAR verified",
  "TWC-compliant payroll",
  "Background-checked",
  "Competency validated",
  "Workers' comp covered",
  "No minimum hours",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function ServicesGrid() {
  return (
    <section
      id="services"
      className="bg-gradient-to-b from-white via-secondary/30 to-white py-16 sm:py-24"
      aria-label="Services"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Our Services
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Flexible Staffing That Works for You
          </h2>
          <p className="mt-5 text-lg text-foreground/75 sm:text-xl">
            From last-minute PRN coverage to fractional leadership — one trusted local partner.
          </p>
        </motion.div>

        {/* Service cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map(({ icon: Icon, tag, title, desc, img }) => (
            <motion.div
              key={title}
              variants={card}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-elegant)]"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={img}
                  alt={title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/65 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black shadow">
                  {tag}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 pt-3">
                <div className="-mt-8 mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg ring-4 ring-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Compliance shield */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 overflow-hidden rounded-3xl border border-accent/30 bg-white shadow-[var(--shadow-soft)]"
        >
          <div className="grid lg:grid-cols-5">
            <div className="p-8 sm:p-10 lg:col-span-3">
              <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
                Compliance Shield™
              </span>
              <h3 className="mt-4 font-serif text-2xl font-bold text-primary sm:text-3xl">
                Stay Survey-Ready Every Shift
              </h3>
              <p className="mt-3 text-base text-foreground/70">
                Every placement arrives documentation-complete and competency-verified.
              </p>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {complianceItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent" />
                    <span className="font-semibold text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="flex min-h-[180px] flex-col items-center justify-center p-8 text-white lg:col-span-2"
              style={{ background: "var(--gradient-vibrant)" }}
            >
              <Shield className="h-14 w-14 opacity-90" />
              <div className="mt-4 text-center">
                <div className="text-5xl font-extrabold">100%</div>
                <div className="mt-1 text-base font-bold opacity-90">Pre-screened & verified</div>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest opacity-65">
                  Every placement, every time
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
