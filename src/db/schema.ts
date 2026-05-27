import {
  pgTable, text, timestamp, pgEnum, serial, integer, boolean, numeric,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", [
  "CNA", "LVN", "HHA", "PCA", "RN", "DON", "Administrator", "Other",
]);

export const applicantStatusEnum = pgEnum("applicant_status", [
  "applied", "screened", "interview_scheduled", "background_check", "active", "inactive", "rejected",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "open", "matched", "active", "closed", "cancelled",
]);

export const shiftEnum = pgEnum("shift_type", [
  "days", "evenings", "nights", "weekends", "live_in", "flexible",
]);

export const staffStatusEnum = pgEnum("staff_status", [
  "active", "inactive", "on_leave", "terminated",
]);

export const careLevelEnum = pgEnum("care_level", [
  "companion", "personal", "skilled", "memory", "hospice",
]);

export const shiftStatusEnum = pgEnum("shift_status", [
  "scheduled", "confirmed", "completed", "cancelled", "missed",
]);

export const medLogStatusEnum = pgEnum("med_log_status", [
  "given", "missed", "refused", "held",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft", "sent", "paid", "overdue", "cancelled",
]);


// ── Table: applicants ──────────────────────────────────────────────────────
// Caregiver job applications submitted via /caregiving-opportunities

export const applicants = pgTable("applicants", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  email:        text("email").notNull(),
  phone:        text("phone").notNull(),
  role:         roleEnum("role").notNull(),
  availability: shiftEnum("availability").array().notNull().default([]),
  experience:   text("experience"),          // years / free text
  certifications: text("certifications"),    // comma separated
  message:      text("message"),
  resumeUrl:    text("resume_url"),
  status:       applicantStatusEnum("status").notNull().default("applied"),
  notes:        text("notes"),               // internal admin notes
  source:       text("source").default("website"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: staff ───────────────────────────────────────────────────────────
// Hired caregivers — promoted from applicants or added manually

export const staff = pgTable("staff", {
  id:                    serial("id").primaryKey(),
  applicantId:           integer("applicant_id").references(() => applicants.id),
  name:                  text("name").notNull(),
  email:                 text("email").notNull(),
  phone:                 text("phone").notNull(),
  role:                  roleEnum("role").notNull(),
  status:                staffStatusEnum("status").notNull().default("active"),
  hourlyRate:            numeric("hourly_rate", { precision: 10, scale: 2 }),
  startDate:             text("start_date"),
  emergencyContactName:  text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  certifications:        text("certifications").array().notNull().default([]),
  skills:                text("skills").array().notNull().default([]),
  notes:                 text("notes"),
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: clients ─────────────────────────────────────────────────────────
// Facilities and families (org-level CRM)

export const clients = pgTable("clients", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  type:        text("type").notNull().default("facility"),   // facility | family
  contactName: text("contact_name"),
  email:       text("email"),
  phone:       text("phone"),
  address:     text("address"),
  notes:       text("notes"),
  referredBy:  text("referred_by"),
  active:      boolean("active").notNull().default(true),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ── Table: care_recipients ─────────────────────────────────────────────────
// Individual patients / residents under a client org

export const careRecipients = pgTable("care_recipients", {
  id:                    serial("id").primaryKey(),
  clientId:              integer("client_id").references(() => clients.id),
  name:                  text("name").notNull(),
  dateOfBirth:           text("date_of_birth"),
  address:               text("address"),
  careLevel:             careLevelEnum("care_level"),
  careNeeds:             text("care_needs"),
  riskFlags:             text("risk_flags").array().notNull().default([]),
  emergencyContactName:  text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  notes:                 text("notes"),
  active:                boolean("active").notNull().default(true),
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: staff_assignments ───────────────────────────────────────────────
// Active caregiver ↔ patient pairings

export const staffAssignments = pgTable("staff_assignments", {
  id:           serial("id").primaryKey(),
  staffId:      integer("staff_id").notNull().references(() => staff.id),
  recipientId:  integer("recipient_id").notNull().references(() => careRecipients.id),
  shiftType:    shiftEnum("shift_type"),
  hoursPerWeek: integer("hours_per_week"),
  hourlyRate:   numeric("hourly_rate", { precision: 10, scale: 2 }),
  startDate:    text("start_date"),
  endDate:      text("end_date"),
  notes:        text("notes"),
  active:       boolean("active").notNull().default(true),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

// ── Table: shifts ─────────────────────────────────────────────────────────
// Scheduled work shifts: caregiver → patient → date + time

export const shifts = pgTable("shifts", {
  id:          serial("id").primaryKey(),
  staffId:     integer("staff_id").notNull().references(() => staff.id),
  recipientId: integer("recipient_id").references(() => careRecipients.id),
  clientId:    integer("client_id").references(() => clients.id),
  shiftDate:   text("shift_date").notNull(),   // YYYY-MM-DD
  startTime:   text("start_time").notNull(),   // HH:MM (24h)
  endTime:     text("end_time").notNull(),      // HH:MM (24h)
  hours:       numeric("hours", { precision: 4, scale: 2 }), // auto-calculated
  status:      shiftStatusEnum("status").notNull().default("scheduled"),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: care_requests ───────────────────────────────────────────────────
// Incoming care needs submitted by families / facilities

export const careRequests = pgTable("care_requests", {
  id:           serial("id").primaryKey(),
  contactName:  text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  facilityName: text("facility_name"),        // null = private family
  address:      text("address"),
  careType:     roleEnum("care_type").notNull(),
  hoursPerWeek: integer("hours_per_week"),
  startDate:    text("start_date"),
  shiftNeeded:  shiftEnum("shift_needed").array().notNull().default([]),
  specialNeeds: text("special_needs"),
  status:       requestStatusEnum("status").notNull().default("open"),
  notes:        text("notes"),
  assignedTo:   integer("assigned_to").references(() => applicants.id),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: assignments ─────────────────────────────────────────────────────
// Links a caregiver to a care request / shift

export const assignments = pgTable("assignments", {
  id:            serial("id").primaryKey(),
  applicantId:   integer("applicant_id").notNull().references(() => applicants.id),
  careRequestId: integer("care_request_id").notNull().references(() => careRequests.id),
  startDate:     text("start_date"),
  endDate:       text("end_date"),
  hoursPerWeek:  integer("hours_per_week"),
  rate:          text("rate"),              // hourly rate string
  notes:         text("notes"),
  active:        boolean("active").notNull().default(true),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

// ── Table: emails ──────────────────────────────────────────────────────────
// Cached inbox from info@claracareteam.com (pulled via IMAP)

export const emails = pgTable("emails", {
  id:         serial("id").primaryKey(),
  uid:        text("uid").unique().notNull(),   // IMAP UID — prevents duplicates
  sender:     text("sender").notNull(),
  subject:    text("subject"),
  bodyText:   text("body_text"),
  receivedAt: timestamp("received_at"),
  tag:        text("tag").default("general"),   // applicant | care_request | general
  isRead:     boolean("is_read").notNull().default(false),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

// ── Table: medications ─────────────────────────────────────────────────────
// Prescriptions / OTC meds per care recipient

export const medications = pgTable("medications", {
  id:          serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull().references(() => careRecipients.id),
  name:        text("name").notNull(),
  dosage:      text("dosage").notNull(),         // e.g. "10mg"
  frequency:   text("frequency").notNull(),      // e.g. "twice daily"
  route:       text("route").notNull().default("oral"), // oral | topical | injection | inhaled
  times:       text("times").array().notNull().default([]), // ["08:00","20:00"]
  prescriber:  text("prescriber"),
  startDate:   text("start_date"),
  endDate:     text("end_date"),                // null = ongoing
  notes:       text("notes"),
  active:      boolean("active").notNull().default(true),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: medication_logs ──────────────────────────────────────────────────
// Administration records — one row per dose given/missed

export const medicationLogs = pgTable("medication_logs", {
  id:             serial("id").primaryKey(),
  medicationId:   integer("medication_id").notNull().references(() => medications.id),
  staffId:        integer("staff_id").references(() => staff.id),
  scheduledTime:  text("scheduled_time").notNull(), // HH:MM
  logDate:        text("log_date").notNull(),        // YYYY-MM-DD
  status:         medLogStatusEnum("status").notNull().default("given"),
  administeredAt: timestamp("administered_at"),
  notes:          text("notes"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

// ── Table: invoices ────────────────────────────────────────────────────────
// Client billing invoices — generated from completed shifts

export const invoices = pgTable("invoices", {
  id:         serial("id").primaryKey(),
  clientId:   integer("client_id").notNull().references(() => clients.id),
  invoiceNo:  text("invoice_no").notNull().unique(),   // INV-2026-001
  periodFrom: text("period_from").notNull(),           // YYYY-MM-DD
  periodTo:   text("period_to").notNull(),
  status:     invoiceStatusEnum("status").notNull().default("draft"),
  subtotal:   numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  taxRate:    numeric("tax_rate",  { precision: 5,  scale: 2 }).notNull().default("0"),
  taxAmount:  numeric("tax_amount",{ precision: 10, scale: 2 }).notNull().default("0"),
  total:      numeric("total",     { precision: 10, scale: 2 }).notNull().default("0"),
  notes:      text("notes"),
  dueDate:    text("due_date"),
  paidAt:     text("paid_at"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: invoice_lines ───────────────────────────────────────────────────
// One row per staff member per invoice

export const invoiceLines = pgTable("invoice_lines", {
  id:          serial("id").primaryKey(),
  invoiceId:   integer("invoice_id").notNull().references(() => invoices.id),
  shiftId:     integer("shift_id").references(() => shifts.id),
  staffName:   text("staff_name").notNull(),
  description: text("description").notNull(),
  hours:       numeric("hours",  { precision: 6,  scale: 2 }).notNull(),
  rate:        numeric("rate",   { precision: 10, scale: 2 }).notNull(),
  amount:      numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ── Table: site_settings ──────────────────────────────────────────────────
// Key-value store for public website content

export const siteSettings = pgTable("site_settings", {
  key:       text("key").primaryKey(),
  value:     text("value"),
  label:     text("label").notNull(),
  section:   text("section").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: testimonials ────────────────────────────────────────────────────

export const testimonials = pgTable("testimonials", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  role:      text("role"),
  quote:     text("quote").notNull(),
  rating:    integer("rating").notNull().default(5),
  sortOrder: integer("sort_order").notNull().default(0),
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: faqs ────────────────────────────────────────────────────────────

export const faqs = pgTable("faqs", {
  id:        serial("id").primaryKey(),
  question:  text("question").notNull(),
  answer:    text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: telegram_subs ───────────────────────────────────────────────────
// Chat IDs that receive notifications

export const telegramSubs = pgTable("telegram_subs", {
  id:        serial("id").primaryKey(),
  chatId:    text("chat_id").unique().notNull(),
  label:     text("label"),    // "Jessica" | "Kevin" | "Group"
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
