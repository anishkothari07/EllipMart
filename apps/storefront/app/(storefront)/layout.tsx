import { Suspense } from 'react'
import { SiteChrome } from '@/components/layout/site-chrome'
import { ShoppingAssistant } from '@/components/ai/shopping-assistant'
import {
  banners,
  categories,
  megaMenu,
  navLinks,
  trendingSearches,
} from '@corecart/shared'

/**
 * Storefront layout — wraps all public-facing pages with the full site chrome:
 * announcement bar, header, navigation, search, cart, wishlist, footer.
 * Auth pages do NOT use this layout.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SiteChrome
        navLinks={navLinks}
        megaMenu={megaMenu}
        categories={categories}
        trendingSearches={trendingSearches}
        announcements={banners.announcements}
      >
        {children}
      </SiteChrome>
      <ShoppingAssistant />
    </Suspense>
  )
}
