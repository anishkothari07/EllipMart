import { PrismaClient } from '@prisma/client';

// ============================================================
// Resilient Prisma singleton for Railway MySQL (free tier)
//
// Railway's TCP proxy drops idle connections every ~10 min.
// This proxy wraps every async call: if it gets a "Can't reach
// database" error it nullifies the singleton so the NEXT call
// gets a fresh PrismaClient with a brand-new TCP socket.
// ============================================================

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required to initialize the database client.');
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    // Keep 'query' logging off in dev — it's very noisy and slows Turbopack
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url: databaseUrl! } },
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Railway-drop error signatures
const CONN_ERROR_PATTERNS = [
  "Can't reach database server",
  'ECONNREFUSED',
  'Connection timed out',
  'Server has closed the connection',
  'P1001', // Prisma: unreachable
  'P1002', // Prisma: timeout
  'ETIMEDOUT',
];

function isConnectionError(err: unknown): boolean {
  const msg = (err as any)?.message ?? '';
  return CONN_ERROR_PATTERNS.some((p) => msg.includes(p));
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    const client = getPrismaClient();
    const value = (client as any)[prop];

    if (typeof value !== 'function') return value;

    return (...args: any[]) => {
      const result: unknown = value.apply(client, args);

      // Only wrap thenables (async methods)
      if (result && typeof (result as any).then === 'function') {
        return (result as Promise<unknown>).catch((err: unknown) => {
          if (isConnectionError(err)) {
            console.warn(
              '[DB] Railway TCP connection lost — resetting Prisma singleton for next request.'
            );
            try {
              globalForPrisma.prisma?.$disconnect();
            } catch {}
            globalForPrisma.prisma = null;
          }
          throw err; // always re-throw so callers can handle / log
        });
      }

      return result;
    };
  },
});

export * from '@prisma/client';
