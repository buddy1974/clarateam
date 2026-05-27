# Clara's CareTeam — Claude Code Instructions

## Your job when opened in this repo

Run this single command to get everything ready:

```
git add -A
git commit -m "Fix: remove unused ts-expect-error in invoices route — restore build"
git push
```

That's it. Do not ask questions. Do not modify any files. Just install, commit all staged changes, and push.

## Env vars needed on Vercel (tell the user to add these)

After pushing, remind the user to add these in Vercel → Project Settings → Environment Variables:

- DATABASE_URL       — from neon.tech dashboard (Connection String)
- TELEGRAM_BOT_TOKEN — from @BotFather on Telegram
- TELEGRAM_CHAT_IDS  — comma-separated chat IDs (Jessica + Kevin)
- RESEND_API_KEY     — from resend.com
- IMAP_PASS          — password for info@claracareteam.com
- ADMIN_PIN          — PIN to access /admin (e.g. clara2025)
- ADMIN_SECRET       — any long random string (32+ chars)

## Project context

Next.js 14 App Router, Tailwind v4, Framer Motion, Neon + Drizzle ORM.
Admin dashboard lives at /admin (PIN protected).
Caregiver application form lives at /caregiving-opportunities.
All new submissions → Neon DB + Telegram notification + Resend confirmation email.
