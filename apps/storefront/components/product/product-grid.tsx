'use client'

import { motion } from 'framer-motion'
import type { Product } from '@corecart/shared'
import { cn } from '@corecart/shared'
import { ProductCard } from './product-card'
import { ProductListRow } from './product-list-row'

export function ProductGrid({
  products,
  view = 'grid',
  onQuickView,
  className,
}: {
  products: Product[]
  view?: 'grid' | 'list'
  onQuickView?: (product: Product) => void
  className?: string
}) {
  if (view === 'list') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {products.map((product) => (
          <ProductListRow key={product.id} product={product} onQuickView={onQuickView} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className,
      )}
    >
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.03 }}
        >
          <ProductCard product={product} onQuickView={onQuickView} />
        </motion.div>
      ))}
    </div>
  )
}
