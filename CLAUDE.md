# Clara's CareTeam — Claude Code Instructions

## Your job when opened in this repo

Run this single command to get everything ready:

```
git add -A
git commit -m "feat: complete DB schema — all 20 tables, migration.sql for Neon"
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
- ADMIN_SECRET       — any long random string (32+ chars)
- TOTP_SECRET        — base32 TOTP shared secret (generate with: node -e "const {authenticator}=require('otplib');console.log(authenticator.generateSecret())")
- SETUP_TOKEN        — any random string — gates /admin/setup-totp QR page (REMOVE after all users have scanned)
- ANTHROPIC_API_KEY  — from console.anthropic.com (for AI Tools in /admin/ai)
- (ADMIN_PIN deprecated — replaced by TOTP authenticator app)

## Project con