'use client';

import React from 'react';
import { HeaderSearch } from './HeaderSearch';
import { NotificationMenu } from './NotificationMenu';
import { ProfileMenu } from './ProfileMenu';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border/60 bg-card/40 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Drawer"
          className="grid size-10 place-items-center rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-colors md:hidden outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <Menu className="size-5 text-muted-foreground" />
        </button>
        <HeaderSearch />
      </div>
      <div className="flex items-center gap-3">
        <NotificationMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
