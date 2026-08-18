'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Users,
  Store,
  Tag,
  Layers,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@corecart/shared';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Sellers', href: '/admin/sellers', icon: Store },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Orders', href: '/admin/orders', icon: CreditCard },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Collections', href: '/admin/collections', icon: Tag },
    { label: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border/60 bg-card/50 flex flex-col h-full overflow-y-auto select-none py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 px-2">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.png" alt="EllipMart Logo" width={36} height={36} className="object-contain" priority />
          <div>
            <p className="text-xs font-bold text-foreground">Super Admin</p>
            <p className="text-[10px] text-muted-foreground">EllipMart Platform</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
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
          href="/auth/login"
          className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
