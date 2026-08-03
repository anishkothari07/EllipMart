'use client'

import { motion } from 'framer-motion'
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
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
