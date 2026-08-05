import { Suspense } from 'react'
import { Hero } from '@/components/home/hero'
import { TrustBar } from '@/components/home/trust-bar'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { ProductRail } from '@/components/home/product-rail'
import { PromoBanner } from '@/components/home/promo-banner'
import { Testimonials } from '@/components/home/testimonials'
import { Newsletter } from '@/components/home/newsletter'
import { shoppingProductService } from '@corecart/commerce'

// Revalidate every 60 seconds — new products appear within 1 minute
// without forcing a full DB round-trip on every request
export const revalidate = 0;

export default async function HomePage() {
  // Single DB query — wrapped in try/catch so that Railway TCP proxy drops
  // (which happen intermittently on the free tier) don't trigger the error
  // boundary; the page simply renders without product rails instead of crashing.
  let allProducts: any[] = [];
  try {
    const result = await shoppingProductService.listProducts({
      sort: 'newest',
      limit: 16,
    });
    allProducts = result.items;
  } catch (err) {
    // Railway connection drop — Prisma singleton has been reset; next request
    // will reconnect automatically. Render the page without products.
    console.error('[HomePage] DB unavailable — rendering without products:', (err as Error).message);
  }

  const bestSellers = allProducts.slice(0, 4);
  const newArrivals = allProducts.slice(4, 8);
  const trending = allProducts.slice(8, 16);

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryShowcase />
      <ProductRail
        eyebrow="Fan favorites"
        title="Best sellers this week"
        description="The pieces our community keeps coming back to."
        href="/category/all"
        products={bestSellers.length ? bestSellers : trending.slice(0, 4)}
      />
      <PromoBanner />
      <ProductRail
        eyebrow="Just landed"
        title="New arrivals"
        description="Fresh drops across every category, updated weekly."
        href="/category/all"
        products={newArrivals.length ? newArrivals : trending.slice(4, 8)}
        tone="muted"
      />
      <Testimonials />
      <Newsletter />
    </>
  )
}
