'use client'

import {
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Star,
  User,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@corecart/shared'

const links = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/wallet', label: 'Wallet', icon: Wallet },
  { href: '/account/loyalty', label: 'Loyalty Points', icon: Star },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/payments', label: 'Payment methods', icon: CreditCard },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/settings', label: 'Settings', icon: Settings },
]

export function AccountSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      // Step 1: Call logout API — revokes session in DB and deletes the HttpOnly cookie server-side
      await fetch('/api/v1/auth/logout', { method: 'POST' })
      // Step 2: Clear client-side access token
      localStorage.removeItem('ellipmart_access_token')
      // Step 3: Navigate to login. router.replace so back-button doesn't return to /account
      router.replace('/auth/login')
    } catch (err) {
      console.error('[SignOut] Logout request failed:', err)
      // Still navigate even if the API call fails — worst case is an orphaned session
      router.replace('/auth/login')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <aside className="w-full min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start">
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 min-w-0">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
          {user?.firstName?.[0] || ''}
          {user?.lastName?.[0] || ''}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {user?.firstName || ''} {user?.lastName || ''}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.role || 'User'} · 0 pts</p>
        </div>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-1.5 sm:p-2">
        <nav 
          role="tablist"
          aria-label="Account navigation tabs"
          className="flex gap-1.5 overflow-x-auto w-full min-w-0 max-w-full no-scrollbar overscroll-x-contain touch-pan-x py-0.5 px-0.5 lg:flex-col lg:overflow-visible"
        >
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                  active ? 'bg-foreground text-background font-semibold shadow-xs' : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                )}
              >
                <link.icon className="size-4 sm:size-[18px] shrink-0" />
                {link.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50 whitespace-nowrap"
          >
            <LogOut className="size-4 sm:size-[18px] shrink-0" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </nav>
      </div>
    </aside>
  )
}
