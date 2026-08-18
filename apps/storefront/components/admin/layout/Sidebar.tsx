'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarItem } from '@/components/seller/layout/SidebarItem';
import { SidebarSection } from '@/components/seller/layout/SidebarSection';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
} from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border/60 bg-card/50 flex flex-col h-full overflow-y-auto select-none py-6 px-4 space-y-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2">
        <Link href="/admin" className="flex items-center">
          <Image src="/logo.png" alt="EllipMart Logo" width={48} height={48} className="object-contain" priority />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4">
        <SidebarSection>
          <SidebarItem label="Dashboard" href="/admin" icon={LayoutDashboard} />
        </SidebarSection>

        <SidebarSection title="My Catalog">
          <SidebarItem
            label="Catalog"
            icon={ShoppingBag}
            children={[
              { label: 'Products', href: '/products' },
            ]}
          />
          <SidebarItem
            label="Sales"
            icon={CreditCard}
            children={[
              { label: 'Orders', href: '/orders' },
            ]}
          />
        </SidebarSection>

        <SidebarSection title="Analytics & Settings">
          <SidebarItem label="Reports" href="/reports" icon={BarChart3} />
          <SidebarItem label="Settings" href="/admin/settings" icon={Settings} />
        </SidebarSection>
      </nav>
    </aside>
  );
}
