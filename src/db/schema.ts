import {
  pgTable, text, timestamp, pgEnum, serial, integer, boolean,
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

// ── Table: clients ─────────────────────────────────────────────────────────
// Facilities and families (CRM)

export const clients = pgTable("clients", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  type:         text("type").notNull().default("facility"),  // facility | family
  contactName:  text("contact_name"),
  email:        text("email"),
  phone:        text("phone"),
  address:      text("address"),
  notes:        text("notes"),
  referredBy:   text("referred_by"),        // e.g. "Kevin Dean"
  active:       boolean("active").notNull().default(true),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
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

// ── Table: telegram_subs ───────────────────────────────────────────────────
// Chat IDs that receive notifications

export const telegramSubs = pgTable("telegram_subs", {
  id:        serial("id").primaryKey(),
  chatId:    text("chat_id").unique().notNull(),
  label:     text("label"),    // "Jessica" | "Kevin" | "Group"
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
