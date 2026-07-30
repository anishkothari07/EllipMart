'use client';

import React from 'react';
import Link from 'next/link';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Users,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  Store,
} from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border/60 bg-card/50 flex flex-col h-full overflow-y-auto select-none py-6 px-4 space-y-6">
      {/* Brand Logo & Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="size-9 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-md">
          <Store className="size-5 shrink-0" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground leading-none">SmartGO</span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Merchant Admin</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4">
        <SidebarSection>
          <SidebarItem label="Dashboard" href="/" icon={LayoutDashboard} />
        </SidebarSection>

        <SidebarSection title="Operations">
          <SidebarItem
            label="Catalog"
            icon={ShoppingBag}
            children={[
              { label: 'Products', href: '/products' },
              { label: 'Collections', href: '/collections' },
              { label: 'Categories', href: '/categories' },
              { label: 'Inventory', href: '/inventory' },
            ]}
          />
          <SidebarItem
            label="Sales"
            icon={CreditCard}
            children={[
              { label: 'Orders', href: '/orders' },
            ]}
          />
          <SidebarItem label="Customers" href="/customers" icon={Users} />
        </SidebarSection>

        <SidebarSection title="Marketing & Assets">
          <SidebarItem label="Content" href="/media" icon={FileText} />
          <SidebarItem label="Marketing" href="/marketing" icon={Megaphone} />
        </SidebarSection>

        <SidebarSection title="Analytics & Management">
          <SidebarItem label="Reports" href="/reports" icon={BarChart3} />
          <SidebarItem label="Settings" href="/settings" icon={Settings} />
        </SidebarSection>
      </nav>
    </aside>
  );
}
