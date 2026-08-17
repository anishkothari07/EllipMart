'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="EllipMart Logo" width={48} height={48} className="object-contain" priority />
        </Link>
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
