-- Clara's CareTeam — Neon Database Schema
-- Paste this entire file into Neon Dashboard > SQL Editor > Run

CREATE TYPE role AS ENUM (
  'CNA', 'LVN', 'HHA', 'PCA', 'RN', 'DON', 'Administrator', 'Other'
);

CREATE TYPE applicant_status AS ENUM (
  'applied', 'screened', 'interview_scheduled',
  'background_check', 'active', 'inactive', 'rejected'
);

CREATE TYPE request_status AS ENUM (
  'open', 'matched', 'active', 'closed', 'cancelled'
);

CREATE TYPE shift_type AS ENUM (
  'days', 'evenings', 'nights', 'weekends', 'live_in', 'flexible'
);

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
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_requests (
  id             SERIAL PRIMARY KEY,
  contact_name   TEXT NOT NULL,
  contact_email  TEXT NOT NULL,
  contact_phone  TEXT NOT NULL,
  facility_name  TEXT,
  address        TEXT,
  care_type      role NOT NULL,
  hours_per_week INTEGER,
  start_date     TEXT,
  shift_needed   shift_type[] NOT NULL DEFAULT '{}',
  special_needs  TEXT,
  status         request_status NOT NULL DEFAULT 'open',
  notes          TEXT,
  assigned_to    INTEGER REFERENCES applicants(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id               SERIAL PRIMARY KEY,
  applicant_id     INTEGER NOT NULL REFERENCES applicants(id),
  care_request_id  INTEGER NOT NULL REFERENCES care_requests(id),
  start_date       TEXT,
  end_date         TEXT,
  hours_per_week   INTEGER,
  rate             TEXT,
  notes            TEXT,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emails (
  id          SERIAL PRIMARY KEY,
  uid         TEXT UNIQUE NOT NULL,
  sender      TEXT NOT NULL,
  subject     TEXT,
  body_text   TEXT,
  received_at TIMESTAMPTZ,
  tag         TEXT DEFAULT 'general',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_subs (
  id         SERIAL PRIMARY KEY,
  chat_id    TEXT UNIQUE NOT NULL,
  label      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
