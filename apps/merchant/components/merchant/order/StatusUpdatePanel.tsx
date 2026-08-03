'use client';

import React, { useState } from 'react';
import { Settings, Check, AlertCircle } from 'lucide-react';
// OrderStatus values duplicated here to avoid importing @prisma/client in a client component
const OrderStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED',
} as const;
type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';

interface StatusUpdatePanelProps {
  orderId: string;
  currentStatus: string;
  onSuccess: () => void;
}

const ORDER_STATUS_OPTIONS = [
  { value: OrderStatus.PENDING_PAYMENT, label: 'Pending Payment' },
  { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
  { value: OrderStatus.PROCESSING, label: 'Processing' },
  { value: OrderStatus.PACKED, label: 'Packed' },
  { value: OrderStatus.SHIPPED, label: 'Shipped' },
  { value: OrderStatus.DELIVERED, label: 'Delivered' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
  { value: OrderStatus.RETURNED, label: 'Returned' },
  { value: OrderStatus.REFUNDED, label: 'Refunded' },
];

export function StatusUpdatePanel({ orderId, currentStatus, onSuccess }: StatusUpdatePanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus as OrderStatus);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (selectedStatus === currentStatus) {
      setError('Selected status is already the current status.');
      return;
    }

    setLoading(true);
    try {
      await MerchantOrderClient.updateStatus(orderId, selectedStatus, note.trim() || undefined);
      setSuccess(true);
      setNote('');
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <Settings className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Update Order Status</h3>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5 shrink-0 mt-0.5" />
          <span>Order status updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Order Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            disabled={loading}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none focus:border-foreground/30 transition-all duration-150 text-foreground cursor-pointer"
          >
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Activity Log Custom Note (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Awaiting customer confirmation, packaged in custom box..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150"
          />
        </div>

        <button
          type="submit"
          disabled={loading || selectedStatus === currentStatus}
          className="w-full py-2 text-xs font-bold bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <div className="size-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
          ) : (
            <Check className="size-3.5" />
          )}
          Update Status
        </button>
      </form>
    </div>
  );
}
