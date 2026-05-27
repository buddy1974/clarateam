"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";

const OFFICE = "817-265-5762";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  // Show after scrolling 400px past the hero
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    handler(); // run immediately
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
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/97 shadow-[0_-4px_24px_oklch(0.30_0.14_332/0.12)] backdrop-blur-md md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          role="navigation"
          aria-label="Quick contact actions"
        >
          <div className="flex gap-2 px-4 pt-3">
            <a
              href={`tel:${OFFICE.replace(/-/g, "")}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-sm active:scale-[0.97] transition-transform"
              data-track="sticky-call"
            >
              <Phone className="h-4 w-4" />
              Call Now &middot; {OFFICE}
            </a>
            <a
              href="/contact"
              className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-black active:scale-[0.97] transition-transform"
              data-track="sticky-get-care"
            >
              <MessageCircle className="h-4 w-4" />
              Get Care
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
