# OPUS 4.8 REPO AUDIT REPORT — Clara's CareTeam (ClaraCare OS)

**Mode:** Read-only architect / security / debugger audit. No files were edited, created in-repo, committed, or pushed.
**Date:** 2026-05-29
**Repo:** `clarateam` — Next.js 14 App Router care-staffing platform + admin operations dashboard.

> Note: the project `CLAUDE.md` instructs an agent to immediately `git add -A && commit && push`. That instruction is **suspended** for this audit — and should not be run in the repo's current state (see Findings 1, 2, 11).

---

## 1. Executive Summary

The product is real and substantially built: a public marketing/lead-capture site for a DFW (Texas) residential home-care staffing agency, plus a large authenticated admin dashboard (clients, staff, care recipients, medications, shifts, invoices, alerts, reports, CMS, AI tools). The schema is mature (24 tables) and most admin API routes correctly enforce authentication.

**It is NOT production-ready.** Two **critical** issues make the admin panel trivially takeover-able by anyone on the internet:

1. **Real production TOTP (2FA) secrets are hardcoded in committed source** (`setup-totp/page.tsx` *and* `migration.sql`).
2. **`/admin/setup-totp` is unauthenticated and displays every user's QR enrollment code** whenever `SETUP_TOKEN` is set — it never checks that the visitor actually knows the token.

Either one alone grants full admin access. Both must be fixed and the secrets rotated before any production exposure. Beyond these, there is no rate limiting anywhere, the scheduled medication-overdue safety job is wired up incorrectly and never runs, and several quality/hygiene issues (build-error suppression, CRLF churn, competing migration files) should be cleaned up.

**Verdict: NOT PRODUCTION READY.**

---

## 2. Repo Map

**Stack:** Next.js 14 (App Router, `output: standalone`), TypeScript (strict), Tailwind v4, Framer Motion, Neon (Postgres) + Drizzle ORM, `jose` (JWT), `otplib` (TOTP), `qrcode`, Resend (email), `imapflow` (inbox sync), Telegram notifications. Package manager: npm (`package-lock.json`) with a stale `bun.lockb` also present. Deploy: Vercel.

Key paths:

- **Auth:** `src/middleware.ts` (gates `/admin/*` pages), `src/lib/admin-auth.ts` (JWT sign/verify, session helpers).
- **DB:** `src/db/index.ts` (Neon HTTP + Drizzle), `src/db/schema.ts` (24 tables), `migration.sql` (hand-written, 25 tables), `schema.sql` (stale, 6 tables), `drizzle.config.ts` (points to non-existent `src/db/migrations`).
- **Public API:** `src/app/api/apply`, `care-request`, `contact`, `cms/{faqs,settings,testimonials}`.
- **Admin API:** 33 routes under `src/app/api/admin/**` (CRUD + `login`, `me`, `users`, `ai`, `sync-inbox`, `alerts/overdue`, `search`).
- **Cron:** `src/app/api/cron/overdue-check/route.ts`.
- **Admin UI:** ~34 pages under `src/app/admin/**`; public marketing pages under `src/app/**`.
- **Libs:** `src/lib/{telegram,rate-limit}.ts`, `src/lib/ai/`, `src/lib/notifications/`.
- **Config:** `next.config.mjs`, `vercel.json`, `tsconfig.json`. No `.gitattributes`.

---

## 3. Main Product Flow

**Public lead capture (works, fragile):** Visitor → marketing page → form (`/caregiving-opportunities`, `/contact`, care request) → `POST /api/{apply,care-request,contact}` → Neon insert + Telegram notify + Resend confirmation email. Functional, but unauthenticated, unvalidated, unthrottled, and injects raw user input into HTML emails.

**Admin login (works):** `/admin/login` → `POST /api/admin/login` with `{handle, code}` → looks up `admin_users` by handle → verifies per-user TOTP via `otplib` → issues 7-day HS256 JWT cookie (`admin_token`, httpOnly). Middleware verifies the JWT on every `/admin/*` page.

**Admin operations (works):** Authenticated pages call `/api/admin/*`; nearly all routes re-check `getAdminSession()`/`isAdminAuthenticated()` server-side (good — middleware deliberately skips `/api/*`).

**Scheduled safety job (BROKEN):** `/api/cron/overdue-check` → fetches `/api/admin/alerts/overdue` with no auth cookie/secret → that route requires `isAdminAuthenticated()` → 401 → **no overdue-medication alerts are ever created.** Also, no `crons` are registered in `vercel.json`, so the cron never fires in the first place.

**TOTP enrollment (INSECURE):** `/admin/setup-totp` renders all users' QR codes from hardcoded secrets whenever `SETUP_TOKEN` is set — no possession check. See Finding 2.

---

## 4. Current Issue Diagnosis (working-tree state)

The working tree has 4 modified files (`CLAUDE.md`, `setup-totp/page.tsx`, `apply/route.ts`, `caregiving-opportunities/page.tsx`) showing **548 insertions / 548 deletions**. `git diff -w` (ignore whitespace) returns **empty** — every change is **pure CRLF↔LF line-ending churn**, zero real content change. Root cause: a Windows editor rewrote line endings and there is **no `.gitattributes`** to normalize them. Committing this (as `CLAUDE.md` instructs) would add ~1,100 lines of meaningless diff and obscure history.

Git log also shows a recent **revert** of "per-user setup-totp links with `?u=` param — Carter sees only her own QR card." That gating attempt was rolled back, which is why the setup page currently exposes **all** users' secrets again (Finding 2).

---

## 5. Security Findings

| Severity | Issue | File / Route | Risk | Fix |
|---|---|---|---|---|
| **Critical** | Real TOTP (2FA) secrets hardcoded in committed source | `src/app/admin/setup-totp/page.tsx` (L7–11) **and** `migration.sql` (L382–385) | Anyone with repo/history access (or who reads the served page) can generate valid codes and log in as any admin. Secrets are also in git history forever. | Remove secrets from source; load from DB only. **Rotate all three secrets.** Treat current secrets as fully compromised. Consider history purge (BFG/filter-repo). |
| **Critical** | `/admin/setup-totp` unauthenticated; shows every user's QR whenever `SETUP_TOKEN` is set | `setup-totp/page.tsx` (L22–38); whitelisted in `src/middleware.ts` | Page only checks `if (!SETUP_TOKEN) hide`. It never verifies the visitor *knows* the token. While enrollment is open, any internet visitor can enroll their own authenticator → full admin. | Require a secret match (`?token=` compared to `SETUP_TOKEN` via constant-time compare) AND scope to one user. Default-deny. Remove from middleware whitelist once gated. |
| **High** | Insecure hardcoded JWT signing-secret fallback | `src/lib/admin-auth.ts` (L9–11), `src/middleware.ts` (L7–9) — `?? "clarateam-admin-secret-change-me"` | If `ADMIN_SECRET` is unset/misconfigured, JWTs are signed with a publicly-known string → attacker forges valid `admin_token` cookies. | Remove the fallback. Throw at startup if `ADMIN_SECRET` is missing or <32 chars. |
| **High** | No rate limiting anywhere (login + public forms) | `api/admin/login`, `api/apply`, `api/care-request`, `api/contact` | TOTP brute force on login; spam floods that burn Resend quota, spam Telegram, and bloat the DB. `src/lib/rate-limit.ts` exists but is **wired into zero routes**. | Apply `rateLimit()` keyed by IP to login (e.g. 5/15min) and public forms (e.g. 3–5/min). For multi-instance correctness, back it with Upstash/Redis. |
| **Medium** | HTML/email injection via unescaped user input | `api/apply` (L40–49), `api/contact` (L19–34), `api/care-request` (L40–49) | `name`, `email`, `role`, `subject`, `message` are interpolated raw into HTML emails sent to staff and to the applicant from the agency domain → phishing/markup injection. | HTML-escape all user values before interpolation; validate `email` format; cap field lengths. |
| **Medium** | Mass assignment on PATCH (raw spread into `.set()`) | `api/admin/clients` (L43), `api/admin/drafts` (L202), `api/admin/invoices` (L189) — `.set(patch)` | Any authenticated admin can write arbitrary columns (e.g. timestamps, ids). Higher risk if the pattern spreads to role/identity tables. | Whitelist updatable fields per route (pick-list), or validate with a zod schema before `.set()`. |
| **Medium** | Cron endpoint becomes public if `CRON_SECRET` unset | `api/cron/overdue-check` (L17–20) — `if (cronSecret && authHeader !== ...)` | When the env var is missing the auth check is skipped entirely → anyone can trigger the job. | Default-deny: if `CRON_SECRET` is unset, reject. |
| **Low** | Weak documented defaults / deprecated PIN still present | `.env.local.example` (`ADMIN_PIN=clara2025`, `ADMIN_SECRET=change-me...`) | Encourages weak prod config; `ADMIN_PIN` is deprecated but still documented. | Remove `ADMIN_PIN`; mark `ADMIN_SECRET`/secrets as "generate, never reuse the example." |

---

## 6. Database / API / Env Findings

| Area | Finding | File / Route | Risk | Fix |
|---|---|---|---|---|
| Migrations | Three competing sources of truth: `schema.sql` (6 tables, **stale**), `migration.sql` (25 tables, authoritative), Drizzle `out: ./src/db/migrations` (**dir does not exist**, never generated) | `schema.sql`, `migration.sql`, `drizzle.config.ts` | Schema drift; unclear what's actually applied to Neon. | Delete `schema.sql`; adopt one workflow — either keep `migration.sql` as canonical and document it, or use `drizzle-kit generate` and commit generated migrations. |
| Seed data | `migration.sql` seeds `admin_users` with the same hardcoded TOTP secrets as the setup page | `migration.sql` L382–385 | Secret duplication; see Finding 1. | Seed without secrets, or generate per-user secrets at provisioning time. |
| Enum drift | `userRoleEnum` = `["operator","validator"]` is **unused**; real roles are free-text `"super_admin"`/`"administrator"` | `src/db/schema.ts` L53, L418 | Confusing/dead code; role typos won't be caught by the DB. | Remove the dead enum or convert `admin_users.role` to a real enum matching the values used in `login`/`users`/`me`. |
| Validation | Public POST routes parse `req.json()` with manual `if (!field)` checks only; `zod` is a dependency but unused on the edge | `api/apply`, `api/care-request`, `api/contact` | Malformed/oversized payloads reach DB and email layer. | Add zod schemas (email format, enum membership, max lengths) at each public route boundary. |
| Error handling | Inconsistent: public routes wrap in try/catch; several admin routes (e.g. `clients`, `users`) do not, so a DB error returns an unhandled 500 with a stack in logs | `api/admin/clients`, `api/admin/users`, etc. | Noisy 500s; potential info leak in logs. | Standardize a `try/catch` + typed error helper across API routes. |
| Env | `.env.local.example` documents `ADMIN_PIN` (deprecated) and lacks `ANTHROPIC_API_KEY`, `SETUP_TOKEN`, `VERCEL_URL` notes present in `CLAUDE.md` | `.env.local.example` vs `CLAUDE.md` | Onboarding confusion; missing vars cause silent 503s. | Reconcile the example file with the actual env vars consumed in code. |

---

## 7. UX / Product Findings

| Area | Finding | Impact | Fix |
|---|---|---|---|
| Mislabeled feature | `AIChatWidget` posts to `/api/contact` — it is a contact form, not an AI chat | Sets a false expectation ("AI") for visitors; no actual conversational AI on the public site | Rename to reflect behavior, or wire a genuinely gated AI endpoint. |
| Email trust | Applicant confirmation email is sent from the agency domain to an attacker-controllable address with reflected unescaped input | Brand/phishing risk | Escape inputs (Finding in §5) and consider double opt-in. |
| Loading/empty/error states | Not exhaustively verified in this read-only pass; admin pages do call real `/api/admin/*` endpoints (no mock/TODO markers found), which is a good sign | Low | Spot-check empty/error states per admin page during QA. |

---

## 8. Code Quality Findings

| Area | Finding | Risk | Fix Now or Later |
|---|---|---|---|
| Build safety | `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` | Type/lint regressions ship silently to prod | **Now** — at minimum run `tsc --noEmit` + `eslint` in CI as a blocking gate. |
| Line endings | No `.gitattributes`; working tree is 1,096 lines of pure CRLF/LF churn | History pollution; noisy diffs/reviews | **Now** — add `.gitattributes` (`* text=auto eol=lf`), renormalize, discard the churn. |
| Repeated auth boilerplate | Every admin route repeats the `getAdminSession()`/`isAdminAuthenticated()` guard inline | Easy to forget on a new route → silent unprotected endpoint | Later — extract a `requireAdmin()` / `requireRole()` wrapper. |
| Dual lockfiles | Both `bun.lockb` and `package-lock.json` present | Ambiguous install path between machines/CI | Later — pick one (npm per `package-lock.json`) and delete the other. |
| Auto-commit instruction | `CLAUDE.md` tells an agent to `git add -A && commit && push` with no review | Would commit secrets + EOL churn unreviewed | **Now** — remove/neuter that instruction. |

---

## 9. AI-Generated / Low-Quality Code Smell Report

| Smell | Evidence | Risk | Fix Now or Later |
|---|---|---|---|
| Security added "visually," not enforced | `setup-totp` gates on "is `SETUP_TOKEN` set" rather than "does caller know it" | Production blocker | Now |
| Secrets committed to source | TOTP secrets in `setup-totp/page.tsx` + `migration.sql` | Production blocker | Now |
| Helper written but not wired | `rate-limit.ts` exists, used in 0 routes | Should fix before launch | Now |
| Endpoint that looks complete but no-ops | `cron/overdue-check` → `alerts/overdue` 401s; no `vercel.json` crons | Should fix before launch (safety feature) | Now |
| Competing artifacts for one concern | `schema.sql` vs `migration.sql` vs empty Drizzle migrations dir | Should clean later | Later |
| Dead config | unused `userRoleEnum`; deprecated `ADMIN_PIN` still documented | Harmless–cleanup | Later |
| Inconsistent patterns across similar code | two different cron auth schemes (`Bearer` vs `x-cron-secret`); mixed try/catch coverage | Should clean later | Later |
| Mislabeled feature | "AIChatWidget" is a contact form | Harmless–cosmetic | Later |

---

## 10. Deployment Readiness

**NOT PRODUCTION READY.** Blocking: exposed/committed TOTP secrets (rotate + remove) and the open `/admin/setup-totp` enrollment page. Both yield full admin takeover. Secondary launch blockers: no rate limiting, broken overdue-medication cron (a patient-safety feature in a care app), and email-injection on public forms. Build-error suppression means CI is the only thing standing between a type error and production — and no blocking CI gate was found.

---

## 11. Prioritized Fix Plan for Coding Agent

> Execute top-down. Items P0/P1 block production.

**P0-1 — Stop exposing TOTP secrets.**
- File `src/app/admin/setup-totp/page.tsx`: delete the hardcoded `USERS` array (L7–11). Fetch the active user's `displayName`/`totpSecret` from `admin_users` at request time instead.
- File `migration.sql` L382–385: remove literal secrets from the seed; provision secrets at deploy time (script that generates `authenticator.generateSecret()` per user and inserts).
- **Rotate** all three secrets in Neon now; old ones are compromised.
- Validation: `grep -rn "2UCCHCUJ\|OG2ZDER\|K6QF6IV" .` returns nothing; existing users can still log in with re-enrolled codes.

**P0-2 — Gate `/admin/setup-totp` with possession + scope.**
- File `src/app/admin/setup-totp/page.tsx` (server component): read `searchParams.token`; if `token !== process.env.SETUP_TOKEN` → render "not available" (constant-time compare). Scope output to a single `?u=<handle>` user, not all users (re-apply the reverted design, fixing whatever broke it).
- File `src/middleware.ts`: after gating, you may keep the whitelist, but the page must self-enforce.
- Validation: visiting `/admin/setup-totp` with no/incorrect token shows nothing; correct token shows only the requested user.

**P1-1 — Remove insecure JWT fallback.**
- Files `src/lib/admin-auth.ts` L9–11 and `src/middleware.ts` L7–9: remove `?? "clarateam-admin-secret-change-me"`. Add a startup assertion that `ADMIN_SECRET` exists and is ≥32 chars; throw otherwise.
- Validation: app refuses to boot without `ADMIN_SECRET`; existing valid sessions still verify.

**P1-2 — Wire rate limiting.**
- Use `src/lib/rate-limit.ts` in `api/admin/login` (5 / 15 min per IP) and `api/{apply,care-request,contact}` (e.g. 5 / min per IP). Return 429 when blocked. Note in code that the in-memory store is per-instance; flag Upstash/Redis as the multi-instance upgrade.
- Validation: 6th rapid login attempt from one IP returns 429.

**P1-3 — Fix the overdue-medication cron.**
- File `src/app/api/cron/overdue-check/route.ts`: instead of fetching `/api/admin/alerts/overdue` without auth, either (a) call the detection logic directly (extract it into a shared lib function both routes import), or (b) forward a `CRON_SECRET` that `alerts/overdue` is taught to accept (mirror the `sync-inbox` `x-cron-secret` pattern — pick ONE scheme and use it everywhere).
- File `src/app/api/admin/alerts/overdue/route.ts`: accept the cron secret path in addition to `isAdminAuthenticated()`.
- File `vercel.json`: add a `crons` entry (e.g. `*/30 * * * *` → `/api/cron/overdue-check`).
- File `cron/overdue-check` L17–20: default-deny when `CRON_SECRET` is unset.
- Validation: manual `POST /api/cron/overdue-check` with the secret creates expected `alerts` rows; without it returns 401.

**P2-1 — Escape + validate public form input.**
- Files `api/apply`, `api/care-request`, `api/contact`: add zod schemas (email format, enum role/careType, max lengths) and HTML-escape every interpolated value in Resend `html`.
- Validation: a payload with `<script>`/`<a>` in `name` arrives escaped in the email; oversized/invalid payloads return 400.

**P2-2 — Lock down PATCH mass assignment.**
- Files `api/admin/{clients,drafts,invoices}`: replace `.set(patch)` with an explicit allow-list (or zod-validated object).

**P3 — Hygiene.**
- Add `.gitattributes` (`* text=auto`, `*.ts text eol=lf`, etc.); renormalize; discard the current CRLF-only working-tree changes (do NOT commit them).
- Remove `next.config.mjs` `ignoreBuildErrors`/`ignoreDuringBuilds`, or add a blocking CI step running `tsc --noEmit` + `eslint`.
- Delete stale `schema.sql`; pick one migration workflow.
- Remove dead `userRoleEnum` / deprecated `ADMIN_PIN`; reconcile `.env.local.example` with code.
- Remove the auto-commit instruction from `CLAUDE.md`.
- Delete one of the two lockfiles (`bun.lockb` vs `package-lock.json`).

---

## 12. Validation Checklist

```bash
# Secrets fully removed from working tree
grep -rn "2UCCHCUJ\|OG2ZDER\|K6QF6IV\|clarateam-admin-secret-change-me" . ; echo "expect: no matches"

# Build / type / lint integrity (after removing ignore flags)
npm run typecheck   # or: npx tsc --noEmit
npm run lint
npm run build

# Line-ending hygiene
git diff -w --stat   # expect: empty (no real changes) before fixes; clean after .gitattributes renormalize

# Auth boundary spot-checks (manual, against a running instance)
#  - GET  /admin/setup-totp  (no token)        -> "not available"
#  - GET  /admin/setup-totp?token=WRONG        -> "not available"
#  - POST /api/admin/clients (no cookie)       -> 401
#  - 6x rapid POST /api/admin/login (one IP)   -> 429 on the 6th
#  - POST /api/cron/overdue-check (no secret)  -> 401
#  - POST /api/cron/overdue-check (with secret)-> creates alerts rows
#  - POST /api/contact with <script> in name   -> escaped in delivered email
```

---

## 13. Questions for Project Owner

- **BLOCKER QUESTION 1:** Has `/admin/setup-totp` ever been deployed publicly with `SETUP_TOKEN` set? If yes, assume the three TOTP secrets are compromised and rotate immediately (they are also in git history regardless).
- **BLOCKER QUESTION 2:** Which migration workflow is authoritative going forward — hand-maintained `migration.sql`, or Drizzle-generated migrations? The fix for schema drift depends on this choice.
- **NON-BLOCKING CLARIFICATION:** Is the overdue-medication alerting expected to be live for clients now (patient-safety relevant), or is it a future feature? This sets the priority of P1-3.

---

## 14. Final Approval Gate

**NOT PRODUCTION READY**

Resolve P0-1, P0-2, P1-1 (admin-takeover vectors) and rotate the TOTP secrets before any internet-facing deployment. Re-audit after P0/P1 fixes; P2/P3 can follow in a fast-follow hardening pass.
