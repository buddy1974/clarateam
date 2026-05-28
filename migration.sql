-- Clara's CareTeam — full DB migration
-- Run this once in Neon SQL Editor (neon.tech → your project → SQL Editor)
-- Safe to run on a fresh database. Existing tables are skipped via IF NOT EXISTS.

-- ── Enums ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE role AS ENUM ('CNA','LVN','HHA','PCA','RN','DON','Administrator','Other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE applicant_status AS ENUM ('applied','screened','interview_scheduled','background_check','active','inactive','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('open','matched','active','closed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shift_type AS ENUM ('days','evenings','nights','weekends','live_in','flexible');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE staff_status AS ENUM ('active','inactive','on_leave','terminated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE care_level AS ENUM ('companion','personal','skilled','memory','hospice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shift_status AS ENUM ('scheduled','confirmed','completed','cancelled','missed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE med_log_status AS ENUM ('given','missed','refused','held');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft','sent','paid','overdue','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE draft_type AS ENUM ('intake','medication','report','care_plan','incident','shift_note');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE draft_status AS ENUM ('draft','pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_status AS ENUM ('read','unread');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('operator','validator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS applicants (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  role           role NOT NULL,
  availability   shift_type[] NOT NULL DEFAULT '{}',
  experience     TEXT,
  certifications TEXT,
  message        TEXT,
  resume_url     TEXT,
  status         applicant_status NOT NULL DEFAULT 'applied',
  notes          TEXT,
  source         TEXT DEFAULT 'website',
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id                     SERIAL PRIMARY KEY,
  applicant_id           INTEGER REFERENCES applicants(id),
  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  phone                  TEXT NOT NULL,
  role                   role NOT NULL,
  status                 staff_status NOT NULL DEFAULT 'active',
  hourly_rate            NUMERIC(10,2),
  start_date             TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  certifications         TEXT[] NOT NULL DEFAULT '{}',
  skills                 TEXT[] NOT NULL DEFAULT '{}',
  notes                  TEXT,
  created_at             TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'facility',
  contact_name TEXT,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  notes        TEXT,
  referred_by  TEXT,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_plans (
  id               SERIAL PRIMARY KEY,
  care_recipient_id INTEGER,
  notes            TEXT,
  conditions       TEXT,
  allergies        TEXT,
  diet_type        TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_recipients (
  id                     SERIAL PRIMARY KEY,
  client_id              INTEGER REFERENCES clients(id),
  name                   TEXT NOT NULL,
  date_of_birth          TEXT,
  address                TEXT,
  care_level             care_level,
  care_needs             TEXT,
  risk_flags             TEXT[] NOT NULL DEFAULT '{}',
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  notes                  TEXT,
  created_at             TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_requests (
  id            SERIAL PRIMARY KEY,
  contact_name  TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  facility_name TEXT,
  address       TEXT,
  care_type     TEXT,
  hours_per_week INTEGER,
  start_date    TEXT,
  shift_needed  shift_type[] NOT NULL DEFAULT '{}',
  special_needs TEXT,
  status        request_status NOT NULL DEFAULT 'open',
  notes         TEXT,
  assigned_to   INTEGER REFERENCES applicants(id),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id              SERIAL PRIMARY KEY,
  applicant_id    INTEGER REFERENCES applicants(id),
  care_request_id INTEGER REFERENCES care_requests(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shifts (
  id          SERIAL PRIMARY KEY,
  staff_id    INTEGER REFERENCES staff(id),
  recipient_id INTEGER REFERENCES care_recipients(id),
  client_id   INTEGER REFERENCES clients(id),
  shift_date  TEXT NOT NULL,
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL,
  hours       NUMERIC(5,2),
  status      shift_status NOT NULL DEFAULT 'scheduled',
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
  id          SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES care_recipients(id),
  name        TEXT NOT NULL,
  dosage      TEXT NOT NULL,
  frequency   TEXT NOT NULL,
  route       TEXT NOT NULL DEFAULT 'oral',
  times       TEXT[] NOT NULL DEFAULT '{}',
  prescriber  TEXT,
  start_date  TEXT,
  end_date    TEXT,
  notes       TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_logs (
  id              SERIAL PRIMARY KEY,
  medication_id   INTEGER REFERENCES medications(id),
  staff_id        INTEGER REFERENCES staff(id),
  shift_id        INTEGER REFERENCES shifts(id),
  scheduled_time  TEXT NOT NULL,
  log_date        TEXT NOT NULL,
  status          med_log_status NOT NULL DEFAULT 'given',
  administered_at TIMESTAMP,
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_tasks (
  id               SERIAL PRIMARY KEY,
  care_recipient_id INTEGER REFERENCES care_recipients(id),
  title            TEXT NOT NULL,
  description      TEXT,
  frequency        TEXT NOT NULL DEFAULT 'daily',
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_logs (
  id               SERIAL PRIMARY KEY,
  task_id          INTEGER REFERENCES care_tasks(id),
  care_recipient_id INTEGER REFERENCES care_recipients(id),
  staff_id         INTEGER REFERENCES staff(id),
  shift_id         INTEGER REFERENCES shifts(id),
  status           TEXT NOT NULL DEFAULT 'done',
  notes            TEXT,
  log_date         TEXT NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diet_plans (
  id               SERIAL PRIMARY KEY,
  care_recipient_id INTEGER REFERENCES care_recipients(id),
  diet_type        TEXT,
  restrictions     TEXT,
  notes            TEXT,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id               SERIAL PRIMARY KEY,
  type             TEXT NOT NULL,
  severity         TEXT NOT NULL DEFAULT 'medium',
  care_recipient_id INTEGER REFERENCES care_recipients(id),
  shift_id         INTEGER REFERENCES shifts(id),
  message          TEXT,
  resolved         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drafts (
  id               SERIAL PRIMARY KEY,
  type             draft_type NOT NULL,
  raw_data         TEXT NOT NULL DEFAULT '{}',
  ai_data          TEXT NOT NULL DEFAULT '{}',
  related_entity_id INTEGER,
  created_by       TEXT NOT NULL,
  status           draft_status NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           SERIAL PRIMARY KEY,
  entity_type  TEXT NOT NULL,
  entity_id    INTEGER,
  action       TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  meta         TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id               SERIAL PRIMARY KEY,
  type             TEXT NOT NULL,
  care_recipient_id INTEGER REFERENCES care_recipients(id),
  period_from      TEXT NOT NULL,
  period_to        TEXT NOT NULL,
  content          TEXT,
  ai_summary       TEXT,
  created_by       TEXT NOT NULL DEFAULT 'admin',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     notif_status NOT NULL DEFAULT 'unread',
  related_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER REFERENCES clients(id),
  invoice_no  TEXT NOT NULL,
  period_from TEXT NOT NULL,
  period_to   TEXT NOT NULL,
  subtotal    NUMERIC(10,2),
  tax_rate    NUMERIC(5,4),
  tax_amount  NUMERIC(10,2),
  total       NUMERIC(10,2),
  due_date    TEXT,
  notes       TEXT,
  status      invoice_status NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id          SERIAL PRIMARY KEY,
  invoice_id  INTEGER REFERENCES invoices(id),
  shift_id    INTEGER REFERENCES shifts(id),
  staff_name  TEXT,
  description TEXT,
  hours       NUMERIC(5,2),
  rate        NUMERIC(10,2),
  amount      NUMERIC(10,2),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emails (
  id          SERIAL PRIMARY KEY,
  uid         TEXT NOT NULL UNIQUE,
  sender      TEXT,
  subject     TEXT,
  body_text   TEXT,
  received_at TIMESTAMP,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  tag         TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id         SERIAL PRIMARY KEY,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT,
  quote      TEXT NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id         SERIAL PRIMARY KEY,
  section    TEXT NOT NULL,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
