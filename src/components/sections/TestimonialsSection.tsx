"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import care1 from "@/assets/care-1.jpg";
import care3 from "@/assets/care-3.jpg";
import care4 from "@/assets/care-4.jpg";

const testimonials = [
  {
    name: "Maria T.",
    role: "Residential Care Home Owner",
    location: "Arlington, TX",
    quote:
      "Clara's CareTeam saved me during a last-minute staffing crisis. They had a qualified caregiver at my door within hours. I honestly don't know what I would have done without them.",
    situation: "Last-minute callout — 3 residents needed coverage",
    outcome: "Caregiver placed within 4 hours",
    stars: 5,
    img: care1,
  },
  {
    name: "James R.",
    role: "Care Home Administrator",
    location: "Fort Worth, TX",
    quote:
      "Every staff member they've placed has been professional, compassionate, and survey-ready. Their 6-point background check process gives me total peace of mind.",
    situation: "Ongoing PRN pool for weekend coverage",
    outcome: "Zero survey deficiencies in 2 years",
    stars: 5,
    img: care3,
  },
  {
    name: "Sandra L.",
    role: "Licensed Care Operator",
    location: "Grand Prairie, TX",
    quote:
      "Three years in and they've never let me down. Family-owned, local, and they genuinely care about the residents — not just filling a shift.",
    situation: "Memory care unit needing specialist coverage",
    outcome: "Dedicated memory care specialist placed long-term",
    stars: 5,
    img: care4,
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="why"
      className="bg-gradient-to-b from-secondary/25 to-white py-16 sm:py-24"
      aria-label="Why Clara's CareTeam — testimonials"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl text-center"
        >
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Testimonials
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            What Care Home Operators Say
          </h2>
          <p className="mt-4 text-base text-foreground/70">
            Real stories from real facilities across the DFW Metroplex.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, location, quote, situation, outcome, stars, img }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-border bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
            >
              {/* Quote icon */}
              <Quote className="h-7 w-7 text-accent/40 flex-shrink-0" />

              {/* Stars */}
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-accent" fill="currentColor" />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-4 flex-1 text-base leading-relaxed text-foreground/80 italic">
                "{quote}"
              </p>

              {/* Situation / outcome pills */}
              <div className="mt-4 space-y-1.5">
                <div className="rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-foreground/70">
                  <span className="font-bold text-primary">Situation: </span>{situation}
                </div>
                <div className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs text-foreground/70">
                  <span className="font-bold text-accent">Outcome: </span>{outcome}
                </div>
              </div>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-accent/30">
                  <Image
                    src={img}
                    alt={name}
                    fill
                    loading="lazy"
                    quality={75}
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-primary">{name}</div>
                  <div className="text-xs text-foreground/60">{role} · {location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
