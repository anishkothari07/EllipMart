'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Package, LogOut, ShoppingBag } from 'lucide-react';
import { useSellerSession } from './seller-auth-provider';
import { sellerLogoutAction } from '../app/actions';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'My Products', href: '/products', icon: Package },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSellerSession();
  const router = useRouter();

  const handleLogout = async () => {
    await sellerLogoutAction();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border/60 bg-card/50 flex flex-col py-6 px-4 gap-6 shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <Image src="/logo.png" alt="EllipMart" width={36} height={36} className="object-contain" />
          <div>
            <p className="text-sm font-bold leading-tight">EllipMart</p>
            <p className="text-[10px] text-muted-foreground font-medium">Seller Portal</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-border/60 pt-4 space-y-3">
          {user && (
            <div className="flex items-center gap-2.5 px-2">
              <div className="size-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
