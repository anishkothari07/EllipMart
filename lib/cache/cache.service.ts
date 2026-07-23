import { redisProvider } from './redis.provider';

export interface CacheStats {
  provider: 'redis' | 'memory';
  hits: number;
  misses: number;
  hitRatio: number;
  keysCount: number;
}

class CacheService {
  private memoryCache = new Map<string, { value: any; expiresAt: number; tags?: string[] }>();
  private hits = 0;
  private misses = 0;

  public async get<T>(key: string): Promise<T | null> {
    const client = redisProvider.getClient();
    if (client) {
      try {
        const data = await client.get(key);
        if (data) {
          this.hits++;
          return JSON.parse(data) as T;
        }
      } catch (err) {
        // Fall back to memory cache on Redis error
      }
    }

    // In-memory fallback
    const entry = this.memoryCache.get(key);
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        this.hits++;
        return entry.value as T;
      }
      this.memoryCache.delete(key);
    }

    this.misses++;
    return null;
  }

  public async set<T>(key: string, value: T, ttlSeconds = 300, tags: string[] = []): Promise<void> {
    const client = redisProvider.getClient();
    const serialized = JSON.stringify(value);

    if (client) {
      try {
        await client.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback to memory cache
      }
    }

    // Memory cache fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
    });
  }

  public async del(key: string): Promise<void> {
    const client = redisProvider.getClient();
    if (client) {
      try {
        await client.del(key);
      } catch (err) {}
    }
    this.memoryCache.delete(key);
  }

  public async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fn();
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  public getStats(): CacheStats {
    const isRedis = redisProvider.isAvailable();
    const total = this.hits + this.misses;
    const hitRatio = total > 0 ? Math.round((this.hits / total) * 100) / 100 : 0;

    return {
      provider: isRedis ? 'redis' : 'memory',
      hits: this.hits,
      misses: this.misses,
      hitRatio,
      keysCount: this.memoryCache.size,
    };
  }
}

export const cacheService = new CacheService();
