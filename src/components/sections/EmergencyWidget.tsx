"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, ChevronRight, CheckCircle2, Phone } from "lucide-react";

const OFFICE = "817-548-1986";

const schema = z.object({
  urgency: z.enum(["today", "24h", "this-week"], {
    required_error: "Please select when you need care",
  }),
  careType: z.string().min(1, "Please select a care type"),
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type FormValues = z.infer<typeof schema>;

const urgencyOptions = [
  { value: "today",     label: "Today",      sub: "Within hours" },
  { value: "24h",       label: "24 Hours",   sub: "Tomorrow" },
  { value: "this-week", label: "This Week",  sub: "Planned ahead" },
] as const;

const careTypes = [
  "PRN / Emergency Coverage",
  "Certified Caregiver (CNA/HHA)",
  "Personal Care Assistant (PCA)",
  "Memory Care Specialist",
  "Medication Aide (MAR/NAR)",
  "Fractional Leadership / Admin",
];

export default function EmergencyWidget() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedUrgency = watch("urgency");

  const onSubmit = async (data: FormValues) => {
    // Placeholder — wire to API route or Formspree
    console.log("[EmergencyWidget] Form submission:", data);
    // Simulate async
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
  };

  return (
    <section
      id="emergency"
      className="relative overflow-hidden bg-gradient-to-br from-secondary/80 via-white to-secondary/40 py-16 sm:py-20"
      aria-label="Get care now"
    >
      {/* Gold accent top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-white p-8 shadow-[var(--shadow-elegant)] ring-1 ring-border sm:p-10"
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary">
                  We're on it!
                </h3>
                <p className="text-base text-foreground/70">
                  Our team will call you within <strong className="text-primary">15 minutes</strong>.
                  For fastest response, call us directly:
                </p>
                <a
                  href={`tel:${OFFICE.replace(/-/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-white shadow-[var(--shadow-soft)]"
                  data-track="widget-call-after-submit"
                >
                  <Phone className="h-4 w-4" /> {OFFICE}
                </a>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">
                      Get Care Now
                    </h2>
                    <p className="mt-1 text-sm text-foreground/65">
                      Tell us what you need — we'll match you in minutes.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  {/* Urgency selector */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground/60">
                      When do you need care?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {urgencyOptions.map(({ value, label, sub }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setValue("urgency", value, { shouldValidate: true })}
                          className={`rounded-xl border-2 p-3 text-center transition-all ${
                            selectedUrgency === value
                              ? "border-accent bg-accent/10 shadow-sm"
                              : "border-border hover:border-accent/40"
                          }`}
                          aria-pressed={selectedUrgency === value}
                        >
                          <div className="text-sm font-bold text-primary">{label}</div>
                          <div className="mt-0.5 text-[10px] text-foreground/55">{sub}</div>
                        </button>
                      ))}
                    </div>
                    {errors.urgency && (
                      <p className="mt-1 text-xs text-destructive">{errors.urgency.message}</p>
                    )}
                    <input type="hidden" {...register("urgency")} />
                  </div>

                  {/* Care type */}
                  <div>
                    <label htmlFor="careType" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground/60">
                      Type of care needed
                    </label>
                    <select
                      id="careType"
                      {...register("careType")}
                      className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
                    >
                      <option value="">Select care type…</option>
                      {careTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.careType && (
                      <p className="mt-1 text-xs text-destructive">{errors.careType.message}</p>
                    )}
                  </div>

                  {/* Name + phone */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground/60">
                        Your name
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...register("name")}
                        placeholder="First & last name"
                        className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-medium placeholder:text-foreground/35 focus:border-primary focus:outline-none"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground/60">
                        Best phone number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="(817) 000-0000"
                        className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-medium placeholder:text-foreground/35 focus:border-primary focus:outline-none"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-deep hover:shadow-[var(--shadow-elegant)] disabled:opacity-60"
                    data-track="emergency-widget-submit"
                  >
                    {isSubmitting ? "Matching…" : (
                      <>Match Me Instantly <ChevronRight className="h-4 w-4" /></>
                    )}
                  </button>

                  <p className="text-center text-xs text-foreground/50">
                    Or call directly:{" "}
                    <a href={`tel:${OFFICE.replace(/-/g, "")}`} className="font-bold text-primary">
                      {OFFICE}
                    </a>
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
