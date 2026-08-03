import { NextRequest } from 'next/server';
import { apiHandler } from '@corecart/shared/src/middlewares/apiHandler';
import { successResponse, errorResponse } from '@corecart/shared';
import { prisma } from '@corecart/database';
import { redisProvider } from '@corecart/shared/src/cache/redis.provider';
import { cacheService } from '@corecart/shared/src/cache/cache.service';
import { queueService } from '@corecart/shared/src/queue/queue.service';
import os from 'os';

async function healthCheckHandler(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type'); // "ready" | "live" | null

  const dbStart = Date.now();
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  let dbLatencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  const redisStatus = await redisProvider.ping();
  const memory = process.memoryUsage();
  const queueMetrics = queueService.getMetrics();
  const cacheStats = cacheService.getStats();

  const isHealthy = dbStatus === 'connected';

  if (type === 'ready') {
    if (isHealthy) {
      return successResponse({ ready: true, status: 'ok' });
    } else {
      return errorResponse('Service not ready: Database disconnected', 'SERVICE_UNAVAILABLE', null, 503);
    }
  }

  if (type === 'live') {
    return successResponse({ live: true, status: 'ok', uptime: process.uptime() });
  }

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    version: '1.4.0-sprint12',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    redis: redisStatus,
    cache: cacheStats,
    queues: queueMetrics,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      },
    },
  };

  if (!isHealthy) {
    return errorResponse('Service not healthy', 'SERVICE_UNAVAILABLE', healthData, 503);
  }
  return successResponse(healthData, 'Service is healthy');
}

export const GET = apiHandler(healthCheckHandler);
