"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";

const OFFICE = "817-265-5762";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#process" },
  { label: "Why Us", href: "#why" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.97)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid oklch(0.91 0.012 320)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#top" aria-label="Clara's CareTeam home">
          <Image
            src={logo}
            alt="Clara's CareTeam"
            className={`h-14 w-auto sm:h-16 transition-opacity hover:opacity-90 ${
              !scrolled ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]" : ""
            }`}
            priority
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={`text-sm font-semibold transition-colors ${
                scrolled
                  ? "text-foreground/80 hover:text-primary"
                  : "text-white/85 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${OFFICE.replace(/-/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-deep hover:shadow-[var(--shadow-elegant)]"
            data-track="nav-call"
          >
            <Phone className="h-3.5 w-3.5" />
            {OFFICE}
          </a>
          <a
            href="#emergency"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-accent bg-accent/10 px-5 py-2.5 text-sm font-bold text-accent transition-all hover:bg-accent hover:text-black"
            data-track="nav-get-care"
          >
            Get Care Now <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`rounded-lg p-2 transition-colors lg:hidden ${
            scrolled
              ? "text-foreground hover:bg-secondary"
              : "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] hover:bg-white/15"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-white shadow-lg lg:hidden"
          >
            <nav className="flex flex-col gap-0.5 px-4 py-3" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-accent" />
                  {label}
                </motion.a>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-2 border-t border-border px-4 py-4">
              <a
                href={`tel:${OFFICE.replace(/-/g, "")}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition-all hover:bg-primary-deep active:scale-[0.97]"
                data-track="mobile-nav-call"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a
                href="#emergency"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent/10 py-3 text-sm font-bold text-accent transition-all hover:bg-accent hover:text-black active:scale-[0.97]"
                data-track="mobile-nav-care"
              >
                Get Care
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
