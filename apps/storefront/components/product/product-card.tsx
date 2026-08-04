'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Heart, Plus, Truck } from 'lucide-react'
import { useRef } from 'react'
import type { Product } from '@corecart/shared'
import { cn } from '@corecart/shared'
import { StarRating } from '@corecart/ui'
import { useStore } from '@/components/providers/store-provider'
import { useCartAnimation } from '@/components/providers/cart-animation-provider'
import { formatPrice } from '@corecart/shared'

export function ProductCard({
  product,
  onQuickView,
  className,
  style,
}: {
  product: Product
  onQuickView?: (product: Product) => void
  className?: string
  style?: React.CSSProperties
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const { animateAddToCart } = useCartAnimation()
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const wishlisted = isWishlisted(product.id)
  const secondImage = product.images[1] ?? product.images[0]

  return (
    // CSS-only fade-in instead of Framer Motion viewport observer per card
    <article
      style={style}
      className={cn(
        'group flex flex-col animate-fadeInUp',
        className,
      )}
    >
      <div
        ref={imageContainerRef}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-soft transition-shadow duration-300 group-hover:shadow-float"
      >
        <Link href={`/product/${product.slug}`} prefetch={false} aria-label={product.name} className="relative block h-full">
          {/* Primary image — fades out on hover via CSS group */}
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-all duration-700 ease-out scale-100 opacity-100 group-hover:scale-105 group-hover:opacity-0"
          />
          {/* Secondary image — fades in on hover via CSS group */}
          <Image
            src={secondImage || '/placeholder.svg'}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-all duration-700 ease-out scale-110 opacity-0 group-hover:scale-105 group-hover:opacity-100"
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

        {/* Hover actions — CSS group-hover transition */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
          prefetch={false}
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
    </article>
  )
}
