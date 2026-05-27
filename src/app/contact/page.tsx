"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Phone, Smartphone, Mail, MapPin, Clock, CheckCircle, ArrowRight } from "lucide-react";

const OFFICE  = "817-265-5762";
const MOBILE  = "469-853-5038";
const EMAIL   = "info@claracareteam.com";
const ADDRESS = "P.O. Box 200455, Arlington, TX 76006";

const CONTACT_CARDS = [
  { icon: Phone,      label: "Office",   value: OFFICE,           href: `tel:${OFFICE.replace(/-/g,"")}` },
  { icon: Smartphone, label: "Mobile",   value: MOBILE,           href: `tel:${MOBILE.replace(/-/g,"")}` },
  { icon: Mail,       label: "Email",    value: EMAIL,            href: `mailto:${EMAIL}` },
  { icon: MapPin,     label: "Location", value: "Arlington, TX 76006", href: null },
];

const HOURS = [
  { day: "Monday – Friday",   time: "8:00 AM – 6:00 PM" },
  { day: "Saturday",          time: "9:00 AM – 3:00 PM" },
  { day: "Sunday",            time: "On-call available" },
  { day: "Urgent / 24-hour",  time: "Call anytime — we answer" },
];

const SUBJECTS = [
  "Request a Caregiver",
  "Staffing for a Facility",
  "Residential Placement",
  "General Inquiry",
  "Join Our Team",
  "Other",
];

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
  const [status,  setStatus]  = useState<"idle" | "sending" | "sent" | "error">("idle");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40" aria-label="Contact hero">
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.98) 0%, oklch(0.22 0.12 332 / 0.98) 50%, oklch(0.16 0.10 332 / 0.98) 100%)" }} />
        <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "oklch(0.74 0.14 75)" }} />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full opacity-20 blur-[100px]"
          style={{ background: "oklch(0.74 0.14 75)" }} />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
            Contact Us
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold text-white sm:text-5xl">
            We're Here When You Need Us
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-white/75">
            Call, email, or fill out the form below. For urgent care needs, call us directly — we answer 24/7.
          </p>
        </div>
      </section>

      {/* ── Contact cards ── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_CARDS.map(({ icon: Icon, label, value, href }) => {
              const Wrapper = href ? "a" : "div";
              return (
                <Wrapper
                  key={label}
                  {...(href ? { href } : {})}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-5 text-center transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "oklch(0.30 0.14 332 / 0.10)" }}>
                    <Icon className="h-5 w-5" style={{ color: "oklch(0.30 0.14 332)" }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40">{label}</div>
                    <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Form + Hours ── */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5">

            {/* Contact form */}
            <div className="lg:col-span-3">
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Send Us a Message</h2>
              <p className="mt-2 text-sm text-foreground/55">We typically respond within a few hours during business hours.</p>

              {status === "sent" ? (
                <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-xl font-bold text-green-800">Message Sent!</h3>
                  <p className="mt-2 text-green-700">
                    Thank you, {form.name}. We'll be in touch shortly. For urgent needs, call <a href="tel:8172655762" className="font-bold underline">{OFFICE}</a>.
                  </p>
                  <button
                    onClick={() => { setForm({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" }); setStatus("idle"); }}
                    className="mt-6 rounded-full border border-green-300 px-6 py-2 text-sm font-bold text-green-700 hover:bg-green-100"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground/60">Full Name *</label>
                      <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="Jessica Smith" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground/60">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="817-000-0000" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-foreground/60">Email</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="you@example.com" />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-foreground/60">Subject</label>
                    <select value={form.subject} onChange={(e) => set("subject", e.target.value)}
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-foreground/60">Message *</label>
                    <textarea required value={form.message} onChange={(e) => set("message", e.target.value)}
                      rows={5} placeholder="Tell us about your care needs..."
                      className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  </div>

                  {status === "error" && (
                    <p className="text-sm text-red-600">Something went wrong. Please call us directly at {OFFICE}.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-extrabold text-black shadow-md transition-all hover:scale-[1.02] disabled:opacity-60 sm:w-auto sm:px-10"
                    style={{ background: "oklch(0.74 0.14 75)" }}
                  >
                    {status === "sending" ? "Sending..." : <>Send Message <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              )}
            </div>

            {/* Hours */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Office Hours</h2>
              <p className="mt-2 text-sm text-foreground/55">We're available beyond these hours for urgent care needs.</p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {HOURS.map(({ day, time }, i) => (
                  <div key={day} className={`flex items-center gap-3 px-5 py-4 ${i < HOURS.length - 1 ? "border-b border-border" : ""}`}>
                    <Clock className="h-4 w-4 shrink-0 text-accent" />
                    <div>
                      <div className="text-xs font-bold text-foreground/50">{day}</div>
                      <div className="text-sm font-semibold text-foreground">{time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-5 text-center">
                <p className="text-sm font-bold text-foreground">Urgent or after-hours?</p>
                <a href={`tel:${OFFICE.replace(/-/g,"")}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold text-black transition-all hover:scale-[1.03]"
                  style={{ background: "oklch(0.74 0.14 75)" }}>
                  <Phone className="h-4 w-4" /> Call {OFFICE}
                </a>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Mailing Address</p>
                <p className="mt-2 text-sm text-foreground">{ADDRESS}</p>
                <p className="mt-1 text-xs text-foreground/50">Serving all of DFW — Dallas, Fort Worth, Arlington, and 35+ surrounding cities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-border bg-white px-4 py-6 text-center text-xs text-foreground/40">
        © {new Date().getFullYear()} Clara's CareTeam, LLC · {ADDRESS} · DFW Residential Care Staffing · 24/7 On-Call
      </div>

      <AIChatWidget />
      <StickyMobileCTA />
    </>
  );
}
