"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Zap } from "lucide-react";

const OFFICE = "817-548-1986";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  // Show after scrolling past the hero
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-border bg-white/95 px-4 pb-safe pt-3 pb-4 backdrop-blur-md shadow-[0_-4px_24px_oklch(0.30_0.14_332/0.12)] md:hidden"
          role="navigation"
          aria-label="Quick contact actions"
        >
          {/* Call Now */}
          <a
            href={`tel:${OFFICE.replace(/-/g, "")}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-[var(--shadow-soft)] active:scale-[0.97] transition-transform"
            data-track="sticky-call"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>

          {/* Get Care Today */}
          <a
            href="#emergency"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent/10 py-3.5 text-sm font-bold text-accent active:scale-[0.97] transition-transform"
            data-track="sticky-get-care"
          >
            <Zap className="h-4 w-4" />
            Get Care Today
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
