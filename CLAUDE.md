# Clara's CareTeam — Claude Code Instructions

## Your job when opened in this repo

Read this file and review the codebase before making any changes.
Do NOT auto-commit or auto-push. Always confirm with Marcel before running git commands.

## Env vars needed on Vercel

Vercel → Project Settings → Environment Variables:

- DATABASE_URL        — from neon.tech dashboard (Connection String)
- TELEGRAM_BOT_TOKEN  — from @BotFather on Telegram
- TELEGRAM_CHAT_IDS   — comma-separated chat IDs (Jessica + Kevin)
- RESEND_API_KEY      — from resend.com
- IMAP_PASS           — password for info@claracareteam.com
- ADMIN_SECRET        — random string, MINIMUM 32 chars (app will refuse to start without it)
- SETUP_TOKEN         — random string — gates /admin/setup-totp QR page (REMOVE after all users have scanned)
- CRON_SECRET         — random string — authenticates Vercel cron → /api/cron/overdue-check
- ANTHROPIC_API_KEY   — from console.anthropic.com (for AI Tools in /admin/ai)
- (TOTP_SECRET deprecated — replaced by per-user secrets in admin_users table)
- (ADMIN_PIN deprecated — replaced by TOTP authenticator app)

## Project context

Next.js 14 App Router, Tailwind v4, Framer Motion, Neon + Drizzle ORM.
Admin dashboard lives at /admin (TOTP + JWT protected, multi-user RBAC).
Caregiver application form lives at /caregiving-opportunities.
All new submissions → Neon DB + Telegram notification + Resend confirmation email.
Overdue medication cron runs every 30 min via vercel.json → /api/cron/overdue-check (needs CRON_SECRET).
