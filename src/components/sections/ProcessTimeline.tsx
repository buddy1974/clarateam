"use client";

import { motion } from "framer-motion";
import { PhoneCall, ClipboardList, UserCheck, Heart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PhoneCall,
    title: "You Contact Us",
    desc: "Call, text, or fill out our form — 24/7. Tell us when you need coverage and what type of care.",
    color: "from-primary to-primary-deep",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "We Assess Your Needs",
    desc: "We listen carefully to understand your care environment, resident needs, and facility requirements.",
    color: "from-accent to-amber-500",
  },
  {
    number: "03",
    icon: UserCheck,
    title: "We Match a Caregiver",
    desc: "We select from our vetted pool — matched on skills, experience, and personality fit for your home.",
    color: "from-primary-glow to-primary",
  },
  {
    number: "04",
    icon: Heart,
    title: "Care Begins",
    desc: "Your matched professional arrives prepared, documented, and ready. Peace of mind, every shift.",
    color: "from-accent to-primary",
  },
];

export default function ProcessTimeline() {
  return (
    <section
      id="process"
      className="bg-gradient-to-b from-secondary/50 to-white py-16 sm:py-24"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Care in 4 Simple Steps
          </h2>
          <p className="mt-5 text-lg text-foreground/75">
            From your first call to care beginning — we move fast so your residents never miss a beat.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-4 md:gap-6 lg:gap-8">
          {steps.map(({ number, icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.12 + 0.4 }}
                  className="absolute left-[calc(50%+32px)] top-10 hidden h-[2px] w-[calc(100%-64px)] origin-left bg-gradient-to-r from-accent/50 to-accent/20 md:block"
                />
              )}

              {/* Step number badge */}
              <div className="relative mb-5">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-[var(--shadow-soft)]`}
                >
                  <Icon className="h-9 w-9" />
                </motion.div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-white">
                  {number}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-primary">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <a
            href="#emergency"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-deep hover:shadow-[var(--shadow-elegant)]"
            data-track="process-cta"
          >
            Start the Process Now →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
