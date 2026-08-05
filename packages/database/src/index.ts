import { inspect } from 'util';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: any };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required to initialize the database client.");
}

export const prisma = new Proxy({} as any, {
  get(target: any, prop: string) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return (globalForPrisma.prisma as any)[prop];
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = globalForPrisma.prisma;

export * from '@prisma/client';

