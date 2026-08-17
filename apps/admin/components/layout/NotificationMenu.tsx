'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export function NotificationMenu() {
  const [unreadCount] = useState(0);
  return (
    <button
      aria-label="Notifications"
      className="relative size-10 rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-colors flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
    >
      <Bell className="size-4.5 text-muted-foreground hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
