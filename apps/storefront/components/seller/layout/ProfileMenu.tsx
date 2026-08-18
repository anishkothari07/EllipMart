'use client';

import React, { useState } from 'react';
import { useMerchantSession } from '../providers/merchant-auth-provider';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { cn } from '@corecart/shared';

export function ProfileMenu() {
  const { user, logout } = useMerchantSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 p-1 px-2.5 rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 text-left"
      >
        <div className="size-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase">
          {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-foreground leading-none">
            {user.firstName || 'Seller'}
          </span>
          <span className="text-[9px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">{user.role}</span>
        </div>
        <ChevronDown className="size-3.5 text-muted-foreground opacity-60 ml-0.5 hidden sm:block" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-popover p-2 shadow-float z-20 space-y-1">
            <div className="px-3.5 py-2.5 border-b border-border/60">
              <p className="text-xs font-bold text-foreground leading-none">{user.firstName || 'Seller'}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-1 leading-none">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-4 shrink-0" /> Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
