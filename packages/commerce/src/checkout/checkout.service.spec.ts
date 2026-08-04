import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutService } from './checkout.service';
import { cartService } from '../cart/cart.service';
import { couponService } from '../coupon/coupon.service';
import { shippingService, ShippingCalculator } from '../shipping/shipping.service';
import { paymentService } from '../payment/payment.service';
import { AppError } from '@corecart/shared';

// We get mockPrisma from global context defined in setup
const mockPrisma = (globalThis as any).mockPrisma;

describe('CheckoutService', () => {
  const userId = 'user_abc';
  const cartMock = {
    id: 'cart_123',
    items: [
      {
        id: 'item_1',
        variantId: 'variant_1',
        quantity: 2,
        variant: {
          id: 'variant_1',
          name: 'Premium Tee',
          productId: 'prod_1',
          pricing: { sellingPrice: 500 },
        },
      },
    ],
  };

  const addressMock = {
    id: 'addr_123',
    userId,
    country: 'IN',
    state: 'KA',
    city: 'Bengaluru',
  };

  const inputMock = {
    addressId: 'addr_123',
    paymentMethodCode: 'UPI',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(cartService, 'getCart').mockResolvedValue({ id: 'cart_123', items: [] });
    vi.spyOn(cartService, 'clearCart').mockResolvedValue(undefined as any);
    vi.spyOn(couponService, 'validateAndApply').mockResolvedValue(null);
    vi.spyOn(shippingService, 'getRateById').mockResolvedValue({ id: 'mock', cost: 0, zone: { provider: { name: 'Standard' } } } as any);
    vi.spyOn(ShippingCalculator, 'calculate').mockImplementation((subtotal, rate) => (rate as any).cost || 0);
    vi.spyOn(paymentService, 'createCheckoutSession').mockResolvedValue({ id: 'cart_123', grandTotal: 1000 } as any);
    vi.spyOn(paymentService, 'initializeOrderPayment').mockResolvedValue({ orderId: 'order_123', paymentId: 'pay_123' } as any);
    vi.spyOn(paymentService, 'confirmCodOrder').mockResolvedValue({} as any);
  });

  it('should checkout successfully', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue({
      id: 'mock',
      cost: 50,
      zone: { provider: { name: 'Standard' } },
    });

    paymentService.createCheckoutSession.mockResolvedValue({
      id: 'cart_123',
      grandTotal: 1050,
    });

    mockPrisma.order.findUnique = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'order_123',
        orderNumber: 'ORD-123456',
      });

    paymentService.initializeOrderPayment.mockResolvedValue({
      orderId: 'order_123',
      paymentId: 'pay_123',
      providerOrderId: 'rzp_order_123',
      clientSecret: 'secret_123',
    });

    const result = await checkoutService.processCheckout(userId, inputMock);

    expect(result).toBeDefined();
    expect(result.orderId).toBe('order_123');
    expect(result.orderNumber).toBe('ORD-123456');
    expect(cartService.clearCart).toHaveBeenCalledWith(userId);
  });

  it('should throw an error if the cart is empty', async () => {
    cartService.getCart.mockResolvedValue({ id: 'cart_empty', items: [] });

    await expect(checkoutService.processCheckout(userId, inputMock)).rejects.toThrow(
      new AppError('Cart is empty', 400)
    );
  });

  it('should throw an error for insufficient stock', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 1, quantityReserved: 0 }, // Only 1 available, cart needs 2
    });

    await expect(checkoutService.processCheckout(userId, inputMock)).rejects.toThrow(
      /Insufficient stock/
    );
  });

  it('should throw an error for invalid shipping address', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(null);

    await expect(checkoutService.processCheckout(userId, inputMock)).rejects.toThrow(
      new AppError('Invalid shipping address', 400)
    );
  });

  // Regression: COD order flow
  it('should confirm order directly without online payment step if payment method is COD', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue({
      id: 'mock',
      cost: 50,
      zone: { provider: { name: 'Standard' } },
    });

    paymentService.createCheckoutSession.mockResolvedValue({
      id: 'cart_123',
      grandTotal: 1050,
    });
    
    mockPrisma.order.findUnique = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'order_123',
        orderNumber: 'ORD-COD-123',
      });

    paymentService.initializeOrderPayment.mockResolvedValue({
      orderId: 'order_123',
      paymentId: 'pay_123',
    });

    const codInput = { ...inputMock, paymentMethodCode: 'COD' };
    const result = await checkoutService.processCheckout(userId, codInput);

    expect(result.orderNumber).toBe('ORD-COD-123');
    expect(paymentService.confirmCodOrder).toHaveBeenCalledWith('order_123', 'pay_123');
  });

  // Regression: Duplicate checkout (double-click) / Idempotency
  it('should return existing order details on duplicate checkout request to prevent multiple order creation', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue({
      id: 'mock',
      cost: 50,
      zone: { provider: { name: 'Standard' } },
    });

    paymentService.createCheckoutSession.mockResolvedValue({
      id: 'cart_123',
      grandTotal: 1050,
    });

    // Simulate database returning an existing order matching the checkoutSessionId
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order_existing',
      orderNumber: 'ORD-EXISTING',
      payment: {
        id: 'pay_existing',
        providerOrderId: 'rzp_existing',
      },
    });

    const result = await checkoutService.processCheckout(userId, inputMock);

    expect(result.orderId).toBe('order_existing');
    expect(result.orderNumber).toBe('ORD-EXISTING');
    // Ensure we did NOT initialize payment again or clear cart again since it's already done
    expect(paymentService.initializeOrderPayment).not.toHaveBeenCalled();
  });

  it('should handle unique key conflict on checkout session creation in CheckoutService', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue({
      id: 'mock',
      cost: 50,
      zone: { provider: { name: 'Standard' } },
    });

    const error = new Error('Unique constraint');
    (error as any).code = 'P2002';
    paymentService.createCheckoutSession.mockRejectedValueOnce(error);

    mockPrisma.checkoutSession.findUnique.mockResolvedValue({
      id: 'cart_123',
      grandTotal: 1050,
    });

    mockPrisma.order.findUnique.mockResolvedValue(null);

    const result = await checkoutService.processCheckout(userId, inputMock);
    expect(result).toBeDefined();
  });

  it('should checkout successfully with a coupon applied', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue({
      id: 'mock',
      cost: 50,
      zone: { provider: { name: 'Standard' } },
    });

    couponService.validateAndApply.mockResolvedValue({
      discountAmount: 100,
      coupon: { code: 'SAVE10' },
    } as any);

    mockPrisma.order.findUnique.mockResolvedValue(null);

    const result = await checkoutService.processCheckout(userId, { ...inputMock, couponCode: 'SAVE10' });
    expect(result).toBeDefined();
    expect(couponService.validateAndApply).toHaveBeenCalled();
  });

  it('should checkout successfully with a shippingRateId provided', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue({
      id: 'rate_123',
      cost: 50,
      zone: { provider: { name: 'Standard' } },
    });

    mockPrisma.order.findUnique.mockResolvedValue(null);

    const result = await checkoutService.processCheckout(userId, { ...inputMock, shippingRateId: 'rate_123' });
    expect(result).toBeDefined();
    expect(shippingService.getRateById).toHaveBeenCalledWith('rate_123');
  });

  it('should throw if an invalid shippingRateId is selected', async () => {
    cartService.getCart.mockResolvedValue(cartMock);
    mockPrisma.productVariant.findUnique = vi.fn().mockResolvedValue({
      id: 'variant_1',
      name: 'Premium Tee',
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
    });
    mockPrisma.address.findUnique = vi.fn().mockResolvedValue(addressMock);
    shippingService.getRateById.mockResolvedValue(null);

    await expect(
      checkoutService.processCheckout(userId, { ...inputMock, shippingRateId: 'rate_invalid' })
    ).rejects.toThrow('Invalid shipping rate selected');
  });
});
