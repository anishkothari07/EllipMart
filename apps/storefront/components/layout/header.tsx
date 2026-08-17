'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  ChevronDown,
  Command,
  Globe,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Category, MegaMenuSection, NavLink } from '@corecart/shared'
import { cn } from '@corecart/shared'
import { NotificationCenterDrawer } from '@/components/notifications/notification-center-drawer'
import { Container } from '@corecart/ui'
import { useStore } from '@/components/providers/store-provider'
import { ThemeToggle } from './theme-toggle'
import { SearchDialog } from './search-dialog'
import { useCartAnimation } from '@/components/providers/cart-animation-provider'

export function Header({
  navLinks,
  megaMenu,
  categories,
  trendingSearches,
}: {
  navLinks: NavLink[]
  megaMenu: MegaMenuSection[]
  categories: Category[]
  trendingSearches: string[]
}) {
  const { cartCount, wishlistCount, notifications, setCartOpen } = useStore()
  const { registerCartIcon } = useCartAnimation()
  const cartIconContainerRef = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)

  useEffect(() => {
    registerCartIcon(cartIconContainerRef)
  }, [registerCartIcon])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const section = megaMenu[0]

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full isolate bg-background transition-all duration-300',
          scrolled && 'border-b border-border shadow-sm',
        )}
        onMouseLeave={() => setActiveMenu(null)}
      >
        {/* Utility bar */}
        <div className="hidden border-b border-border/60 lg:block">
          <Container className="flex h-9 items-center justify-between text-xs text-muted-foreground">
            <p>Free delivery over ₹999 · Easy 30-day returns</p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <Globe className="size-3.5" /> India · ₹ INR · English
                <ChevronDown className="size-3" />
              </button>
              <Link href="/account/orders" className="transition-colors hover:text-foreground">
                Track order
              </Link>
              <Link href="/account" className="transition-colors hover:text-foreground">
                Help
              </Link>
            </div>
          </Container>
        </div>

        {/* Main bar */}
        <Container className="flex h-16 items-center gap-4">
          <button
            className="grid size-9 place-items-center rounded-full hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="EllipMart Logo" width={56} height={56} className="object-contain" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            <button
              onMouseEnter={() => setActiveMenu(section.label)}
              onClick={() => setActiveMenu((m) => (m ? null : section.label))}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                activeMenu === section.label && 'bg-muted',
              )}
              aria-expanded={activeMenu === section.label}
            >
              {section.label}
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform',
                  activeMenu === section.label && 'rotate-180',
                )}
              />
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onMouseEnter={() => setActiveMenu(null)}
                className="relative rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-accent-foreground">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Search (desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto hidden h-10 w-64 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/20 md:flex"
          >
            <Search className="size-4" />
            <span>Search products…</span>
            <span className="ml-auto flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 text-[10px]">
              <Command className="size-2.5" />K
            </span>
          </button>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-0.5 md:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid size-9 place-items-center rounded-full hover:bg-muted md:hidden"
            >
              <Search className="size-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setNotifDrawerOpen(true)}
              aria-label="Notifications"
              className="relative hidden size-9 place-items-center rounded-full hover:bg-muted sm:grid cursor-pointer"
            >
              <Bell className="size-[18px]" />
              {notifications > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-indigo-600" />
              )}
            </button>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="relative hidden size-9 place-items-center rounded-full hover:bg-muted sm:grid"
            >
              <Heart className="size-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="grid size-9 place-items-center rounded-full hover:bg-muted"
            >
              <User className="size-[18px]" />
            </Link>
            <div ref={cartIconContainerRef} className="relative flex items-center justify-center">
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
                className="relative grid size-9 place-items-center rounded-full hover:bg-muted"
              >
                <ShoppingBag className="size-[18px]" />
                <AnimatePresence mode="popLayout">
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </Container>

        {/* Mega menu */}
        <AnimatePresence>
          {activeMenu === section.label && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-popover shadow-float lg:block"
              onMouseEnter={() => setActiveMenu(section.label)}
            >
              <Container className="grid grid-cols-4 gap-8 py-8">
                {section.columns.map((col) => (
                  <div key={col.title}>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {col.title}
                    </p>
                    <ul className="space-y-2">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            prefetch={false}
                            onClick={() => setActiveMenu(null)}
                            className="text-sm text-foreground/80 transition-colors hover:text-accent"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {section.featured && (
                  <Link
                    href={section.featured.href}
                    prefetch={false}
                    onClick={() => setActiveMenu(null)}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={section.featured.image || '/placeholder.svg'}
                      alt={section.featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-background">
                      <p className="text-sm font-semibold">{section.featured.title}</p>
                      <p className="text-xs opacity-90">{section.featured.subtitle}</p>
                    </div>
                  </Link>
                )}
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        trendingSearches={trendingSearches}
      />

      <NotificationCenterDrawer open={notifDrawerOpen} onOpenChange={setNotifDrawerOpen} />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        categories={categories}
      />
    </>
  )
}

function MobileMenu({
  open,
  onClose,
  navLinks,
  categories,
}: {
  open: boolean
  onClose: () => void
  navLinks: NavLink[]
  categories: Category[]
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] lg:hidden" initial="c" animate="o" exit="c">
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            variants={{ o: { opacity: 1 }, c: { opacity: 0 } }}
          />
          <motion.aside
            className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-float"
            variants={{ o: { x: 0 }, c: { x: '-100%' } }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <nav className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium hover:bg-muted"
                  >
                    {l.label}
                    {l.badge && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                        {l.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
              <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((c) => (
                   <Link
                     key={c.id}
                     href={`/category/${c.slug}`}
                     prefetch={false}
                     onClick={onClose}
                     className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                   >
                    <Image src={c.image || '/placeholder.svg'} alt={c.name} fill className="object-cover" sizes="180px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-sm font-semibold text-background">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-5">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
              >
                Sign in
              </Link>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
