export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'secure',
    features: {
      rateLimiting: 'enabled',
      botProtection: 'enabled',
      waf: 'enabled',
      csrf: 'enabled',
      xssSanitization: 'enabled',
      fileUploadLimits: 'enabled',
      accountLockout: 'enabled',
      cspNonce: 'enabled',
    },
    timestamp: new Date().toISOString(),
  });
}

