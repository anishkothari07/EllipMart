'use client';

import React from 'react';

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="space-y-1.5 py-1">
      {title && (
        <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 select-none block">
          {title}
        </span>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
