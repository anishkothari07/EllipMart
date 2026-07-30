'use client'

import { Heart, ShoppingBag, Trash2, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { EmptyState } from '@corecart/ui'
import { Price } from '@corecart/ui'
import { useStore } from '@/components/providers/store-provider'

export function WishlistView() {
  const { wishlist, toggleWishlist, moveToCart } = useStore()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Wishlist</h1>
        {wishlist.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {wishlist.length} item{wishlist.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {wishlist.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
            actionLabel="Discover products"
            actionHref="/category/all"
          />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {wishlist.map((product) => (
            <li key={product.id} className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/product/${product.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28"
              >
                <Image
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {product.brand}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block truncate text-sm font-medium transition-colors hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1.5">
                      <Price
                        price={product.price}
                        oldPrice={product.oldPrice}
                        currency={product.currency}
                        size="sm"
                      />
                    </div>
                    {product.freeDelivery && (
                      <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Truck className="size-3.5" /> Free delivery
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleWishlist(product)}
                    aria-label="Remove from wishlist"
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-auto pt-3">
                  <button
                    onClick={() => moveToCart(product)}
                    disabled={!product.inStock}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <ShoppingBag className="size-4" />
                    {product.inStock ? 'Move to bag' : 'Sold out'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
