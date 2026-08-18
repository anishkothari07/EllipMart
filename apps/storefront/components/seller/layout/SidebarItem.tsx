'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@corecart/shared';

export interface SidebarItemChild {
  label: string;
  href: string;
}

interface SidebarItemProps {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  children?: SidebarItemChild[];
}

export function SidebarItem({ label, href, icon: Icon, children }: SidebarItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = children && children.length > 0;
  
  // An item is active if its path matches the current pathname, or if any child is active
  const isActive = href ? pathname === href : false;
  const isChildActive = hasChildren ? children.some(c => pathname === c.href) : false;

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Common styles
  const baseStyles = "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-foreground/20";
  const activeStyles = "bg-foreground text-background shadow-sm hover:bg-foreground/90";
  const inactiveStyles = "text-muted-foreground hover:text-foreground hover:bg-muted/60";

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={toggleSubmenu}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen || isChildActive}
          className={cn(
            baseStyles,
            isChildActive ? "bg-muted/40 text-foreground" : inactiveStyles
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="size-4.5 shrink-0" />}
            <span>{label}</span>
          </div>
          {isOpen || isChildActive ? (
            <ChevronDown className="size-4 shrink-0 opacity-70" />
          ) : (
            <ChevronRight className="size-4 shrink-0 opacity-70" />
          )}
        </button>

        {(isOpen || isChildActive) && (
          <div className="pl-8 pr-2 py-0.5 space-y-1 border-l border-border/60 ml-5">
            {children.map((child) => {
              const isSubActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
                    isSubActive 
                      ? "text-foreground font-bold bg-muted/60" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href || '#'}
      className={cn(
        baseStyles,
        isActive ? activeStyles : inactiveStyles
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="size-4.5 shrink-0" />}
        <span>{label}</span>
      </div>
    </Link>
  );
}
