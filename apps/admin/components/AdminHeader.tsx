'use client';

import React from 'react';
import { User, Bell } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-border/60 bg-card/25 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
          Environment: Live
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 bg-accent rounded-full" />
        </button>

        <div className="flex items-center gap-2 border-l border-border/40 pl-4">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <User className="size-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-foreground leading-none">Super Administrator</span>
            <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">super@corecart.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
