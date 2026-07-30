'use client'

import { Heart, ShoppingBag, Trash2, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { products } from '@corecart/shared'
import { useEffect, useState } from 'react'
import { formatPrice } from '@corecart/shared'
import { Container } from '@corecart/ui'
import { Breadcrumb } from '@corecart/ui'
import { EmptyState } from '@corecart/ui'
import { QuantityStepper } from '@corecart/ui'
import { ProductCard } from '@/components/product/product-card'
import { OrderSummary } from './order-summary'
import { useStore } from '@/components/providers/store-provider'

const FREE_SHIP_THRESHOLD = 75

export function CartView() {
  const { cart, cartSubtotal, updateQuantity, removeFromCart, toggleWishlist } = useStore()
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/v1/recommendations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecommendations(data.data.slice(0, 4))
      })
      .catch(() => {})
  }, [])

  if (cart.length === 0) {
    return (
      <Container className="py-10">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Bag' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Looks like you haven't added anything yet. Let's find something you'll love."
          actionLabel="Start shopping"
          actionHref="/category/all"
        />
        <div className="mt-8">
          <h2 className="mb-6 font-serif text-2xl font-medium tracking-tight">Popular right now</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </Container>
    )
  }

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - cartSubtotal)
  const progress = Math.min(100, (cartSubtotal / FREE_SHIP_THRESHOLD) * 100)

  return (
    <Container className="py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Bag' }]} />
      <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
        Your bag ({cart.length})
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div>
          {/* Free shipping progress */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm">
              {remaining > 0 ? (
                <>
                  Add <span className="font-semibold">{formatPrice(remaining)}</span> more to unlock{' '}
                  <span className="font-semibold">free shipping</span>
                </>
              ) : (
                <span className="font-semibold text-success">You&apos;ve unlocked free shipping!</span>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {cart.map((item) => (
              <li key={item.product.id} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28"
                >
                  <Image
                    src={item.product.images[0] || '/placeholder.svg'}
                    alt={item.product.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.product.brand}
                      </span>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="block truncate text-sm font-medium transition-colors hover:text-accent"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                      </p>
                      {item.product.freeDelivery && (
                        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Truck className="size-3.5" /> Free delivery
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatPrice(item.product.price * item.quantity, item.product.currency)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => updateQuantity(item.product.id, q)}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          toggleWishlist(item.product)
                          removeFromCart(item.product.id)
                        }}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-accent"
                      >
                        <Heart className="size-4" /> Save
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Remove item"
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/category/all"
            className="mt-6 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary subtotal={cartSubtotal}>
            <Link
              href="/checkout"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Proceed to checkout
            </Link>
          </OrderSummary>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-16">
        <h2 className="mb-6 font-serif text-2xl font-medium tracking-tight">You might also like</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {recommendations.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </Container>
  )
}
