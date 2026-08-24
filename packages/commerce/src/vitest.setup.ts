process.env.DATABASE_URL = 'mysql://root:root@localhost:3306/test_db';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);
process.env.GEMINI_API_KEY = 'test-gemini-key-123';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-service-key';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-supabase-anon-key';
process.env.SUPABASE_STORAGE_BUCKET = 'test-bucket';
process.env.STORAGE_PROVIDER = 'SUPABASE';

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
  // ── User / Auth ────────────────────────────────────────────────────────────
  Role: { CUSTOMER: 'CUSTOMER', SELLER: 'SELLER', ADMIN: 'ADMIN', MERCHANT: 'MERCHANT' },
  UserStatus: {
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    BLOCKED: 'BLOCKED',
    DELETED: 'DELETED',
  },
  Gender: { MALE: 'MALE', FEMALE: 'FEMALE', OTHER: 'OTHER', PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY' },
  AuthProvider: { LOCAL: 'LOCAL', GOOGLE: 'GOOGLE', APPLE: 'APPLE', GITHUB: 'GITHUB', MICROSOFT: 'MICROSOFT', FACEBOOK: 'FACEBOOK' },
  TokenType: { EMAIL_VERIFICATION: 'EMAIL_VERIFICATION', PASSWORD_RESET: 'PASSWORD_RESET', LOGIN_OTP: 'LOGIN_OTP' },
  AddressType: { HOME: 'HOME', OFFICE: 'OFFICE', OTHER: 'OTHER' },
  // ── Product / Catalog ──────────────────────────────────────────────────────
  ProductStatus: { DRAFT: 'DRAFT', ACTIVE: 'ACTIVE', ARCHIVED: 'ARCHIVED', OUT_OF_STOCK: 'OUT_OF_STOCK', DISCONTINUED: 'DISCONTINUED' },
  ProductVisibility: { PUBLIC: 'PUBLIC', HIDDEN: 'HIDDEN', SCHEDULED: 'SCHEDULED' },
  // ── Orders ────────────────────────────────────────────────────────────────
  OrderStatus: {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    PACKED: 'PACKED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    RETURNED: 'RETURNED',
    REFUNDED: 'REFUNDED',
    // Legacy aliases kept for backward compat with old specs
    PENDING: 'PENDING_PAYMENT',
  },
  // ── Payments ──────────────────────────────────────────────────────────────
  PaymentStatus: {
    PENDING: 'PENDING',
    AUTHORIZED: 'AUTHORIZED',
    CAPTURED: 'CAPTURED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
    REFUND_PENDING: 'REFUND_PENDING',
    REFUNDED: 'REFUNDED',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  },
  PaymentMethodType: { UPI: 'UPI', CARD: 'CARD', NETBANKING: 'NETBANKING', WALLET: 'WALLET', COD: 'COD', GIFT_CARD: 'GIFT_CARD' },
  PaymentEventStatus: {
    CREATED: 'CREATED',
    AUTHORIZED: 'AUTHORIZED',
    FAILED: 'FAILED',
    SUCCESS: 'SUCCESS',
    REFUND_STARTED: 'REFUND_STARTED',
    REFUNDED: 'REFUNDED',
    WEBHOOK_RECEIVED: 'WEBHOOK_RECEIVED',
  },
  // ── Wallet / Loyalty ──────────────────────────────────────────────────────
  HoldStatus: { PENDING: 'PENDING', FINALIZED: 'FINALIZED', RELEASED: 'RELEASED' },
  WalletTxType: { TOPUP: 'TOPUP', PURCHASE: 'PURCHASE', REFUND: 'REFUND', ADJUSTMENT: 'ADJUSTMENT' },
  LoyaltyTxType: { EARN: 'EARN', REDEEM: 'REDEEM', ADJUSTMENT: 'ADJUSTMENT', WELCOME_BONUS: 'WELCOME_BONUS', REFERRAL: 'REFERRAL' },
  ReferralStatus: { PENDING_FIRST_ORDER: 'PENDING_FIRST_ORDER', COMPLETED: 'COMPLETED', EXPIRED: 'EXPIRED' },
  // ── Media ─────────────────────────────────────────────────────────────────
  MediaVisibility: { PUBLIC: 'PUBLIC', PRIVATE: 'PRIVATE', MERCHANT_ONLY: 'MERCHANT_ONLY', SYSTEM: 'SYSTEM' },
  MediaStatus: { ACTIVE: 'ACTIVE', ARCHIVED: 'ARCHIVED', PROCESSING: 'PROCESSING' },
  AssetType: {
    IMAGE: 'IMAGE', VIDEO: 'VIDEO', AUDIO: 'AUDIO', PDF: 'PDF', DOCUMENT: 'DOCUMENT',
    MODEL_3D: 'MODEL_3D', FONT: 'FONT', SVG: 'SVG', LOTTIE: 'LOTTIE', ICON: 'ICON',
    AI_ASSET: 'AI_ASSET', OTHER: 'OTHER',
  },
  // ── Notifications ─────────────────────────────────────────────────────────
  NotificationChannel: { EMAIL: 'EMAIL', PUSH: 'PUSH', SMS: 'SMS', IN_APP: 'IN_APP' },
  NotificationCategory: {
    ORDER: 'ORDER', PAYMENT: 'PAYMENT', ACCOUNT: 'ACCOUNT', PROMOTION: 'PROMOTION',
    SYSTEM: 'SYSTEM', SECURITY: 'SECURITY',
  },
  NotificationStatus: { PENDING: 'PENDING', SENT: 'SENT', FAILED: 'FAILED', READ: 'READ' },
  NotificationPriority: { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' },
  // ── Analytics ─────────────────────────────────────────────────────────────
  AnalyticsEventType: {
    PAGE_VIEW: 'PAGE_VIEW', PRODUCT_VIEW: 'PRODUCT_VIEW', ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART', PURCHASE: 'PURCHASE', SEARCH: 'SEARCH',
    CLICK: 'CLICK', IMPRESSION: 'IMPRESSION',
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
    if (url.includes('supabase.co')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('{"Key": "media/mock-image.png"}'),
        json: () => Promise.resolve({ Key: "media/mock-image.png" }),
      });
    }
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
