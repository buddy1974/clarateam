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

export const draftTypeEnum = pgEnum("draft_type", [
  "intake", "medication", "report", "care_plan", "incident", "shift_note",
]);

export const draftStatusEnum = pgEnum("draft_status", [
  "draft", "pending", "approved", "rejected",
]);

export const notifStatusEnum = pgEnum("notif_status", ["read", "unread"]);

export const userRoleEnum = pgEnum("user_role", ["operator", "validator"]);

// ── Table: applicants ──────────────────────────────────────────────────────

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

export const carePlans = pgTable("care_plans", {
  id:              serial("id").primaryKey(),
  careRecipientId: integer("care_recipient_id"),
  notes:           text("notes"),
  conditions:      text("conditions"),
  allergies:       text("allergies"),
  dietType:        text("diet_type"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: care_recipients ─────────────────────────────────────────────────

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
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: care_requests ───────────────────────────────────────────────────

export const careRequests = pgTable("care_requests", {
  id:           serial("id").primaryKey(),
  contactName:  text("contact_name").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  facilityName: text("facility_name"),
  address:      text("address"),
  careType:     text("care_type"),
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
  applicantId:   integer("applicant_id").references(() => applicants.id),
  careRequestId: integer("care_request_id").references(() => careRequests.id),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

// ── Table: shifts ──────────────────────────────────────────────────────────

export const shifts = pgTable("shifts", {
  id:          serial("id").primaryKey(),
  staffId:     integer("staff_id").references(() => staff.id),
  recipientId: integer("recipient_id").references(() => careRecipients.id),
  clientId:    integer("client_id").references(() => clients.id),
  shiftDate:   text("shift_date").notNull(),
  startTime:   text("start_time").notNull(),
  endTime:     text("end_time").notNull(),
  hours:       numeric("hours", { precision: 5, scale: 2 }),
  status:      shiftStatusEnum("status").notNull().default("scheduled"),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: medications ─────────────────────────────────────────────────────

export const medications = pgTable("medications", {
  id:          serial("id").primaryKey(),
  recipientId: integer("recipient_id").references(() => careRecipients.id),
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

// ── Table: medication_logs ─────────────────────────────────────────────────

export const medicationLogs = pgTable("medication_logs", {
  id:             serial("id").primaryKey(),
  medicationId:   integer("medication_id").references(() => medications.id),
  staffId:        integer("staff_id").references(() => staff.id),
  shiftId:        integer("shift_id").references(() => shifts.id),
  scheduledTime:  text("scheduled_time").notNull(),
  logDate:        text("log_date").notNull(),
  status:         medLogStatusEnum("status").notNull().default("given"),
  administeredAt: timestamp("administered_at"),
  notes:          text("notes"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

// ── Table: care_tasks ──────────────────────────────────────────────────────

export const careTasks = pgTable("care_tasks", {
  id:              serial("id").primaryKey(),
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  title:           text("title").notNull(),
  description:     text("description"),
  frequency:       text("frequency").notNull().default("daily"),
  active:          boolean("active").notNull().default(true),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: task_logs ───────────────────────────────────────────────────────

export const taskLogs = pgTable("task_logs", {
  id:              serial("id").primaryKey(),
  taskId:          integer("task_id").references(() => careTasks.id),
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  staffId:         integer("staff_id").references(() => staff.id),
  shiftId:         integer("shift_id").references(() => shifts.id),
  status:          text("status").notNull().default("done"),
  notes:           text("notes"),
  logDate:         text("log_date").notNull(),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

// ── Table: diet_plans ──────────────────────────────────────────────────────

export const dietPlans = pgTable("diet_plans", {
  id:              serial("id").primaryKey(),
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  dietType:        text("diet_type"),
  restrictions:    text("restrictions"),
  notes:           text("notes"),
  active:          boolean("active").notNull().default(true),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: alerts ──────────────────────────────────────────────────────────

export const alerts = pgTable("alerts", {
  id:              serial("id").primaryKey(),
  type:            text("type").notNull(),
  severity:        text("severity").notNull().default("medium"),
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  shiftId:         integer("shift_id").references(() => shifts.id),
  message:         text("message"),
  resolved:        boolean("resolved").notNull().default(false),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

// ── Table: drafts ──────────────────────────────────────────────────────────

export const drafts = pgTable("drafts", {
  id:              serial("id").primaryKey(),
  type:            draftTypeEnum("type").notNull(),
  rawData:         text("raw_data").notNull().default("{}"),
  aiData:          text("ai_data").notNull().default("{}"),
  relatedEntityId: integer("related_entity_id"),
  createdBy:       text("created_by").notNull(),
  status:          draftStatusEnum("status").notNull().default("draft"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: audit_logs ─────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id:          serial("id").primaryKey(),
  entityType:  text("entity_type").notNull(),
  entityId:    integer("entity_id"),
  action:      text("action").notNull(),
  performedBy: text("performed_by").notNull(),
  meta:        text("meta"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ── Table: reports ─────────────────────────────────────────────────────────

export const reports = pgTable("reports", {
  id:              serial("id").primaryKey(),
  type:            text("type").notNull(),
  careRecipientId: integer("care_recipient_id").references(() => careRecipients.id),
  periodFrom:      text("period_from").notNull(),
  periodTo:        text("period_to").notNull(),
  content:         text("content"),
  aiSummary:       text("ai_summary"),
  createdBy:       text("created_by").notNull().default("admin"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

// ── Table: notifications ───────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id:        serial("id").primaryKey(),
  type:      text("type").notNull(),
  message:   text("message").notNull(),
  status:    notifStatusEnum("status").notNull().default("unread"),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Table: invoices ────────────────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id:         serial("id").primaryKey(),
  clientId:   integer("client_id").references(() => clients.id),
  invoiceNo:  text("invoice_no").notNull(),
  periodFrom: text("period_from").notNull(),
  periodTo:   text("period_to").notNull(),
  subtotal:   numeric("subtotal", { precision: 10, scale: 2 }),
  taxRate:    numeric("tax_rate", { precision: 5, scale: 4 }),
  taxAmount:  numeric("tax_amount", { precision: 10, scale: 2 }),
  total:      numeric("total", { precision: 10, scale: 2 }),
  dueDate:    text("due_date"),
  notes:      text("notes"),
  status:     invoiceStatusEnum("status").notNull().default("draft"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull(),
});

// ── Table: invoice_lines ───────────────────────────────────────────────────

export const invoiceLines = pgTable("invoice_lines", {
  id:          serial("id").primaryKey(),
  invoiceId:   integer("invoice_id").references(() => invoices.id),
  shiftId:     integer("shift_id").references(() => shifts.id),
  staffName:   text("staff_name"),
  description: text("description"),
  hours:       numeric("hours", { precision: 5, scale: 2 }),
  rate:        numeric("rate", { precision: 10, scale: 2 }),
  amount:      numeric("amount", { precision: 10, scale: 2 }),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ── Table: emails ──────────────────────────────────────────────────────────

export const emails = pgTable("emails", {
  id:         serial("id").primaryKey(),
  uid:        text("uid").notNull().unique(),
  sender:     text("sender"),
  subject:    text("subject"),
  bodyText:   text("body_text"),
  receivedAt: timestamp("received_at"),
  isRead:     boolean("is_read").notNull().default(false),
  tag:        text("tag"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
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

// ── Table: site_settings ───────────────────────────────────────────────────

export const siteSettings = pgTable("site_settings", {
  id:        serial("id").primaryKey(),
  section:   text("section").notNull(),
  key:       text("key").notNull().unique(),
  value:     text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
