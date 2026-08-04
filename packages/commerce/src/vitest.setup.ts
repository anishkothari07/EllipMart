process.env.DATABASE_URL = 'mysql://root:root@localhost:3306/test_db';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);

import { vi } from 'vitest';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  userSession: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  token: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  address: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  order: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  orderTimeline: {
    create: vi.fn(),
  },
  inventory: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    fields: {
      lowStockThreshold: 'lowStockThreshold',
    },
  },
  inventoryMovement: {
    create: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  wishlist: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  wishlistItem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  taxRule: {
    findMany: vi.fn(),
  },
  analyticsEvent: {
    create: vi.fn(),
  },
  analyticsSession: {
    upsert: vi.fn(),
  },
  analyticsPageView: {
    create: vi.fn(),
  },
  productVariant: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  checkoutSession: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  cart: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  cartItem: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    upsert: vi.fn(),
  },
  paymentMethod: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  paymentWebhook: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  media: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mediaMetadata: {
    findMany: vi.fn(),
  },
  assetMetadata: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  mediaFolder: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  mediaCollection: {
    findMany: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  shippingZone: {
    findMany: vi.fn(),
  },
  shippingRate: {
    findUnique: vi.fn(),
  },
  paymentProvider: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  notificationSetting: {
    findUnique: vi.fn(),
  },
  notificationTemplate: {
    findUnique: vi.fn().mockResolvedValue({ id: 'tmpl_1', subject: 'Test Subject', body: 'Test Body' }),
  },
  paymentAttempt: {
    create: vi.fn(),
  },
  refund: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  paymentEvent: {
    create: vi.fn(),
  },
  notification: {
    create: vi.fn().mockResolvedValue({ id: 'notif_123' }),
    update: vi.fn().mockResolvedValue({ id: 'notif_123' }),
  },
  notificationJob: {
    create: vi.fn().mockResolvedValue({ id: 'job_123' }),
    findUnique: vi.fn().mockResolvedValue({
      id: 'job_123',
      notification: {
        id: 'notif_123',
        recipientId: 'user_123',
        channel: 'EMAIL',
        subject: 'Test Subject',
        body: 'Test body',
        actions: [],
      },
    }),
    update: vi.fn().mockResolvedValue({ id: 'job_123' }),
  },
  notificationLog: {
    create: vi.fn(),
  },
  orderItem: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  aIConfiguration: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  aIPromptTemplate: {
    findUnique: vi.fn(),
  },
  aIConversation: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  aIMessage: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  mediaCollectionMapping: {
    createMany: vi.fn(),
  },
  mediaTag: {
    upsert: vi.fn(),
  },
  mediaTagMapping: {
    create: vi.fn(),
  },
  aIUsage: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async (cb) => {
    if (typeof cb === 'function') {
      return cb(mockPrisma);
    }
    if (Array.isArray(cb)) {
      return Promise.all(cb);
    }
    return Promise.resolve(cb);
  }),
};

vi.mock('@corecart/database', () => ({
  prisma: mockPrisma,
  Role: {
    CUSTOMER: 'CUSTOMER',
    MERCHANT: 'MERCHANT',
    ADMIN: 'ADMIN',
  },
  UserStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
  },
  OrderStatus: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  },
  ProductStatus: {
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT',
    ARCHIVED: 'ARCHIVED',
  },
  ProductVisibility: {
    PUBLIC: 'PUBLIC',
    HIDDEN: 'HIDDEN',
  },
}));

// Set global mocks reference
(globalThis as any).mockPrisma = mockPrisma;

vi.mock('razorpay', () => {
  return {
    default: class MockRazorpay {
      orders = {
        create: vi.fn().mockResolvedValue({ id: 'rzp_order_123', amount: 1000 }),
      };
      payments = {
        refund: vi.fn().mockResolvedValue({ id: 'rfnd_123', status: 'processed' }),
      };
    },
  };
});

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'msg_123' }),
    }),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn().mockImplementation((url) => {
  if (typeof url === 'string') {
    if (url.includes('cloudinary')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('{"secure_url": "https://res.cloudinary.com/mock-cloud/image/upload/mock-image.png", "public_id": "mock-image"}'),
        json: () => Promise.resolve({
          secure_url: 'https://res.cloudinary.com/mock-cloud/image/upload/mock-image.png',
          public_id: 'mock-image',
        }),
      });
    }
    if (url.includes('generativelanguage.googleapis.com')) {
      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '{"recommendations": ["prod_1", "prod_2"], "reason": "AI recommendation"}'
                }
              ]
            }
          }
        ],
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 200
        }
      };
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockGeminiResponse)),
        json: () => Promise.resolve(mockGeminiResponse),
      });
    }
  }
  return Promise.resolve({
    ok: true,
    text: () => Promise.resolve('{}'),
    json: () => Promise.resolve({}),
  });
});
globalThis.fetch = mockFetch;
