'use client'

import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Heart,
  MapPin,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@corecart/shared'
import { cn } from '@corecart/shared'
import { formatPrice, discountPct } from '@corecart/shared'
import { Container } from '@corecart/ui'
import { Breadcrumb } from '@corecart/ui'
import { StarRating } from '@corecart/ui'
import { Price } from '@corecart/ui'
import { QuantityStepper } from '@corecart/ui'
import { ProductGallery } from './product-gallery'
import { ProductReviews } from './product-reviews'
import { ProductCard } from './product-card'
import { useStore } from '@/components/providers/store-provider'

const faqs = [
  {
    q: 'What is the delivery time?',
    a: 'Standard delivery takes 3-5 business days. Express delivery is available at checkout and arrives within 1-2 business days.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer easy 30-day returns on all unworn items in their original packaging. Returns are always free.',
  },
  {
    q: 'Is this item covered by warranty?',
    a: 'Yes, this product includes a 2-year limited manufacturer warranty covering defects in materials and workmanship.',
  },
]

const offers = [
  { code: 'WELCOME10', label: 'Get 10% off your first order' },
  { code: 'DIWALI20', label: '20% off orders over ₹15,000' },
  { label: 'Free delivery on orders over ₹999' },
]

type Tab = 'details' | 'specifications' | 'reviews' | 'faqs'

export function ProductDetail({
  product,
  related,
  categoryName,
}: {
  product: Product
  related: Product[]
  categoryName: string
}) {
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useStore()
  const router = useRouter()
  const colorVariant = product.variants?.find((v) => v.type === 'color')
  const sizeVariant = product.variants?.find((v) => v.type === 'size')

  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(colorVariant?.options[0]?.label)
  const [size, setSize] = useState<string | undefined>()
  const [pincode, setPincode] = useState('')
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('details')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const wishlisted = isWishlisted(product.id)
  const discount = discountPct(product.price, product.oldPrice)

  const checkDelivery = async () => {
    if (pincode.trim().length === 6) {
      try {
        const res = await fetch(`/api/v1/pincode/${pincode}`)
        const json = await res.json()
        if (json.success && json.data.isServiced) {
          const { city, state, promise } = json.data
          let msg = `Delivers to ${city}, ${state}`
          if (promise) {
            msg += ` — ${promise.isTomorrow ? 'Get it Tomorrow' : `Delivery by ${promise.dateString}`}`
            if (promise.isCOD) {
              msg += ` (COD Available)`
            }
          }
          setDeliveryMsg(msg)
        } else {
          setDeliveryMsg("Sorry, delivery is not available for this PIN code.")
        }
      } catch (e) {
        setDeliveryMsg("Failed to check delivery serviceability.")
      }
    } else {
      setDeliveryMsg("Please enter a valid 6-digit PIN code.")
    }
  }

  const handleAdd = () => addToCart(product, { quantity: qty, color, size })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'reviews', label: `Reviews (${product.reviewCount})` },
    { key: 'faqs', label: 'FAQs' },
  ]

  return (
    <div className="pb-36 sm:pb-24">
      <Container className="pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: categoryName, href: `/category/${product.category}` },
            { label: product.name },
          ]}
        />
      </Container>

      <Container className="mt-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Buy box */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {product.brand}
              </span>
              {product.badge && (
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  {product.badge}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-balance font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating} size={16} showValue />
              <a href="#reviews" className="text-sm text-muted-foreground underline underline-offset-2">
                {product.reviewCount} reviews
              </a>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Price price={product.price} oldPrice={product.oldPrice} currency={product.currency} size="lg" />
              {discount > 0 && (
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  Save {discount}%
                </span>
              )}
            </div>
            <p className="mt-2 text-xs font-semibold text-accent flex items-center gap-1.5">
              <span>💳</span> EMI starts from {formatPrice(Math.round(product.price / 12), product.currency || 'INR')}/month. No Cost EMI available.
            </p>

            {product.description && (
              <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {/* Color variant */}
            {colorVariant && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium">
                  Color: <span className="text-muted-foreground">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {colorVariant.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setColor(opt.label)}
                      aria-label={opt.label}
                      className={cn(
                        'grid size-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                        color === opt.label ? 'ring-foreground' : 'ring-transparent',
                      )}
                    >
                      <span
                        className="size-7 rounded-full border border-border"
                        style={{ backgroundColor: opt.value }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size variant */}
            {sizeVariant && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Size</p>
                  <button className="text-xs text-muted-foreground underline underline-offset-2">
                    Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeVariant.options.map((opt) => (
                    <button
                      key={opt.id}
                      disabled={!opt.available}
                      onClick={() => setSize(opt.label)}
                      className={cn(
                        'grid h-11 min-w-11 place-items-center rounded-xl border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
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

            {/* Stock */}
            <div className="mt-6 flex items-center gap-2 text-sm">
              {product.inStock ? (
                <>
                  <Check className="size-4 text-success" />
                  <span className="text-success">In stock</span>
                  {product.stockCount && product.stockCount <= 10 && (
                    <span className="text-muted-foreground">· only {product.stockCount} left</span>
                  )}
                </>
              ) : (
                <span className="text-destructive">Currently out of stock</span>
              )}
            </div>

            {/* ════════════════════════════════════════
                MOBILE ACTIONS  (hidden at sm and above)
                Row 1: [- 1 +]
                Row 2: [🛍 Add to bag ─ full width]
                Row 3: [❤️]  [🔗]  ← flex row, side-by-side
                Row 4: [Buy it now ─ full width]
                ════════════════════════════════════════ */}
            <div className="mt-6 flex flex-col gap-3 sm:hidden">
              <QuantityStepper value={qty} onChange={setQty} className="self-start" />
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => {
                  handleAdd()
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80)
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                <ShoppingBag className="size-4" />
                {product.inStock ? 'Add to bag' : 'Sold out'}
              </button>
              {/* Heart + Share — always side-by-side */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(product)
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80)
                  }}
                  aria-label="Add to wishlist"
                  className="grid size-12 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
                >
                  <Heart className={cn('size-5', wishlisted && 'fill-accent text-accent')} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      try { await navigator.share({ title: product.name, text: `Check out ${product.name} on EllipMart India!`, url: window.location.href }) } catch {}
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                    }
                  }}
                  aria-label="Share"
                  className="grid size-12 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
                >
                  <Share2 className="size-5" />
                </button>
              </div>
              {product.inStock && (
                <button
                  type="button"
                  onClick={() => {
                    handleAdd()
                    setCartOpen(false)
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([80, 50, 80])
                    router.push('/checkout')
                  }}
                  className="flex h-12 w-full items-center justify-center rounded-full border border-foreground text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                >
                  Buy it now
                </button>
              )}
            </div>

            {/* ════════════════════════════════════════
                DESKTOP ACTIONS  (hidden below sm)
                [- 1 +]  [🛍 Add to bag]  [❤️]  [🔗]
                ════════════════════════════════════════ */}
            <div className="mt-6 hidden sm:flex items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} className="shrink-0" />
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => {
                  handleAdd()
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80)
                }}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <ShoppingBag className="size-4" />
                {product.inStock ? 'Add to bag' : 'Sold out'}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product)
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80)
                }}
                aria-label="Add to wishlist"
                className="grid size-12 shrink-0 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
              >
                <Heart className={cn('size-5', wishlisted && 'fill-accent text-accent')} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    try { await navigator.share({ title: product.name, text: `Check out ${product.name} on EllipMart India!`, url: window.location.href }) } catch {}
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                aria-label="Share"
                className="grid size-12 shrink-0 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
              >
                <Share2 className="size-5" />
              </button>
            </div>
            {product.inStock && (
              <button
                onClick={() => {
                  handleAdd()
                  setCartOpen(false)
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([80, 50, 80])
                  router.push('/checkout')
                }}
                className="mt-3 hidden sm:flex h-12 w-full items-center justify-center rounded-full border border-foreground text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                Buy it now
              </button>
            )}


            {/* ── Mobile Sticky Action Bar — sits above the 64px bottom nav ── */}
            <div className="fixed bottom-16 inset-x-0 z-40 sm:hidden flex items-center gap-2 px-3 py-2.5 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product)
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80)
                }}
                aria-label="Wishlist"
                className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card"
              >
                <Heart className={cn('size-5', wishlisted && 'fill-accent text-accent')} />
              </button>
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => {
                  handleAdd()
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80)
                }}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground text-xs font-semibold text-background disabled:opacity-50"
              >
                <ShoppingBag className="size-3.5" /> Add to Cart
              </button>
              {product.inStock && (
                <button
                  type="button"
                  onClick={() => {
                    handleAdd()
                    setCartOpen(false)
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([80, 50, 80])
                    router.push('/checkout')
                  }}
                  className="flex h-12 flex-1 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Delivery check */}
            <div className="mt-6 rounded-2xl border border-border p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4" /> Check delivery
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter postal code"
                  className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-foreground/30"
                />
                <button
                  onClick={checkDelivery}
                  className="h-11 rounded-full bg-muted px-5 text-sm font-medium transition-colors hover:bg-muted/70"
                >
                  Check
                </button>
              </div>
              {deliveryMsg && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
                  <Check className="size-4" /> {deliveryMsg}
                </p>
              )}
            </div>

            {/* Device Exchange Program */}
            <div className="mt-6 rounded-2xl border border-border p-4 bg-secondary/20">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <span>🔄</span> Exchange old device
              </p>
              <div className="text-xs text-muted-foreground mb-3">
                Save up to {formatPrice(18000, product.currency || 'INR')} by exchanging your old device.
              </div>
              <button 
                onClick={() => alert("Exchange program option selected! Old device verification details will be collected at checkout.")}
                className="h-10 w-full rounded-full border border-primary/20 bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Exchange old device & get discount
              </button>
            </div>

            {/* Offers */}
            <div className="mt-6">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Tag className="size-4" /> Bank Offers & EMI
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  { label: 'HDFC Bank Credit Cards: 10% Instant Discount', code: 'HDFC10' },
                  { label: 'ICICI Bank Cards: Flat 5% Cashback on min order of ' + formatPrice(5000, product.currency || 'INR'), code: 'ICICI5' },
                  { label: 'SBI Card: 10% Instant Discount on SBI Credit Card transactions', code: 'SBI10' },
                  { label: 'No Cost EMI starts from ' + formatPrice(Math.round(product.price / 6), product.currency || 'INR') + '/month', code: 'NO_COST_EMI' },
                ].map((offer, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-xs"
                  >
                    <span className="text-muted-foreground font-medium">{offer.label}</span>
                    {offer.code && (
                      <span className="rounded-md border border-dashed border-border bg-background px-2 py-1 text-[10px] font-bold">
                        {offer.code}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
              {[
                { icon: Truck, label: 'Free delivery' },
                { icon: RotateCcw, label: '30-day returns' },
                { icon: ShieldCheck, label: '2-year warranty' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                  <item.icon className="size-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div id="reviews" className="mt-16 scroll-mt-24 border-t border-border pt-10">
          <div className="no-scrollbar mb-8 flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'relative shrink-0 px-4 py-3 text-sm font-medium transition-colors',
                  tab === t.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                {tab === t.key && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground"
                  />
                )}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="leading-relaxed text-muted-foreground">{product.description}</p>
              </div>
              {product.highlights && (
                <ul className="flex flex-col gap-3">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'specifications' && (
            <div className="max-w-2xl">
              {product.specifications && product.specifications.length > 0 ? (
                <dl className="divide-y divide-border rounded-2xl border border-border">
                  {product.specifications.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-5 py-3.5">
                      <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                      <dd className="text-sm font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No specifications listed.</p>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <ProductReviews
              rating={product.rating}
              reviewCount={product.reviewCount}
              reviews={product.reviews}
            />
          )}

          {tab === 'faqs' && (
            <div className="max-w-2xl divide-y divide-border rounded-2xl border border-border">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-sm font-medium">{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        openFaq === i && 'rotate-180',
                      )}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
