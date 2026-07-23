import { Hero } from '@/components/home/hero'
import { TrustBar } from '@/components/home/trust-bar'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { ProductRail } from '@/components/home/product-rail'
import { PromoBanner } from '@/components/home/promo-banner'
import { Testimonials } from '@/components/home/testimonials'
import { Newsletter } from '@/components/home/newsletter'
import { shoppingProductService } from '@/lib/modules/shopping/shopping-product.service'

export default async function HomePage() {
  const result = await shoppingProductService.listProducts({ limit: 12 });
  const products = result.items;

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4)
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4)
  const trending = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8)

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
