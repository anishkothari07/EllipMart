import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './order.service';
import { notificationService } from '../notification/notification.service';
import { inventoryService } from '../inventory/inventory.service';
import { NotFoundError, ForbiddenError, ValidationError } from '@corecart/shared';

const mockPrisma = (globalThis as any).mockPrisma;

describe('OrderService', () => {
  const orderId = 'order_abc';
  const userId = 'user_abc';
  const mockOrder = {
    id: orderId,
    orderNumber: 'ORD-123',
    userId,
    status: 'PENDING_PAYMENT',
    subTotal: 100,
    discountTotal: 0,
    taxTotal: 18,
    shippingTotal: 10,
    grandTotal: 128,
    user: { email: 'test@example.com', firstName: 'John' },
    items: [{ variantId: 'variant_123', quantity: 2 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(notificationService, 'emit');
    vi.spyOn(inventoryService, 'release');
    vi.spyOn(inventoryService, 'unsale');
  });

  it('should successfully create an order and emit notification', async () => {
    mockPrisma.order.create.mockResolvedValue(mockOrder);
    mockPrisma.orderTimeline.create.mockResolvedValue({ id: 'timeline_1' });

    const result = await orderService.createOrder({
      orderNumber: 'ORD-123',
      userId,
      items: [{ variantId: 'variant_123', quantity: 2, unitPrice: 50, totalPrice: 100 }],
      subTotal: 100,
      grandTotal: 128,
    });

    expect(result).toEqual(mockOrder);
    expect(mockPrisma.order.create).toHaveBeenCalled();
    expect(mockPrisma.orderTimeline.create).toHaveBeenCalled();
    expect(notificationService.emit).toHaveBeenCalledWith('OrderCreated', expect.any(Object));
  });

  it('should get order by ID for the authorized owner', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

    const result = await orderService.getOrderById(orderId, userId);
    expect(result).toEqual(mockOrder);
  });

  it('should throw NotFoundError if order does not exist', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);

    await expect(orderService.getOrderById('non_existent', userId)).rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError if unauthorized user requests order details', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

    await expect(orderService.getOrderById(orderId, 'other_user')).rejects.toThrow(ForbiddenError);
  });

  it('should successfully update order status and add timeline event', async () => {
    const updatedOrder = { ...mockOrder, status: 'CONFIRMED' };
    mockPrisma.order.update.mockResolvedValue(updatedOrder);

    const result = await orderService.updateOrderStatus(orderId, 'CONFIRMED', 'Payment verified', 'ADMIN');

    expect(result.status).toBe('CONFIRMED');
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
      include: { user: true },
    });
    expect(mockPrisma.orderTimeline.create).toHaveBeenCalledWith({
      data: {
        orderId,
        status: 'CONFIRMED',
        message: 'Payment verified',
        createdBy: 'ADMIN',
      },
    });
    expect(notificationService.emit).toHaveBeenCalledWith('OrderPaid', expect.any(Object));
  });

  // Regression: Order timeline generation
  it('should correctly record status timeline events during cancellation', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...mockOrder,
      status: 'PENDING_PAYMENT',
    });
    mockPrisma.order.update.mockResolvedValue({
      ...mockOrder,
      status: 'CANCELLED',
    });

    await orderService.cancelOrder(orderId, userId);

    expect(mockPrisma.orderTimeline.create).toHaveBeenCalledWith({
      data: {
        orderId,
        status: 'CANCELLED',
        message: 'Order cancelled by customer',
        createdBy: 'CUSTOMER',
      },
    });
  });

  it('should release inventory reservation if order is cancelled in PENDING_PAYMENT status', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...mockOrder,
      status: 'PENDING_PAYMENT',
    });
    mockPrisma.order.update.mockResolvedValue({
      ...mockOrder,
      status: 'CANCELLED',
    });

    await orderService.cancelOrder(orderId, userId);

    expect(inventoryService.release).toHaveBeenCalledWith(
      'variant_123',
      2,
      orderId,
      expect.any(String)
    );
  });

  it('should reverse the sale if order is cancelled after confirmation', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...mockOrder,
      status: 'CONFIRMED',
    });
    mockPrisma.order.update.mockResolvedValue({
      ...mockOrder,
      status: 'CANCELLED',
    });

    await orderService.cancelOrder(orderId, userId);

    expect(inventoryService.unsale).toHaveBeenCalledWith(
      'variant_123',
      2,
      orderId,
      expect.any(String)
    );
  });

  it('should throw ValidationError if order status cannot be cancelled', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...mockOrder,
      status: 'DELIVERED',
    });

    await expect(orderService.cancelOrder(orderId, userId)).rejects.toThrow(ValidationError);
  });
});
