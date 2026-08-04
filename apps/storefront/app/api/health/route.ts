import { NextResponse } from 'next/server';
import { prisma } from '@corecart/database';

export async function GET() {
  const health: Record<string, any> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: 'unknown',
      cloudinary: 'unknown',
    },
  };

  try {
    // 1. Database Health Check
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'healthy';
  } catch (error: any) {
    health.status = 'degraded';
    health.checks.database = `unhealthy: ${error.message}`;
  }

  // 2. Cloudinary Configuration Check
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    health.checks.cloudinary = 'configured';
  } else {
    health.checks.cloudinary = 'missing_credentials';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
