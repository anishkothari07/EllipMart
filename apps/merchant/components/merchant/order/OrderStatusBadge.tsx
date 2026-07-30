'use client';

import React from 'react';
import { cn } from '@corecart/shared';

const ORDER_STATUS_CONFIG: Record<string, { label: string; styles: string }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    styles: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  CONFIRMED: {
    label: 'Confirmed',
    styles: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  PROCESSING: {
    label: 'Processing',
    styles: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
  PACKED: {
    label: 'Packed',
    styles: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  },
  SHIPPED: {
    label: 'Shipped',
    styles: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  DELIVERED: {
    label: 'Delivered',
    styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    styles: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  RETURNED: {
    label: 'Returned',
    styles: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  REFUNDED: {
    label: 'Refunded',
    styles: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
};

interface OrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function OrderStatusBadge({ status, size = 'sm' }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] ?? {
    label: status,
    styles: 'bg-muted text-muted-foreground border-border/80',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none leading-none',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        config.styles,
      )}
    >
      {config.label}
    </span>
  );
}
