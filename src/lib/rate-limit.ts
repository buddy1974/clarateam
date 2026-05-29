/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Resets per Vercel serverless instance — good enough to block burst spam.
 * For production-scale limiting, swap for Upstash Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number;  // time window in ms
  max:      number;  // max requests per window per key
}

export function rateLimit(key: string, opts: RateLimitOptions): { allowed: boolean; remaining: number } {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, opts.max - entry.count);

  if (entry.count > opts.max) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}
