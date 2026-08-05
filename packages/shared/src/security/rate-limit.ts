import { Redis } from '@upstash/redis'

// In-memory fallback
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const memoryRateLimits = new Map<string, RateLimitEntry>();

let redisClient: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.warn('[RateLimit] Failed to initialize Upstash Redis. Falling back to memory.');
}

/**
 * Enterprise-grade async rate limiter using Upstash Redis (with memory fallback).
 * Uses a simple sliding/fixed window approach.
 * 
 * @param key unique identifier (e.g., `login:192.168.1.1`)
 * @param limit max requests allowed in the window
 * @param windowMs window size in milliseconds
 * @returns { success: boolean, remaining: number, reset: number }
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Redis path
  if (redisClient) {
    try {
      const windowSeconds = Math.max(1, Math.floor(windowMs / 1000));
      // Atomic increment
      const count = await redisClient.incr(key);
      
      if (count === 1) {
        // Set expiry on first request
        await redisClient.expire(key, windowSeconds);
      } else {
        // Sometimes expiry gets lost if the script fails midway, ensure it exists
        const ttl = await redisClient.ttl(key);
        if (ttl === -1) {
          await redisClient.expire(key, windowSeconds);
        }
      }

      return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        reset: now + windowMs,
      };
    } catch (e) {
      console.error('[RateLimit] Redis error, falling back to memory:', e);
      // Fall through to memory
    }
  }

  // Memory fallback path
  const record = memoryRateLimits.get(key);

  if (!record) {
    memoryRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (now > record.resetAt) {
    memoryRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.resetAt };
}

/**
 * Periodically cleans up expired rate limits from memory to prevent leaks
 */
if (typeof window === 'undefined') {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryRateLimits.entries()) {
      if (now > record.resetAt) {
        memoryRateLimits.delete(key);
      }
    }
  }, 60000);
  
  if (cleanupInterval && typeof (cleanupInterval as any).unref === 'function') {
    (cleanupInterval as any).unref();
  }
}
