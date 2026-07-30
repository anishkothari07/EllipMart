'use client';

import React from 'react';
import { cn } from '@corecart/shared';

// Maps OrderStatus fulfillment-related states to display labels
const FULFILLMENT_STATUS_CONFIG: Record<string, { label: string; styles: string; dot: string }> = {
  PENDING_PAYMENT: {
    label: 'Unfulfilled',
    styles: 'bg-muted text-muted-foreground border-border/80',
    dot: 'bg-muted-foreground',
  },
  CONFIRMED: {
    label: 'Unfulfilled',
    styles: 'bg-muted text-muted-foreground border-border/80',
    dot: 'bg-muted-foreground',
  },
  PROCESSING: {
    label: 'Processing',
    styles: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    dot: 'bg-violet-500',
  },
  PACKED: {
    label: 'Packed',
    styles: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    dot: 'bg-cyan-500',
  },
  SHIPPED: {
    label: 'Shipped',
    styles: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-500',
  },
  DELIVERED: {
    label: 'Delivered',
    styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    styles: 'bg-destructive/10 text-destructive border-destructive/20',
    dot: 'bg-destructive',
  },
  RETURNED: {
    label: 'Returned',
    styles: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    dot: 'bg-orange-500',
  },
  REFUNDED: {
    label: 'Refunded',
    styles: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-500',
  },
};

interface FulfillmentStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function FulfillmentStatusBadge({ status, size = 'sm' }: FulfillmentStatusBadgeProps) {
  const config = FULFILLMENT_STATUS_CONFIG[status] ?? {
    label: status,
    styles: 'bg-muted text-muted-foreground border-border/80',
    dot: 'bg-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border select-none leading-none',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        config.styles,
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}
