'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Heart, Plus, Truck } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@corecart/types'
import { cn } from '@corecart/shared'
import { StarRating } from '@corecart/ui'
import { Price } from '@corecart/ui'
import { useStore } from '@/components/providers/store-provider'
import { useCartAnimation } from '@/components/providers/cart-animation-provider'
import { useRef } from 'react'

import { formatPrice } from '@corecart/shared'

export function ProductCard({
  product,
  onQuickView,
  className,
}: {
  product: Product
  onQuickView?: (product: Product) => void
  className?: string
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const { animateAddToCart } = useCartAnimation()
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const wishlisted = isWishlisted(product.id)
  const secondImage = product.images[1] ?? product.images[0]

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('group flex flex-col', className)}
    >
      <div ref={imageContainerRef} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-soft transition-shadow duration-300 group-hover:shadow-float">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="block h-full">
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              'object-cover transition-all duration-700 ease-out',
              hovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100',
            )}
          />
          <Image
            src={secondImage || '/placeholder.svg'}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              'object-cover transition-all duration-700 ease-out',
              hovered ? 'scale-105 opacity-100' : 'scale-110 opacity-0',
            )}
          />
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-background backdrop-blur">
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full glass text-foreground shadow-soft transition-transform hover:scale-110 active:scale-95"
        >
          <Heart className={cn('size-4', wishlisted && 'fill-accent text-accent')} />
        </button>

        {/* Hover actions */}
        <div
          className={cn(
            'absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-300',
            hovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
        >
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              addToCart(product)
              animateAddToCart(product.images[0] || '/placeholder.svg', imageContainerRef)
            }}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground text-sm font-medium text-background shadow-float transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Plus className="size-4" />
            {product.inStock ? 'Quick add' : 'Sold out'}
          </button>
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label="Quick view"
              className="grid size-10 place-items-center rounded-full glass text-foreground shadow-soft transition-transform hover:scale-110 active:scale-95"
            >
              <Eye className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3.5 flex flex-1 flex-col px-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} size={12} />
            <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
          </div>
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-foreground">{formatPrice(product.price, product.currency || 'INR')}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className="text-[10px] text-muted-foreground line-through">MRP {formatPrice(product.oldPrice, product.currency || 'INR')}</span>
                <span className="text-[10px] text-success font-semibold">({Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF)</span>
              </>
            )}
          </div>
          {product.oldPrice && product.oldPrice > product.price && (
            <p className="text-[9px] font-semibold text-muted-foreground">
              You Save: {formatPrice(product.oldPrice - product.price, product.currency || 'INR')}
            </p>
          )}
          {product.freeDelivery && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <Truck className="size-3.5" /> Free Delivery
            </span>
          )}
        </div>
        {product.inStock && product.stockCount && product.stockCount <= 10 && (
          <span className="mt-1.5 text-[11px] font-medium text-accent">
            Only {product.stockCount} left
          </span>
        )}
      </div>
    </motion.article>
  )
}
