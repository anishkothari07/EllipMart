'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Category, MegaMenuSection, NavLink } from '@corecart/types'
import { Header } from './header'
import { Footer } from './footer'
import { CartDrawer } from './cart-drawer'
import { BottomNavigation } from './bottom-navigation'
import { MobileSearchOverlay } from '../search/mobile-search-overlay'
import { X, ChevronRight, LayoutGrid } from 'lucide-react'
import Link from 'next/link'

export function SiteChrome({
  children,
  navLinks,
  megaMenu,
  categories,
  trendingSearches,
  announcements,
}: {
  children: React.ReactNode
  navLinks: NavLink[]
  megaMenu: MegaMenuSection[]
  categories: Category[]
  trendingSearches: string[]
  announcements: string[]
}) {
  const [index, setIndex] = useState(0)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 4000)
    return () => clearInterval(id)
  }, [announcements.length])

  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      {/* Top Banner (Hidden on extra small screens for more real estate) */}
      <div className="hidden sm:flex h-9 items-center justify-center overflow-hidden bg-foreground text-background">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-medium tracking-wide"
          >
            {announcements[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <Header
        navLinks={navLinks}
        megaMenu={megaMenu}
        categories={categories}
        trendingSearches={trendingSearches}
      />

      <main className="flex-1">{children}</main>

      <Footer />
      <CartDrawer />

      {/* Mobile Bottom Bar Navigation */}
      <BottomNavigation
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* Voice & Fullscreen Mobile Search overlay */}
      <MobileSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        trending={trendingSearches}
      />

      {/* Mobile Hamburger Slide Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <span className="font-semibold text-lg flex items-center gap-2">
                  <LayoutGrid className="size-5 text-primary" /> Categories
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto flex flex-col gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted text-sm font-semibold transition-colors text-foreground"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto border-t border-border pt-4 text-xs text-muted-foreground text-center">
                SmartGO India Regional Store · v1.4
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
