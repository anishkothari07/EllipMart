import { prisma } from './client';
import { Prisma } from '@prisma/client';

export type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Helper to run transactions safely.
 */
export async function runInTransaction<T>(
  callback: (tx: PrismaTransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  return prisma.$transaction(callback as any, options);
}
