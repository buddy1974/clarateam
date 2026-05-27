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

// ── Phase 1 Enums ──────────────────────────────────────────────────────────

export const draftTypeEnum = pgEnum("draft_type", [
  "intake", "medication", "report", "care_plan", "incident", "shift_note",
]);

export const draftStatusEnum = pgEnum("draft_status", [
  "draft", "pending", "approved", "rejected",
]);

export const notifStatusEnum = pgEnum("notif_status", ["read", "unread"]);

export const userRoleEnum = pgEnum("user_role", ["operator", "validator"]);

// ── Table: applicants ──────────────────────────────────────────────────────
// Caregiver job applications submitted via /caregiving-opportunities

export const applicants = pgTable("applicants", {
  id:             serial("id").primaryKey(),
  name:           text("name").notNull(),
  email:          text("email").notNull(),
  phone:          text("phone").notNull(),
  role:           roleEnum("role").notNull(),
  availability:   shiftEnum("availability").array().notNull().default([]),
  experience:     text("experience"),
  certifications: text("certifications"),
  message:        text("message"),
  resumeUrl:      text("resume_url"),
  status:         applicantStatusEnum("status").notNull().default("applied"),
  notes:          text("notes"),
  source:         text("source").default("website"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
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
  type:        text("type").notNull().default("facility"),
  contactName: text("contact_name"),
  email:       text("email"),
  phone:       text("phone"),
  address:     text("address"),
  notes:       text("notes"),
  referredBy:  text("referred_by"),
  active:      boolean("active").notNull().default(true),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ── Table: care_plans ──────────────────────────────────────────────────────
// Defined before care_recipients to allow FK reference

export const carePlans = pgTable("care_plans", {
  id:              serial("id").primaryKey(),
  careRecipientId: integer("care_recipient_id"), // back-filled after care_recipient creation
  notes:           text("notes"),
  conditions:      text("conditions"),           // medical conditions (free text)
  allergies:       text("allergies"),            // known allergies (free text)
  dietType:        text("diet_type"),            // quick diet ref
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: care_recipients ─────────────────────────────────────────────────
// Individual patients / residents

export const careRecipients = pgTable("care_recipients", {
  id:                    serial("id").primaryKey(),
  clientId:              integer("client_id").references(() => clients.id),
  // Legacy combined field — kept for backward compat
  name:                  text("name").notNull(),
  // Phase 1: structured name + demographics
  firstName:             text("first_name"),
  lastName:              text("last_name"),
  gender:                text("gender"),           // "male" | "female" | "other"
  dateOfBirth:           text("date_of_birth"),
  address:               text("address"),
  careLevel:             careLevelEnum("care_level"),
  careNeeds:             text("care_needs"),
  riskFlags:             text("risk_flags").array().notNull().default([]),
  emergencyContactName:  text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  notes:                 text("notes"),
  status:                text("status").notNull().default("active"),  // "active" | "inactive"
  carePlanId:            integer("care_plan_id").references(() => carePlans.id),
  active:                boolean("active").notNull().default(true),   // kept for compat
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: staff_assignments ───────────────────────────────────────────────

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

export const shifts = pgTable("shifts", {
  id:          serial("id").primaryKey(),
  staffId:     integer("staff_id").notNull().references(() => staff.id),
  recipientId: integer("recipient_id").references(() => careRecipients.id),
  clientId:    integer("client_id").references(() => clients.id),
  shiftDate:   text("shift_date").notNull(),
  startTime:   text("start_time").notNull(),
  endTime:     text("end_time").notNull(),
  hours:       numeric("hours", { precision: 4, scale: 2 }),
  status:      shiftStatusEnum("status").notNull().default("scheduled"),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: care_requests ───────────────────────────────────────────────────

export const careRequests = pgTable("care_requests", {
  id:           serial("id").primaryKey(),
  contactName:  text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  facilityName: text("facility_name"),
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

export const assignments = pgTable("assignments", {
  id:            serial("id").primaryKey(),
  applicantId:   integer("applicant_id").notNull().references(() => applicants.id),
  careRequestId: integer("care_request_id").notNull().references(() => careRequests.id),
  startDate:     text("start_date"),
  endDate:       text("end_date"),
  hoursPerWeek:  integer("hours_per_week"),
  rate:          text("rate"),
  notes:         text("notes"),
  active:        boolean("active").notNull().default(true),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

// ── Table: emails ──────────────────────────────────────────────────────────

export const emails = pgTable("emails", {
  id:         serial("id").primaryKey(),
  uid:        text("uid").unique().notNull(),
  sender:     text("sender").notNull(),
  subject:    text("subject"),
  bodyText:   text("body_text"),
  receivedAt: timestamp("received_at"),
  tag:        text("tag").default("general"),
  isRead:     boolean("is_read").notNull().default(false),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

// ── Table: medications ─────────────────────────────────────────────────────

export const medications = pgTable("medications", {
  id:          serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull().references(() => careRecipients.id),
  name:        text("name").notNull(),
  dosage:      text("dosage").notNull(),
  frequency:   text("frequency").notNull(),
  route:       text("route").notNull().default("oral"),
  times:       text("times").array().notNull().default([]),
  prescriber:  text("prescriber"),
  startDate:   text("start_date"),
  endDate:     text("end_date"),
  notes:       text("notes"),
  active:      boolean("active").notNull().default(true),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: medication_logs ──────────────────────────────────────────────────

export const medicationLogs = pgTable("medication_logs", {
  id:             serial("id").primaryKey(),
  medicationId:   integer("medication_id").notNull().references(() => medications.id),
  staffId:        integer("staff_id").references(() => staff.id),
  shiftId:        integer("shift_id").references(() => shifts.id),  // Phase 3
  scheduledTime:  text("scheduled_time").notNull(),
  logDate:        text("log_date").notNull(),
  status:         medLogStatusEnum("status").notNull().default("given"),
  administeredAt: timestamp("administered_at"),
  notes:          text("notes"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

// ── Table: invoices ────────────────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id:         serial("id").primaryKey(),
  clientId:   integer("client_id").notNull().references(() => clients.id),
  invoiceNo:  text("invoice_no").notNull().unique(),
  periodFrom: text("period_from").notNull(),
  periodTo:   text("period_to").notNull(),
  status:     invoiceStatusEnum("status").notNull().default("draft"),
  subtotal:   numeric("subtotal",  { precision: 10, scale: 2 }).notNull().default("0"),
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

export const telegramSubs = pgTable("telegram_subs", {
  id:        serial("id").primaryKey(),
  chatId:    text("chat_id").unique().notNull(),
  label:     text("label"),
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ══════════════════════════════════════════════════════════════════════════
// ── PHASE 1 TABLES ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// ── Table: drafts ──────────────────────────────────────────────────────────
// Staging area — ALL data enters here before becoming a final entity

export const drafts = pgTable("drafts", {
  id:              serial("id").primaryKey(),
  type:            draftTypeEnum("type").notNull().default("intake"),
  relatedEntityId: integer("related_entity_id"),       // set on approval
  rawData:         text("raw_data"),                   // JSON string — raw extracted input
  aiData:          text("ai_data"),                    // JSON string — AI-structured output
  status:          draftStatusEnum("status").notNull().default("draft"),
  version:         integer("version").notNull().default(1),
  parentDraftId:   integer("parent_draft_id"),         // for versioned edits
  createdBy:       text("created_by").notNull().default("admin"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: audit_logs ─────────────────────────────────────────────────────
// Immutable log — every approve/reject/edit recorded here

export const auditLogs = pgTable("audit_logs", {
  id:          serial("id").primaryKey(),
  entityType:  text("entity_type").notNull(),         // "draft" | "care_recipient" | ...
  entityId:    integer("entity_id").notNull(),
  action:      text("action").notNull(),              // "create" | "update" | "approve" | "reject" | "pending"
  performedBy: text("performed_by").notNull().default("admin"),
  meta:        text("meta"),                          // JSON string — extra context
  timestamp:   timestamp("timestamp").defaultNow().notNull(),
});

// ── Table: notifications ───────────────────────────────────────────────────
// In-app notifications + Telegram trigger log

export const notifications = pgTable("notifications", {
  id:        serial("id").primaryKey(),
  type:      text("type").notNull().default("info"),  // "info" | "action" | "alert"
  message:   text("message").notNull(),
  status:    notifStatusEnum("status").notNull().default("unread"),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Table: users ───────────────────────────────────────────────────────────
// Minimal role system: operator (creates drafts) / validator (approves)

export const users = pgTable("users", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  role:      userRoleEnum("role").notNull().default("operator"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ══════════════════════════════════════════════════════════════════════════
// ── PHASE 2 TABLES — CARE CORE ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// ── Table: diet_plans ─────────────────────────────────────────────────────
// One active diet plan per care recipient

export const dietPlans = pgTable("diet_plans", {
  id:              serial("id").primaryKey(),
  careRecipientId: integer("care_recipient_id").notNull().references(() => careRecipients.id),
  dietType:        text("diet_type"),        // "regular" | "soft" | "pureed" | "diabetic" | "low-sodium" | "low-fat" | "other"
  restrictions:    text("restrictions"),    // free text — allergy/intolerance notes
  notes:           text("notes"),
  active:          boolean("active").notNull().default(true),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: care_tasks ─────────────────────────────────────────────────────
// Task templates assigned to a care recipient (reusable per-shift or daily)

export const careTasks = pgTable("care_tasks", {
  id:              serial("id").primaryKey(),
  careRecipientId: integer("care_recipient_id").notNull().references(() => careRecipients.id),
  title:           text("title").notNull(),
  description:     text("description"),
  frequency:       text("frequency").notNull().default("daily"),  // "per_shift" | "daily" | "weekly"
  active:          boolean("active").notNull().default(true),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: task_logs ──────────────────────────────────────────────────────
// Execution records — one row per task per shift/day

export const taskLogs = pgTable("task_logs", {
  id:              serial("id").primaryKey(),
  taskId:          integer("task_id").notNull().references(() => careTasks.id),
  careRecipientId: integer("care_recipient_id").notNull().references(() => careRecipients.id),
  staffId:         integer("staff_id").references(() => staff.id),
  shiftId:         integer("shift_id").references(() => shifts.id),  // Phase 3
  status:          text("status").notNull().default("done"),   // "done" | "skipped"
  notes:           text("notes"),
  logDate:         text("log_date").notNull(),                 // YYYY-MM-DD
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

// ══════════════════════════════════════════════════════════════════════════
// ── PHASE 3 TABLES — OPERATIONS ENGINE ───────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// ── PHASE 4 TABLES — BUSINESS + COMPLIANCE ENGINE ────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// ── Table: reports ────────────────────────────────────────────────────────
// Generated compliance and business reports

export const reports = pgTable("reports", {
  id:              serial("id").primaryKey(),
  type:            text("type").notNull(),        // "mar" | "shift" | "task" | "summary"
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  periodFrom:      text("period_from").notNull(),
  periodTo:        text("period_to").notNull(),
  content:         text("content"),               // JSON string — raw data snapshot
  aiSummary:       text("ai_summary"),            // AI-enhanced narrative
  createdBy:       text("created_by").notNull().default("admin"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

// ── Table: alerts ─────────────────────────────────────────────────────────
// Operational alerts — auto-generated from missed meds, skipped tasks, etc.

export const alerts = pgTable("alerts", {
  id:              serial("id").primaryKey(),
  type:            text("type").notNull(),        // "medication_missed" | "task_skipped" | "shift_missing"
  severity:        text("severity").notNull().default("medium"),   // "low" | "medium" | "high"
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  shiftId:         integer("shift_id").references(() => shifts.id),
  message:         text("message"),
  resolved:        boolean("resolved").notNull().default(false),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});
