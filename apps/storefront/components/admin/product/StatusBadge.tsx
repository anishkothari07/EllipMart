'use client';

import React from 'react';
import { cn } from '@corecart/shared';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let badgeStyles = 'bg-muted text-muted-foreground border-border/80';
  let label = status;

  if (status === 'ACTIVE') {
    badgeStyles = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    label = 'Active';
  } else if (status === 'DRAFT') {
    badgeStyles = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    label = 'Draft';
  } else if (status === 'ARCHIVED') {
    badgeStyles = 'bg-destructive/10 text-destructive border-destructive/20';
    label = 'Archived';
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border select-none leading-none",
        badgeStyles
      )}
    >
      {label}
    </span>
  );
}
