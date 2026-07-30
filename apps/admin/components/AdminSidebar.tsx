'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, Settings, LogOut, Shield } from 'lucide-react';
import { cn } from '@corecart/shared';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Websites & Tenants', href: '/websites', icon: Globe },
    { label: 'System Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border/60 bg-card/50 flex flex-col h-full overflow-y-auto select-none py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="size-9 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-md">
          <Shield className="size-5 shrink-0" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground leading-none">CoreCart</span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Super Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150",
                isActive
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border/40 px-2">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
