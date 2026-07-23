'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Menu, Search, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavigation({ onOpenSearch, onOpenMenu }: { onOpenSearch?: () => void, onOpenMenu?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '#categories', icon: Menu, action: onOpenMenu },
    { label: 'Search', href: '#search', icon: Search, action: onOpenSearch },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block border-t border-border/80 bg-background/80 pb-safe backdrop-blur-lg lg:hidden shadow-lg">
      <nav className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors',
                isActive ? 'text-primary font-semibold' : 'hover:text-foreground'
              )}
            >
              <Icon className={cn('size-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
