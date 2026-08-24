import { PrismaClient } from '@prisma/client';

// ============================================================
// Resilient Prisma singleton for Supabase PostgreSQL
//
// Supports connection pooling via Supavisor / PgBouncer.
// The proxy wraps every async call: on connection drop errors it
// resets the singleton so the next request gets a fresh client.
// ============================================================

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required.');
    }
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Error patterns that indicate a lost/exhausted connection
const CONN_ERROR_PATTERNS = [
  "Can't reach database server",
  'ECONNREFUSED',
  'Connection timed out',
  'Server has closed the connection',
  'pool timeout',
  'P1001',
  'P1002',
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

      if (result && typeof (result as any).then === 'function') {
        return (result as Promise<unknown>).catch((err: unknown) => {
          if (isConnectionError(err)) {
            console.warn('[DB] Connection error — resetting Prisma singleton for next request.');
            try { globalForPrisma.prisma?.$disconnect(); } catch {}
            globalForPrisma.prisma = null;
          }
          throw err;
        });
      }

      return result;
    };
  },
});

// Explicit re-exports from @prisma/client to avoid Turbopack's
// "unexpected export *" warning which causes repeated re-compilation.
export type {
  Prisma,
  User,
  Product,
  ProductVariant,
  ProductImage,
  ProductSeo,
  ProductTag,
  ProductVariantAttribute,
  ProductCollection,
  Inventory,
  Order,
  OrderItem,
  OrderStatusHistory,
  Address,
  Cart,
  CartItem,
  Category,
  Brand,
  Collection,
  Media,
  MediaFolder,
  Notification,
  Review,
  Coupon,
  CouponUsage,
  RefundRequest,
  SellerProfile,
  Session,
  AuditLog,
  Festival,
  ProductPrice,
} from '@prisma/client';

// Runtime enum exports (cannot use 'export type' for these)
export {
  PrismaClient,
  Role,
  OrderStatus,
  UserStatus,
  ProductStatus,
  PaymentStatus,
  NotificationStatus,
} from '@prisma/client';
