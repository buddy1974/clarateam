"use client";

import { motion } from "framer-motion";
import { Clock, BadgeCheck, Shield, MapPin } from "lucide-react";

const stats = [
  { icon: Clock,      value: "24/7",    label: "On-Call Support" },
  { icon: BadgeCheck, value: "100%",    label: "Pre-Screened Staff" },
  { icon: Shield,     value: "6-Point", label: "Due Diligence" },
  { icon: MapPin,     value: "35+",     label: "DFW Neighborhoods" },
];

export default function TrustBar() {
  return (
    <section
      className="relative z-10 -mt-1 border-b border-primary-deep/40 bg-primary"
      aria-label="Trust statistics"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center gap-1.5 py-6 px-4 text-center"
            >
              <Icon className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-accent sm:text-3xl">{value}</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
