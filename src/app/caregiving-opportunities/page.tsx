"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  CheckCircle2, User, Mail, Phone, Briefcase,
  Clock, Star, FileText, Send, ChevronDown,
} from "lucide-react";

const ROLES = ["CNA", "LVN", "HHA", "PCA", "RN", "DON", "Administrator", "Other"];
const SHIFTS = ["Days", "Evenings", "Nights", "Weekends", "Live-in", "Flexible"];

const PERKS = [
  "Competitive pay — weekly direct deposit",
  "Flexible scheduling — you pick your shifts",
  "Work across 35+ DFW care homes",
  "Support team available 24/7",
  "Build your career in residential care",
];

export default function CaregivingOpportunitiesPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "",
    availability: [] as string[],
    experience: "", certifications: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggle(field: "availability", value: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.role) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          availability: form.availability.map((s) => s.toLowerCase().replace("-", "_")),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please call us at 817-265-5762.");
    }
  }

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden pb-16 pt-32 sm:pt-40"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.16 0.10 332 / 0.98) 0%, oklch(0.22 0.12 332 / 0.98) 60%, oklch(0.16 0.10 332 / 0.98) 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-32 top-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
            style={{ background: "oklch(0.74 0.14 75)" }}
          />
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
              Join Our Team
            </span>
            <h1 className="mt-5 font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Caregiving{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-100 bg-clip-text text-transparent">
                Opportunities
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              Clara&apos;s CareTeam is always looking for compassionate, skilled caregivers
              across the DFW area. Apply below — we review every application personally.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {PERKS.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85"
                >
                  <CheckCircle2 className="h-3 w-3 text-amber-400" />
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form ── */}
        <section className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            {status === "success" ? (
              <div className="rounded-3xl border border-green-200 bg-green-50 p-12 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-5 font-serif text-2xl font-bold text-green-800">Application Submitted!</h2>
                <p className="mt-3 text-green-700">
                  Thank you for applying. We review every application personally and will
                  reach out within 48 hours at the contact info you provided.
                </p>
                <p className="mt-4 text-sm text-green-600">
                  For urgent questions, call <strong>817-265-5762</strong>.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-border bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10"
              >
                <div>
                  <h2 className="font-serif text-2xl font-bold text-primary">Apply Now</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All fields marked <span className="text-red-500">*</span> are required.
                    Do not call or text personal numbers — this form is the right channel.
                  </p>
                </div>

                {/* Name + Phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Doreen Smith"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        placeholder="972-555-0100"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Role / Certification <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      required
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="">Select your role…</option>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    <Clock className="mr-1.5 inline h-4 w-4 text-muted-foreground" />
                    Availability (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SHIFTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle("availability", s)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                          form.availability.includes(s)
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-secondary/40 text-foreground hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience + Certs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      <Star className="mr-1.5 inline h-4 w-4 text-muted-foreground" />
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 years"
                      value={form.experience}
                      onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      <FileText className="mr-1.5 inline h-4 w-4 text-muted-foreground" />
                      Certifications
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CNA Texas, CPR"
                      value={form.certifications}
                      onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Tell us about yourself
                  </label>
                  <textarea
                    rows={4}
                    placeholder="A bit about your experience, why you want to join our team, and anything else we should know…"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {errorMsg && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "loading" ? "Submitting…" : (
                    <><Send className="h-4 w-4" /> Submit Application</>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  By submitting you agree to be contacted by Clara&apos;s CareTeam regarding employment.
                  We do not share your information with third parties.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
