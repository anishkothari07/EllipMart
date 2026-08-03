import { Hero } from '@/components/home/hero'
import { TrustBar } from '@/components/home/trust-bar'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { ProductRail } from '@/components/home/product-rail'
import { PromoBanner } from '@/components/home/promo-banner'
import { Testimonials } from '@/components/home/testimonials'
import { Newsletter } from '@/components/home/newsletter'
import { shoppingProductService } from '@corecart/commerce'

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [bestSellersRes, newArrivalsRes, trendingRes] = await Promise.all([
    shoppingProductService.listProducts({ sort: 'sales_desc', limit: 4 }),
    shoppingProductService.listProducts({ sort: 'newest', limit: 4 }),
    shoppingProductService.listProducts({ sort: 'popular', limit: 8 }),
  ]);

  const bestSellers = bestSellersRes.items;
  const newArrivals = newArrivalsRes.items;
  const trending = trendingRes.items;

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
