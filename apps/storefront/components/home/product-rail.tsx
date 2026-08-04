'use client'

import { Container } from '@corecart/ui'
import { SectionHeader } from '@corecart/ui'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@corecart/shared'

interface ProductRailProps {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  products: Product[]
  tone?: 'default' | 'muted'
}

export function ProductRail({
  eyebrow,
  title,
  description,
  href,
  products,
  tone = 'default',
}: ProductRailProps) {
  return (
    <section className={tone === 'muted' ? 'bg-secondary/40 py-16 sm:py-20' : 'py-16 sm:py-20'}>
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
        />
        {/* CSS stagger via animation-delay, no per-item IntersectionObserver */}
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
