import { logger } from '@/lib/observability/logger';

export interface RedisStatus {
  status: 'connected' | 'disconnected' | 'disabled';
  host?: string;
  port?: number;
  error?: string;
  latencyMs?: number;
}

class RedisProvider {
  private isConnected = false;
  private client: any = null;
  private connectionError: string | null = null;
  private host: string;
  private port: number;

  constructor() {
    this.host = process.env.REDIS_HOST || '127.0.0.1';
    this.port = parseInt(process.env.REDIS_PORT || '6379', 10);
    this.init();
  }

  private init() {
    if (!process.env.REDIS_ENABLED && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
      this.connectionError = 'Redis environment variables not configured';
      return;
    }

    try {
      // Lazy load ioredis if available
      const Redis = require('ioredis');
      const redisUrl = process.env.REDIS_URL || `redis://${this.host}:${this.port}`;
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 2000,
        retryStrategy: () => null, // Do not loop endlessly if connection fails
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.connectionError = null;
      });

      this.client.on('error', (err: any) => {
        this.isConnected = false;
        this.connectionError = err.message || 'Redis connection error';
      });
    } catch (e: any) {
      this.isConnected = false;
      this.connectionError = e.message || 'ioredis module not available';
    }
  }

  public async ping(): Promise<RedisStatus> {
    if (!this.client || !this.isConnected) {
      return {
        status: this.connectionError?.includes('not configured') ? 'disabled' : 'disconnected',
        host: this.host,
        port: this.port,
        error: this.connectionError || 'Redis client not initialized',
      };
    }

    const start = Date.now();
    try {
      await this.client.ping();
      const latencyMs = Date.now() - start;
      return {
        status: 'connected',
        host: this.host,
        port: this.port,
        latencyMs,
      };
    } catch (err: any) {
      this.isConnected = false;
      this.connectionError = err.message;
      return {
        status: 'disconnected',
        host: this.host,
        port: this.port,
        error: err.message,
      };
    }
  }

  public isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  public getClient(): any {
    return this.isAvailable() ? this.client : null;
  }
}

export const redisProvider = new RedisProvider();
