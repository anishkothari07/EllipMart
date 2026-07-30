import { prisma } from '@corecart/database';
import { OrderStatus } from '@prisma/client';
import { notificationService } from '../notification/notification.service';
import { AppError } from '@corecart/shared';

export const orderService = {
  async createOrder(data: any) {
    const order = await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        subTotal: data.subTotal,
        discountTotal: data.discountTotal,
        taxTotal: data.taxTotal,
        shippingTotal: data.shippingTotal,
        grandTotal: data.grandTotal,
        status: data.status || OrderStatus.PENDING_PAYMENT,

        // Address Snapshots
        shippingName: data.shippingName,
        shippingPhone: data.shippingPhone,
        shippingEmail: data.shippingEmail,
        shippingStreet: data.shippingStreet,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingCountry: data.shippingCountry,
        shippingPostalCode: data.shippingPostalCode,
        billingAddr: data.billingAddr,

        // Coupon Snapshot
        couponCode: data.couponCode,
        discountType: data.discountType,
        discountValue: data.discountValue,
        couponDiscount: data.couponDiscount,

        // Shipping Snapshot
        shippingProvider: data.shippingProvider,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        shippingCost: data.shippingCost,

        // Payment is now managed separately through Payment model

        items: {
          create: data.items.map((item: any) => ({
            variantId: item.variantId,
            productName: item.productName,
            brandName: item.brandName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: { items: true, user: true }
    });

    await this.addTimelineEvent(order.id, order.status, 'Order created successfully', 'SYSTEM');

    notificationService.emit('OrderCreated', {
      orderId: order.id,
      userId: order.userId,
      email: order.user.email,
      firstName: order.user.firstName,
      orderNumber: order.orderNumber
    });

    return order;
  },

  async addTimelineEvent(orderId: string, status: string, message?: string, createdBy?: string) {
    return await prisma.orderTimeline.create({
      data: {
        orderId,
        status,
        message,
        createdBy
      }
    });
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, message?: string, createdBy: string = 'SYSTEM') {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { user: true }
    });

    await this.addTimelineEvent(order.id, newStatus, message, createdBy);

    if (newStatus === OrderStatus.CONFIRMED) {
      notificationService.emit('OrderPaid', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber
      });
    }

    if (newStatus === OrderStatus.SHIPPED) {
      notificationService.emit('ShipmentCreated', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber || ''
      });
    }

    if (newStatus === OrderStatus.DELIVERED) {
      notificationService.emit('ShipmentDelivered', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber
      });
    }

    if (newStatus === OrderStatus.CANCELLED) {
      notificationService.emit('OrderCancelled', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber
      });
    }

    return order;
  },

  async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, timeline: { orderBy: { createdAt: 'desc' } } }
    });
    
    if (!order) throw new AppError('Order not found', 404);
    if (userId && order.userId !== userId) throw new AppError('Unauthorized access to order', 403);
    
    return order;
  },

  async getOrdersByUser(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }
};
