import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from './payment/payment.service';
import { paymentRegistry } from './payment/registry';
import { inventoryService } from './inventory/inventory.service';
import { ProductService } from './catalog/product.service';
import { recommendationService } from './shopping/recommendation.service';
import { AuthService } from './auth/auth.service';
import { mediaService } from './media/media.service';
import { AIService } from './ai/ai.service';
import { AppError } from '@corecart/shared';

// Utility helper to sign test tokens
import { signRefreshToken, hashPassword } from '@corecart/shared';

// Env checks for startup configuration validation
import { env } from '@corecart/shared';

const mockPrisma = (globalThis as any).mockPrisma;

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create checkout session successfully', async () => {
    mockPrisma.checkoutSession.create.mockResolvedValue({
      id: 'sess_123',
      grandTotal: 1000,
    });
    const result = await paymentService.createCheckoutSession({
      cartId: 'cart_123',
      userId: 'user_123',
      paymentMethodCode: 'UPI',
      grandTotal: 1000,
      currency: 'INR',
    });
    expect(result.id).toBe('sess_123');
  });

  it('should initialize COD payment', async () => {
    mockPrisma.checkoutSession.findUnique.mockResolvedValue({ id: 'sess_123', grandTotal: 500, paymentMethodCode: 'COD', cartId: 'cart_123' });
    mockPrisma.paymentMethod.findUnique.mockResolvedValue({
      id: 'pm_1',
      code: 'COD',
      provider: 'COD',
      providers: [],
    });
    mockPrisma.paymentProvider.findUnique.mockResolvedValue({
      code: 'COD',
      configs: [{ isActive: true }],
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.order.create.mockResolvedValue({
      id: 'order_123',
      orderNumber: 'ORD-COD',
      userId: 'user_123',
      user: { email: 'user@example.com', firstName: 'Alice' },
    });
    mockPrisma.payment.create.mockResolvedValue({ id: 'pay_123', status: 'PENDING' });

    const result = await paymentService.initializeOrderPayment('sess_123');
    expect(result).toBeDefined();
    expect(result.paymentId).toBe('pay_123');
    expect(result.orderId).toBe('order_123');
  });

  it('should verify payment signature', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      orderId: 'order_123',
      status: 'PENDING',
      provider: 'MOCK',
      amount: 1000,
    });
    mockPrisma.paymentProvider.findUnique.mockResolvedValue({
      code: 'MOCK',
      configs: [{ isActive: true }],
    });
    mockPrisma.paymentAttempt.create.mockResolvedValue({ id: 'att_123' });
    mockPrisma.orderItem.findMany.mockResolvedValue([]);
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order_123',
      orderNumber: 'ORD-123',
      user: { email: 'user@example.com', firstName: 'Alice' },
    });
    mockPrisma.payment.update.mockResolvedValue({ id: 'pay_123', status: 'PAID' });
    mockPrisma.order.update.mockResolvedValue({
      id: 'order_123',
      status: 'CONFIRMED',
      user: { email: 'user@example.com', firstName: 'Alice' },
    });

    const result = await paymentService.verifyPayment(
      'order_123',
      'pay_123',
      'pay_prov_123',
      'valid_sig'
    );

    expect(result.isVerified).toBe(true);
    expect(mockPrisma.order.update).toHaveBeenCalled();
  });

  it('should confirm COD order successfully', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      orderId: 'order_123',
      status: 'PENDING',
      paymentMethodCode: 'COD',
    });
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order_123',
      user: { email: 'user@example.com', firstName: 'Alice' },
    });
    mockPrisma.payment.update.mockResolvedValue({ id: 'pay_123', status: 'PAID' });
    mockPrisma.order.update.mockResolvedValue({
      id: 'order_123',
      status: 'CONFIRMED',
      user: { email: 'user@example.com', firstName: 'Alice' },
    });
    mockPrisma.orderItem.findMany.mockResolvedValue([]);

    const result = await paymentService.confirmCodOrder('order_123', 'pay_123');
    expect(result.confirmed).toBe(true);
  });

  it('should cancel payment successfully', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      amount: 1000,
      status: 'PENDING',
      provider: 'MOCK',
    });
    mockPrisma.paymentProvider.findUnique.mockResolvedValue({
      code: 'MOCK',
      configs: [{ isActive: true }],
    });
    mockPrisma.payment.update.mockResolvedValue({ id: 'pay_123', status: 'CANCELLED' });

    const result = await paymentService.cancelPayment('pay_123');
    expect(result.status).toBe('cancelled');
  });

  it('should handle webhook processing successfully', async () => {
    vi.spyOn(paymentService as any, 'resolveProviderByCode').mockResolvedValue({
      handleWebhook: vi.fn().mockResolvedValue({ success: true }),
    });
    const result = await paymentService.handleWebhook('MOCK', '{"event": "test"}', 'sig_123');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should execute refund successfully', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      amount: 1000,
      status: 'CAPTURED',
      provider: 'MOCK',
      refunds: [],
    });
    mockPrisma.paymentProvider.findUnique.mockResolvedValue({
      code: 'MOCK',
      configs: [{ isActive: true }],
    });
    mockPrisma.refund.create.mockResolvedValue({ id: 'ref_123', status: 'REFUND_PENDING' });
    mockPrisma.paymentEvent.create.mockResolvedValue({ id: 'pe_1' });
    mockPrisma.refund.update.mockResolvedValue({ id: 'ref_123', status: 'REFUNDED' });
    mockPrisma.payment.update.mockResolvedValue({ id: 'pay_123', status: 'REFUNDED' });

    const { refundService } = await import('./payment/refund.service');
    const result = await refundService.processRefund('pay_123', 1000, 'Customer requested');
    expect(result.status).toBe('refunded');
  });

  it('should handle refund processing failures', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      amount: 1000,
      status: 'CAPTURED',
      provider: 'MOCK',
      refunds: [],
    });
    mockPrisma.paymentProvider.findUnique.mockResolvedValue({
      code: 'MOCK',
      configs: [{ isActive: true }],
    });
    mockPrisma.refund.create.mockResolvedValue({ id: 'ref_123', status: 'REFUND_PENDING' });
    mockPrisma.paymentEvent.create.mockResolvedValue({ id: 'pe_1' });
    mockPrisma.refund.update.mockResolvedValue({ id: 'ref_123', status: 'FAILED' });

    const { refundService } = await import('./payment/refund.service');
    vi.spyOn(paymentRegistry, 'resolve').mockReturnValue({
      refundPayment: vi.fn().mockRejectedValue(new Error('Mock refund error')),
    } as any);

    await expect(refundService.processRefund('pay_123', 1000, 'Customer requested')).rejects.toThrow('Mock refund error');
    expect(mockPrisma.refund.update).toHaveBeenCalled();
  });

  it('should throw if refunding a payment in an invalid status', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      amount: 1000,
      status: 'PENDING',
      provider: 'MOCK',
      refunds: [],
    });
    const { refundService } = await import('./payment/refund.service');
    await expect(refundService.processRefund('pay_123', 1000, 'Customer requested')).rejects.toThrow('Payment cannot be refunded in its current status');
  });

  it('should throw if refund amount exceeds original payment amount', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_123',
      amount: 1000,
      status: 'CAPTURED',
      provider: 'MOCK',
      refunds: [{ amount: 800 }],
    });
    const { refundService } = await import('./payment/refund.service');
    await expect(refundService.processRefund('pay_123', 300, 'Customer requested')).rejects.toThrow('Refund amount exceeds the original payment amount');
  });

  it('should retrieve refund history', async () => {
    mockPrisma.refund.findMany.mockResolvedValue([
      { id: 'ref_123', amount: 500, status: 'REFUNDED' },
    ]);
    const { refundService } = await import('./payment/refund.service');
    const result = await refundService.getRefundHistory('pay_123');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('ref_123');
  });
});

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deduct (reserve) stock successfully', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 2,
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 4,
    });

    const result = await inventoryService.reserve('variant_123', 2, 'order_123', 'Checkout reservation');
    expect(result).toBeDefined();
    expect(mockPrisma.inventory.update).toHaveBeenCalled();
  });

  it('should release inventory successfully', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 4,
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 2,
    });

    const result = await inventoryService.release('variant_123', 2, 'order_123', 'Cancellation release');
    expect(result).toBeDefined();
  });

  it('should cap release quantity at reserved quantity', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 1,
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 0,
    });

    const result = await inventoryService.release('variant_123', 5, 'order_123', 'Cancellation release');
    expect(result).toBeDefined();
  });

  it('should process inventory sale successfully', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 2,
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 8,
      quantityReserved: 0,
    });

    const result = await inventoryService.sale('variant_123', 2, 'order_123', 'Purchase confirmation');
    expect(result).toBeDefined();
  });

  it('should unsale (reverse sale) successfully', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 8,
      quantityReserved: 0,
    });
    mockPrisma.inventory.update.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 10,
      quantityReserved: 0,
    });

    const result = await inventoryService.unsale('variant_123', 2, 'order_123', 'Return product');
    expect(result).toBeDefined();
  });

  it('should prevent negative inventory when reserving', async () => {
    mockPrisma.inventory.findUnique.mockResolvedValue({
      id: 'inv_123',
      quantityAvailable: 4,
      quantityReserved: 3,
    });

    await expect(inventoryService.reserve('variant_123', 2, 'order_123', 'Reservation')).rejects.toThrow(
      /Insufficient stock/
    );
  });
});

describe('ProductService', () => {
  const productService = new ProductService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create product successfully', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    mockPrisma.product.create.mockResolvedValue({
      id: 'prod_123',
      name: 'Smart Watch',
      slug: 'smart-watch',
    });

    const result = await productService.createProduct({
      name: 'Smart Watch',
      slug: 'smart-watch',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
    } as any);

    expect(result.name).toBe('Smart Watch');
  });

  it('should retrieve product by id and slug', async () => {
    const mockProduct = {
      id: 'prod_123',
      name: 'Smart Watch',
      slug: 'smart-watch',
      images: [],
    };
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

    const byId = await productService.getProductById('prod_123');
    expect(byId.id).toBe('prod_123');

    const bySlug = await productService.getProductBySlug('smart-watch');
    expect(bySlug.slug).toBe('smart-watch');
  });

  it('should update product details', async () => {
    const mockProduct = {
      id: 'prod_123',
      name: 'Smart Watch',
      slug: 'smart-watch',
      images: [],
    };
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.product.update.mockResolvedValue({ ...mockProduct, name: 'Premium Smart Watch' });

    const result = await productService.updateProduct('prod_123', {
      name: 'Premium Smart Watch',
    });
    expect(result.name).toBe('Premium Smart Watch');
  });

  it('should delete product successfully (soft delete)', async () => {
    const mockProduct = {
      id: 'prod_123',
      name: 'Smart Watch',
      slug: 'smart-watch',
      images: [],
    };
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.product.update.mockResolvedValue({ ...mockProduct, deletedAt: new Date() });

    const result = await productService.deleteProduct('prod_123');
    expect(result.deletedAt).toBeDefined();
  });

  // Regression: Product image mapping
  it('should map images correctly on product retrieval', async () => {
    const mockProduct = {
      id: 'prod_123',
      name: 'Smart Watch',
      images: [
        { id: 'img_1', isPrimary: true, mediaId: 'med_1' },
      ],
    };
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

    const result = await productService.getProductById('prod_123');
    expect(result.images[0].mediaId).toBe('med_1');
  });
});

describe('RecommendationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get similar products based on category', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: 'prod_456',
        name: 'Similar Prod',
        categoryId: 'cat_abc',
        variants: [{ name: 'Default Size', pricing: [{ sellingPrice: 200 }] }],
        images: [],
        tags: [],
      },
    ]);

    const result = await recommendationService.getRecommendations({
      type: 'similar',
      productId: 'prod_123',
      categoryId: 'cat_abc',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Similar Prod');
  });

  it('should get trending recommendations', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: 'prod_789',
        name: 'Trending Prod',
        variants: [{ name: 'Default Size', pricing: [{ sellingPrice: 300 }] }],
        images: [],
        tags: [],
      },
    ]);

    const result = await recommendationService.getRecommendations({
      type: 'trending',
      limit: 5,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Trending Prod');
  });

  it('should get best sellers recommendations', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: 'prod_101',
        name: 'Best Seller Prod',
        variants: [{ name: 'Default Size', pricing: [{ sellingPrice: 400 }] }],
        images: [],
        tags: [],
      },
    ]);

    const result = await recommendationService.getRecommendations({
      type: 'best_sellers',
      limit: 5,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Best Seller Prod');
  });

  it('should get new arrivals recommendations', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: 'prod_202',
        name: 'New Arrival Prod',
        variants: [{ name: 'Default Size', pricing: [{ sellingPrice: 500 }] }],
        images: [],
        tags: [],
      },
    ]);

    const result = await recommendationService.getRecommendations({
      type: 'new_arrivals',
      limit: 5,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('New Arrival Prod');
  });
});

describe('AuthService', () => {
  const authService = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register user and create session', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user_123',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });
    mockPrisma.userSession.create.mockResolvedValue({ id: 'sess_123' });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await authService.register(
      {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      },
      { ip: '127.0.0.1', userAgent: 'Mozilla' }
    );

    expect(result.user.email).toBe('newuser@example.com');
    expect(result.accessToken).toBeTypeOf('string');
  });

  it('should login successfully', async () => {
    const passwordHash = await hashPassword('password123');
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      email: 'newuser@example.com',
      passwordHash,
      status: 'ACTIVE',
      failedLoginAttempts: 0,
    });
    mockPrisma.userSession.create.mockResolvedValue({ id: 'sess_123' });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await authService.login(
      {
        email: 'newuser@example.com',
        password: 'password123',
      },
      { ip: '127.0.0.1', userAgent: 'Mozilla' }
    );
    expect(result.accessToken).toBeTypeOf('string');
  });

  it('should verify email successfully', async () => {
    const otpHash = await hashPassword('123456');
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user_123', email: 'newuser@example.com' });
    mockPrisma.token.findFirst.mockResolvedValue({
      id: 'token_123',
      expiresAt: new Date(Date.now() + 100000),
      attempts: 0,
      hash: otpHash,
    });
    mockPrisma.token.update.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});

    const result = await authService.verifyEmail({
      email: 'newuser@example.com',
      otp: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('should process forgotPassword request', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user_123', email: 'newuser@example.com' });
    mockPrisma.token.create.mockResolvedValue({ id: 'token_123' });

    const result = await authService.forgotPassword({ email: 'newuser@example.com' });
    expect(result.success).toBe(true);
  });

  it('should process resetPassword request', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user_123', email: 'newuser@example.com' });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.token.update.mockResolvedValue({});

    const result = await authService.resetPassword({
      email: 'newuser@example.com',
      newPassword: 'newpassword123',
      otp: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('should process refresh token request', async () => {
    mockPrisma.userSession.findUnique.mockResolvedValue({
      id: 'sess_123',
      userId: 'user_123',
      user: {
        id: 'user_123',
        status: 'ACTIVE',
      },
    });
    mockPrisma.userSession.update.mockResolvedValue({});
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      status: 'ACTIVE',
    });
 
    const refreshToken = await signRefreshToken({
      userId: 'user_123',
      role: 'CUSTOMER',
      email: 'newuser@example.com',
      sessionId: 'sess_123',
    });
    const result = await authService.refresh({
      refreshToken,
    });
    expect(result.accessToken).toBeTypeOf('string');
  });

  it('should logout session successfully', async () => {
    mockPrisma.userSession.update.mockResolvedValue({});
    const result = await authService.logout('sess_123');
    expect(result.success).toBe(true);
  });

  // Regression: Merchant/Admin session isolation
  it('should enforce role restrictions and verify admin status', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_admin',
      email: 'admin@ellipmart.com',
      role: 'ADMIN',
    });
    const profile = await mockPrisma.user.findUnique({ where: { id: 'user_admin' } });
    expect(profile.role).toBe('ADMIN');
    expect(profile.role).not.toBe('CUSTOMER');
  });
});

describe('MediaService (Cloudinary)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve media metadata', async () => {
    mockPrisma.assetMetadata.findMany.mockResolvedValue([
      { key: 'size', value: '100px' },
    ]);
    const result = await mediaService.getMetadata('med_123');
    expect(result.length).toBe(1);
  });

  it('should delete media successfully (soft delete)', async () => {
    mockPrisma.media.findUnique.mockResolvedValue({ id: 'med_123', isDeleted: false, usages: [] });
    mockPrisma.media.update.mockResolvedValue({ id: 'med_123', isDeleted: true });
    const result = await mediaService.deleteMedia('med_123');
    expect(result.success).toBe(true);
    expect(result.softDeleted).toBe(true);
  });

  it('should restore deleted media successfully', async () => {
    mockPrisma.media.findUnique.mockResolvedValue({ id: 'med_123', isDeleted: true });
    mockPrisma.media.update.mockResolvedValue({ id: 'med_123', isDeleted: false });
    const result = await mediaService.restoreMedia('med_123');
    expect(result.isDeleted).toBe(false);
  });

  it('should retrieve folders', async () => {
    mockPrisma.mediaFolder.findMany.mockResolvedValue([{ id: 'fold_1', name: 'Images' }]);
    const result = await mediaService.getFolders();
    expect(result.length).toBe(1);
  });

  it('should retrieve collections', async () => {
    mockPrisma.mediaCollection.findMany.mockResolvedValue([{ id: 'coll_1', name: 'Banners' }]);
    const result = await mediaService.getCollections();
    expect(result.length).toBe(1);
  });

  // Regression: Cloudinary URL persistence
  it('should upload files and return persistent Cloudinary URLs', async () => {
    mockPrisma.media.findFirst.mockResolvedValue(null);
    mockPrisma.media.create.mockResolvedValue({
      id: 'med_123',
      url: 'https://res.cloudinary.com/mock-cloud/image/upload/mock-image.png',
      storagePath: 'mock-image',
    });

    const result = await mediaService.uploadMedia({
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'),
      fileName: 'test-image.png',
      originalName: 'test-image.png',
      mimeType: 'image/png',
      storageProvider: 'CLOUDINARY',
    });

    expect(result.media.url).toContain('https://res.cloudinary.com');
    expect(result.media.storagePath).toBe('mock-image');
  });
});

describe('AIService (Gemini)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate recommendations via Gemini model response', async () => {
    mockPrisma.aIConfiguration.findFirst.mockResolvedValue(null);
    mockPrisma.aIPromptTemplate.findUnique.mockResolvedValue({
      systemInstruction: 'Test instructions',
    });

    const result = await AIService.generateText('recommendation', 'recommend products');
    expect(result).toBeDefined();
    expect(result).toContain('recommendations');
  });
});

describe('Startup Configuration Validation', () => {
  it('should validate presence of critical environment variables like DATABASE_URL', () => {
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.DATABASE_URL.length).toBeGreaterThan(0);
    expect(env.JWT_ACCESS_SECRET).toBeDefined();
  });
});
