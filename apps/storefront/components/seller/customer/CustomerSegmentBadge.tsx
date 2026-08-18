'use client';

import React from 'react';
import { cn } from '@corecart/shared';

const SEGMENT_CONFIG: Record<string, { label: string; styles: string }> = {
  VIP: {
    label: 'VIP Customer',
    styles: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  WHOLESALE: {
    label: 'Wholesale',
    styles: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  NEW: {
    label: 'New Customer',
    styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  RETURNING: {
    label: 'Returning',
    styles: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
  HIGH_SPEND: {
    label: 'High Spend',
    styles: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  INACTIVE: {
    label: 'Inactive (90d+)',
    styles: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

interface CustomerSegmentBadgeProps {
  segment: string;
  size?: 'sm' | 'md';
}

export function CustomerSegmentBadge({ segment, size = 'sm' }: CustomerSegmentBadgeProps) {
  const key = segment.toUpperCase();
  const config = SEGMENT_CONFIG[key] ?? {
    label: segment,
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
