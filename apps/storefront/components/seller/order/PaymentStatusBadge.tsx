'use client';

import React from 'react';
import { cn } from '@corecart/shared';

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; styles: string }> = {
  PENDING: {
    label: 'Pending',
    styles: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  AUTHORIZED: {
    label: 'Authorized',
    styles: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  CAPTURED: {
    label: 'Paid',
    styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  FAILED: {
    label: 'Failed',
    styles: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    styles: 'bg-muted text-muted-foreground border-border/80',
  },
  EXPIRED: {
    label: 'Expired',
    styles: 'bg-muted text-muted-foreground border-border/80',
  },
  REFUND_PENDING: {
    label: 'Refund Pending',
    styles: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  REFUNDED: {
    label: 'Refunded',
    styles: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
  PARTIALLY_REFUNDED: {
    label: 'Partial Refund',
    styles: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
};

interface PaymentStatusBadgeProps {
  status: string | null;
  size?: 'sm' | 'md';
}

export function PaymentStatusBadge({ status, size = 'sm' }: PaymentStatusBadgeProps) {
  if (!status) {
    return (
      <span className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none leading-none bg-muted text-muted-foreground border-border/80',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      )}>
        No Payment
      </span>
    );
  }

  const config = PAYMENT_STATUS_CONFIG[status] ?? {
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
