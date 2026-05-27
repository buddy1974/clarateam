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

// ── Table: care_recipients ──────────────────────────────�