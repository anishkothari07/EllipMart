'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Plus, Truck } from 'lucide-react'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { StarRating } from '@/components/shared/star-rating'
import { Price } from '@/components/shared/price'
import { useStore } from '@/components/providers/store-provider'

export function ProductListRow({
  product,
  onQuickView,
}: {
  product: Product
  onQuickView?: (product: Product) => void
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const wishlisted = isWishlisted(product.id)

  return (
    <article className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft transition-shadow hover:shadow-float sm:gap-5 sm:p-4">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40"
      >
        <Image
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="160px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-accent"
          >
            <Heart className={cn('size-4', wishlisted && 'fill-accent text-accent')} />
          </button>
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-0.5 text-base font-medium text-foreground transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-2">
          <StarRating rating={product.rating} size={13} />
          <span className="text-xs text-muted-foreground">
            {product.rating} · {product.reviewCount} reviews
          </span>
        </div>
        {product.description && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex flex-col gap-1">
            <Price price={product.price} oldPrice={product.oldPrice} currency={product.currency} />
            {product.freeDelivery && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Truck className="size-3.5" /> Free delivery
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => addToCart(product)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background shadow-soft transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Plus className="size-4" />
            {product.inStock ? 'Add to bag' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  )
}
