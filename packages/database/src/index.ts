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

// Error patterns that indicate a lost/exhausted database connection
const CONN_ERROR_PATTERNS = [
  "Can't reach database server",
  'ECONNREFUSED',
  'ECONNRESET',
  'Connection timed out',
  'Server has closed the connection',
  'closed the connection',
  'socket hang up',
  'pool timeout',
  'P1001',
  'P1002',
  'ETIMEDOUT',
];

function isConnectionError(err: unknown): boolean {
  const msg = (err as any)?.message ?? String(err ?? '');
  return CONN_ERROR_PATTERNS.some((p) => msg.toLowerCase().includes(p.toLowerCase()));
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    const client = getPrismaClient();
    const value = (client as any)[prop];

    // Wrap model objects (e.g. prisma.product, prisma.user) so model methods transparently retry on connection drop
    if (value && typeof value === 'object') {
      return new Proxy(value, {
        get(modelTarget, modelProp: string) {
          const modelVal = (modelTarget as any)[modelProp];
          if (typeof modelVal !== 'function') return modelVal;

          return (...args: any[]) => {
            const execute = () => {
              const freshClient = getPrismaClient();
              const freshModel = (freshClient as any)[prop];
              return (freshModel[modelProp] as Function).apply(freshModel, args);
            };

            try {
              const res = execute();
              if (res && typeof res.then === 'function') {
                return (res as Promise<any>).catch((err: unknown) => {
                  if (isConnectionError(err)) {
                    console.warn('[DB] Connection dropped — reconnecting and retrying query automatically...');
                    try { globalForPrisma.prisma?.$disconnect(); } catch {}
                    globalForPrisma.prisma = null;
                    return execute();
                  }
                  throw err;
                });
              }
              return res;
            } catch (err: unknown) {
              if (isConnectionError(err)) {
                console.warn('[DB] Connection dropped — reconnecting and retrying query automatically...');
                try { globalForPrisma.prisma?.$disconnect(); } catch {}
                globalForPrisma.prisma = null;
                return execute();
              }
              throw err;
            }
          };
        },
      });
    }

    if (typeof value !== 'function') return value;

    return (...args: any[]) => {
      const execute = () => {
        const freshClient = getPrismaClient();
        const freshFn = (freshClient as any)[prop];
        return freshFn.apply(freshClient, args);
      };

      try {
        const res = execute();
        if (res && typeof res.then === 'function') {
          return (res as Promise<any>).catch((err: unknown) => {
            if (isConnectionError(err)) {
              console.warn('[DB] Connection dropped — reconnecting and retrying transaction automatically...');
              try { globalForPrisma.prisma?.$disconnect(); } catch {}
              globalForPrisma.prisma = null;
              return execute();
            }
            throw err;
          });
        }
        return res;
      } catch (err: unknown) {
        if (isConnectionError(err)) {
          console.warn('[DB] Connection dropped — reconnecting and retrying transaction automatically...');
          try { globalForPrisma.prisma?.$disconnect(); } catch {}
          globalForPrisma.prisma = null;
          return execute();
        }
        throw err;
      }
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
