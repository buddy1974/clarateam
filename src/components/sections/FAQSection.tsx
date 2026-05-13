"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqData } from "@/lib/faqData";

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    ...faqData.map(({ id, label }) => ({ id, label })),
  ];

  const filteredFAQs =
    activeCategory === "all"
      ? faqData.flatMap((c) => c.items)
      : faqData.find((c) => c.id === activeCategory)?.items ?? [];

  return (
    <section
      id="faq"
      className="bg-gradient-to-b from-secondary/40 to-white py-16 sm:py-24"
      aria-label="Frequently asked questions"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-foreground/70">
            Everything you need to know about working with Clara's CareTeam.
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="FAQ categories"
        >
          {categories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              role="tab"
              aria-selected={activeCategory === id}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeCategory === id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-foreground/70 hover:bg-secondary hover:text-primary border border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* FAQ items */}
        <div className="mt-8 space-y-3">
          {filteredFAQs.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]"
            >
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={openId === item.id}
              >
                <span className="text-sm font-bold text-primary sm:text-base">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-accent" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openId === item.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="border-t border-border px-6 pb-5 pt-4 text-sm leading-relaxed text-foreground/75">
                      {item.answer}
                      {item.urgency && (
                        <div className="mt-4 rounded-xl bg-accent/10 p-4">
                          <p className="text-xs font-bold text-accent mb-2">
                            Need immediate help?
                          </p>
                          <a
                            href="tel:18172655762"
                            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-black"
                            data-track="faq-urgent-call"
                          >
                            Call Now — 817-265-5762
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
