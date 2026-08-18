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
  Package,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border/60 bg-card/50 flex flex-col h-full overflow-y-auto select-none py-6 px-4 space-y-6">
      {/* Brand Logo & Header */}
      <div className="flex items-center gap-3 px-2">
        <Link href="/seller" className="flex items-center">
          <Image src="/logo.png" alt="EllipMart Logo" width={48} height={48} className="object-contain" priority />
        </Link>
        <div>
          <p className="text-xs font-bold text-foreground">Seller Portal</p>
          <p className="text-[10px] text-muted-foreground">EllipMart</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4">
        <SidebarSection>
          <SidebarItem label="Dashboard" href="/seller" icon={LayoutDashboard} />
        </SidebarSection>

        <SidebarSection title="My Store">
          <SidebarItem
            label="Products"
            icon={ShoppingBag}
            children={[
              { label: 'All Products', href: '/seller/products' },
              { label: 'Add Product', href: '/seller/products/new' },
            ]}
          />
          <SidebarItem
            label="Orders"
            icon={CreditCard}
            children={[
              { label: 'All Orders', href: '/seller/orders' },
            ]}
          />
          <SidebarItem label="Inventory" href="/seller/inventory" icon={Package} />
          <SidebarItem label="Media" href="/seller/media" icon={ImageIcon} />
        </SidebarSection>

        <SidebarSection title="Account">
          <SidebarItem label="Settings" href="/seller/settings" icon={Settings} />
        </SidebarSection>
      </nav>
    </aside>
  );
}
