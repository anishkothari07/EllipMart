export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; description: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Payment pending', description: 'Waiting for payment', className: 'bg-muted text-muted-foreground' },
  CONFIRMED: { label: 'Confirmed', description: 'Order confirmed', className: 'bg-primary/10 text-primary' },
  PROCESSING: { label: 'Processing', description: 'Preparing your order', className: 'bg-blue-500/10 text-blue-500' },
  PACKED: { label: 'Packed', description: 'Order packed', className: 'bg-blue-500/10 text-blue-500' },
  SHIPPED: { label: 'Shipped', description: 'Order shipped', className: 'bg-indigo-500/10 text-indigo-500' },
  DELIVERED: { label: 'Delivered', description: 'Order delivered', className: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Cancelled', description: 'Order cancelled', className: 'bg-destructive/10 text-destructive' },
  RETURNED: { label: 'Returned', description: 'Order returned', className: 'bg-destructive/10 text-destructive' },
  REFUNDED: { label: 'Refunded', description: 'Order refunded', className: 'bg-destructive/10 text-destructive' },
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  AUTHORIZED: { label: 'Authorized', className: 'bg-blue-500/10 text-blue-500' },
  CAPTURED: { label: 'Paid', className: 'bg-success/10 text-success' },
  FAILED: { label: 'Failed', className: 'bg-destructive/10 text-destructive' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
  EXPIRED: { label: 'Expired', className: 'bg-destructive/10 text-destructive' },
  REFUND_PENDING: { label: 'Refund Pending', className: 'bg-muted text-muted-foreground' },
  REFUNDED: { label: 'Refunded', className: 'bg-success/10 text-success' },
  PARTIALLY_REFUNDED: { label: 'Partially Refunded', className: 'bg-success/10 text-success' },
};

export function getEstimatedDeliveryDate(createdAt: string | Date, persistedEstimate?: string | null): string {
  if (persistedEstimate) {
    return persistedEstimate;
  }
  
  // Deterministic rule: Order Date + 3 to 5 calendar days
  const date = new Date(createdAt);
  const start = new Date(date);
  start.setDate(date.getDate() + 3);
  
  const end = new Date(date);
  end.setDate(date.getDate() + 5);
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  // e.g., "Aug 3–5" or "Aug 3 – Sep 5"
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', options)}–${end.getDate()}`;
  }
  
  return `${start.toLocaleDateString('en-US', options)}–${end.toLocaleDateString('en-US', options)}`;
}

export function getDeliveryMessage(
  status: OrderStatus,
  estimatedDelivery: string,
  deliveredAt?: Date | string | null,
  paymentMethodCode?: string | null
): string {
  const isCod = paymentMethodCode === 'COD';

  switch (status) {
    case 'PENDING_PAYMENT':
      // COD orders with PENDING_PAYMENT are placed/accepted (legacy compat)
      if (isCod) return `Order placed • Expected ${estimatedDelivery}`;
      return 'Complete payment to continue your order';
    case 'CONFIRMED':
    case 'PROCESSING':
    case 'PACKED':
      return `Preparing your order • Expected ${estimatedDelivery}`;
    case 'SHIPPED':
      return `Shipped • Expected ${estimatedDelivery}`;
    case 'DELIVERED':
      if (deliveredAt) {
        const dDate = new Date(deliveredAt);
        return `Delivered on ${dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      return 'Delivered';
    case 'CANCELLED':
    case 'RETURNED':
    case 'REFUNDED':
      return `Order ${status.toLowerCase()}`;
    default:
      return `Expected delivery ${estimatedDelivery}`;
  }
}

/**
 * Returns customer-facing payment presentation details.
 * Use this instead of raw PAYMENT_STATUS_MAP to handle COD semantics correctly.
 */
export function getPaymentPresentation(
  paymentMethodCode: string | null | undefined,
  paymentStatus: string | null | undefined
): {
  methodLabel: string;
  statusLabel: string;
  statusDescription: string;
  badgeClass: string;
  isCod: boolean;
  isPaid: boolean;
  isPending: boolean;
  needsAction: boolean;
} {
  const isCod = paymentMethodCode === 'COD';
  const isPaid = paymentStatus === 'CAPTURED';
  const isPending = paymentStatus === 'PENDING' || paymentStatus === null || paymentStatus === undefined;
  const isFailed = paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED';

  if (isCod) {
    return {
      methodLabel: 'Cash on Delivery',
      statusLabel: isPaid ? 'Paid' : 'Pay on delivery',
      statusDescription: isPaid
        ? 'Payment received'
        : 'Pay when your order arrives',
      badgeClass: isPaid
        ? 'bg-success/10 text-success'
        : 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      isCod: true,
      isPaid,
      isPending: !isPaid,
      needsAction: false, // COD never needs customer action for payment
    };
  }

  // Online payment
  return {
    methodLabel: paymentMethodCode || 'Online',
    statusLabel: isPaid ? 'Paid' : isFailed ? 'Failed' : 'Pending',
    statusDescription: isPaid
      ? 'Payment captured successfully'
      : isFailed
      ? 'Payment was not completed'
      : 'Awaiting payment confirmation',
    badgeClass: isPaid
      ? 'bg-success/10 text-success'
      : isFailed
      ? 'bg-destructive/10 text-destructive'
      : 'bg-muted text-muted-foreground',
    isCod: false,
    isPaid,
    isPending,
    needsAction: isFailed || (isPending && !isCod),
  };
}

export function getOrderProductImage(item: any): string {
  if (!item) return '/placeholder.jpg';
  
  const media = item.variant?.product?.images?.[0]?.media;
  let src = media?.publicUrl || media?.path || null;
  if (typeof src === 'string' && src.startsWith('/uploads/')) {
    src = `${process.env.NEXT_PUBLIC_MERCHANT_URL || 'http://localhost:3002'}${src}`;
  }
  
  return src || '/placeholder.jpg';
}

export function getOrderProductName(item: any): string {
  if (!item) return 'Unknown Product';
  return item.variant?.product?.name || item.productName || 'Unknown Product';
}
