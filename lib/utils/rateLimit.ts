interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true; // Allowed
  }

  if (now > record.resetAt) {
    // Window expired, reset
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  // Increment
  record.count += 1;
  return true; // Allowed
}

/**
 * Cleans up expired rate limits periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimits.entries()) {
    if (now > record.resetAt) {
      rateLimits.delete(key);
    }
  }
}, 60000).unref(); // Run every minute, don't keep process alive
