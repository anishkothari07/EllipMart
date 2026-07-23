'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Heart, ShoppingBag, Truck, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { StarRating } from '@/components/shared/star-rating'
import { Price } from '@/components/shared/price'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import { useStore } from '@/components/providers/store-provider'

export function QuickView({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState<string | undefined>()

  useEffect(() => {
    setActiveImage(0)
    setQty(1)
    setSize(undefined)
  }, [product])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sizeVariant = product?.variants?.find((v) => v.type === 'size')

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-border bg-popover shadow-float md:grid-cols-2"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full glass text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col gap-3 bg-muted/40 p-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-card">
                <Image
                  src={product.images[activeImage] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        'relative size-16 overflow-hidden rounded-xl border-2 bg-card transition-colors',
                        i === activeImage ? 'border-foreground' : 'border-transparent',
                      )}
                    >
                      <Image src={img || '/placeholder.svg'} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {product.brand}
              </span>
              <h2 className="mt-1 font-serif text-2xl leading-tight text-foreground">{product.name}</h2>
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={product.rating} size={14} />
                <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
              </div>
              <div className="mt-4">
                <Price price={product.price} oldPrice={product.oldPrice} currency={product.currency} size="lg" />
              </div>
              {product.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              )}

              {sizeVariant && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizeVariant.options.map((opt) => (
                      <button
                        key={opt.id}
                        disabled={!opt.available}
                        onClick={() => setSize(opt.label)}
                        className={cn(
                          'grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                          size === opt.label
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground/40',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <QuantityStepper value={qty} onChange={setQty} />
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={() => {
                    addToCart(product, { quantity: qty, size })
                    onClose()
                  }}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag className="size-4" />
                  {product.inStock ? 'Add to bag' : 'Sold out'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Add to wishlist"
                  className="grid size-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                >
                  <Heart className={cn('size-4', isWishlisted(product.id) && 'fill-accent text-accent')} />
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
                {product.freeDelivery && (
                  <span className="flex items-center gap-2">
                    <Truck className="size-4" /> Free delivery &amp; returns
                  </span>
                )}
                {product.inStock && (
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-success" /> In stock, ready to ship
                  </span>
                )}
              </div>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="mt-5 text-sm font-medium text-foreground underline underline-offset-4"
              >
                View full details
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
