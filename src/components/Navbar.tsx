"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Phone, ChevronRight, ChevronDown,
  Users2, Home, Activity, Wrench, BarChart3, Shield,
} from "lucide-react";

const OFFICE = "817-265-5762";

const NAV_LINKS = [
  { label: "Services",    href: "/#services" },
  { label: "How It Works", href: "/#process" },
  { label: "Why Us",      href: "/#why" },
  { label: "Contact",     href: "/#contact" },
] as const;

const SOLUTIONS = [
  { icon: Users2,    label: "Staffing Registry",    href: "/#services",             sub: "CNAs, HHAs, PRN coverage" },
  { icon: Home,      label: "Residential Placement", href: "/residential-placement", sub: "Find the right care home" },
  { icon: Activity,  label: "Care Monitoring",       href: "/care-monitoring",       sub: "Smart, privacy-first oversight" },
  { icon: Wrench,    label: "Care Tools",            href: "/care-tools",            sub: "Workflow & documentation" },
  { icon: BarChart3, label: "Revenue Insights",      href: "/insights",              sub: "Analytics & performance" },
  { icon: Shield,    label: "Compliance System",     href: "/compliance",            sub: "Survey-ready, every shift" },
] as const;

export default function Navbar() {
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [solOpen, setSolOpen]     = useState(false);
  const [mobileSol, setMobileSol] = useState(false);
  const dropRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setSolOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkCls = `text-sm font-semibold transition-colors ${
    scrolled ? "text-foreground/80 hover:text-primary" : "text-white/85 hover:text-white"
  }`;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        borderBottom: scrolled ? "1px solid oklch(0.91 0.012 320)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

        {/* Logo — gold pill on hero, plain on scroll */}
        <a href="/" aria-label="Clara's CareTeam home" className="flex-shrink-0">
          <div
            className="inline-flex items-center rounded-3xl px-4 py-1 transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
            style={!scrolled ? {
              background: "oklch(0.74 0.14 75)",
              boxShadow: "0 0 48px oklch(0.74 0.14 75 / 0.75), 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
            } : undefined}
          >
            <Image
              src="/logo2.png"
              alt="Clara's CareTeam"
              width={240}
              height={96}
              className="h-24 w-auto transition-opacity hover:opacity-95"
              priority
            />
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">

          {/* Solutions dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setSolOpen((v) => !v)}
              className={`flex items-center gap-1 ${linkCls}`}
              aria-expanded={solOpen}
              aria-haspopup="true"
            >
              Solutions
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${solOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {solOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-elegant)]"
                >
                  {SOLUTIONS.map(({ icon: Icon, label, href, sub }) => (
                    <a
                      key={href}
                      href={href}
                      onClick={() => setSolOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary"
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{label}</div>
                        <div className="text-xs text-foreground/55">{sub}</div>
                      </div>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className={linkCls}>
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex"