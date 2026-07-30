import { redisProvider } from '../cache/redis.provider';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

class RateLimiterService {
  private inMemoryMap = new Map<string, number[]>();

  public async checkLimit(
    identifier: string,
    limit: number,
    windowMs = 60000
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const client = redisProvider.getClient();

    if (client) {
      try {
        const key = `ratelimit:${identifier}`;
        const multi = client.multi();
        multi.zremrangebyscore(key, 0, windowStart);
        multi.zadd(key, now, `${now}-${Math.random()}`);
        multi.zcard(key);
        multi.expire(key, Math.ceil(windowMs / 1000));
        const results = await multi.exec();

        const count = results ? (results[2][1] as number) : 1;
        const success = count <= limit;
        const remaining = Math.max(0, limit - count);

        return {
          success,
          limit,
          remaining,
          resetMs: windowMs,
        };
      } catch (err) {
        // Fallback to in-memory rate limiter on Redis socket error
      }
    }

    // In-memory sliding window rate limiter fallback
    let timestamps = this.inMemoryMap.get(identifier) || [];
    timestamps = timestamps.filter((t) => t > windowStart);
    timestamps.push(now);
    this.inMemoryMap.set(identifier, timestamps);

    const count = timestamps.length;
    const success = count <= limit;
    const remaining = Math.max(0, limit - count);

    return {
      success,
      limit,
      remaining,
      resetMs: windowMs,
    };
  }
}

export const rateLimiterService = new RateLimiterService();
