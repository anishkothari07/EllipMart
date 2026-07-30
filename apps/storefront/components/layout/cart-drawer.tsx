'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useStore } from '@/components/providers/store-provider'
import { formatPrice } from '@corecart/shared'
import { cn } from '@corecart/shared'
import { motionPresets } from '@corecart/shared/src/motion/presets'
import { AnimatedNumber } from '@corecart/ui'

const FREE_SHIP_THRESHOLD = 75

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    addToCart,
  } = useStore()

  const [lastRemoved, setLastRemoved] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRemove = (productId: string, itemObj: any) => {
    setLastRemoved(itemObj)
    removeFromCart(productId)
  }

  const handleUndo = () => {
    if (lastRemoved) {
      addToCart(lastRemoved.product)
      updateQuantity(lastRemoved.product.id, lastRemoved.quantity)
      setLastRemoved(null)
    }
  }

  const simulateRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - cartSubtotal)
  const progress = Math.min(100, (cartSubtotal / FREE_SHIP_THRESHOLD) * 100)

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-[80]" initial="closed" animate="open" exit="closed">
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            variants={motionPresets.fadeIn}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-float"
            variants={motionPresets.drawer}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                <h2 className="text-base font-semibold">Your bag</h2>
                <span className="text-sm text-muted-foreground">({cart.length})</span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {cart.length > 0 ? (
              <>
                <div className="border-b border-border px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    {remaining > 0 ? (
                      <>
                        You&apos;re {formatPrice(remaining)} away from{' '}
                        <span className="font-semibold text-foreground">free shipping</span>
                      </>
                    ) : (
                      <span className="font-semibold text-success">
                        You&apos;ve unlocked free shipping!
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 relative">
                  {/* Pull to Refresh handle */}
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 80 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.y > 60) simulateRefresh()
                    }}
                    className="flex justify-center py-2 text-xs text-muted-foreground cursor-grab active:cursor-grabbing border-b border-border/40 select-none mb-3 bg-muted/20 rounded-xl"
                  >
                    {isRefreshing ? '🔄 Refreshing...' : '👇 Pull down to refresh cart'}
                  </motion.div>

                  {/* Undo Delete Notification */}
                  {lastRemoved && (
                    <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-foreground text-background text-xs font-semibold shadow-soft">
                      <span>Item removed from cart</span>
                      <button onClick={handleUndo} className="underline text-accent font-bold px-2 py-1">
                        Undo
                      </button>
                    </div>
                  )}

                  <ul className="relative space-y-4">
                    <AnimatePresence initial={false}>
                      {cart.map((item) => (
                        <motion.li
                          layout
                          key={item.product.id}
                          className="relative overflow-hidden rounded-2xl border border-border/80 bg-card"
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.95, y: -12, paddingBottom: 0, marginBottom: 0, overflow: "hidden" }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          {/* Background swipe-to-delete layer */}
                          <div className="absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-center text-white text-xs font-bold rounded-r-2xl pointer-events-none">
                            Swipe to Delete
                          </div>

                          <motion.div
                            drag="x"
                            dragDirectionLock
                            dragConstraints={{ left: -100, right: 0 }}
                            dragElastic={{ left: 0.15, right: 0 }}
                            onDragEnd={(e, info) => {
                              if (info.offset.x < -80) {
                                handleRemove(item.product.id, item)
                                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                  navigator.vibrate(80)
                                }
                              }
                            }}
                            className="relative z-10 flex gap-3 bg-card p-3"
                          >
                            <Link
                              href={`/product/${item.product.slug}`}
                              onClick={() => setCartOpen(false)}
                              className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                            >
                              <Image
                                src={item.product.images[0] || '/placeholder.svg'}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{item.product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.product.brand}
                                    {item.selectedSize ? ` · ${item.selectedSize}` : ''}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold">
                                  {formatPrice(item.product.price * item.quantity, item.product.currency)}
                                </span>
                              </div>
                              <div className="mt-auto flex items-center justify-between pt-2">
                                <div className="flex items-center rounded-full border border-border bg-background">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    aria-label="Decrease quantity"
                                    className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                                  >
                                    <Minus className="size-3.5" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    aria-label="Increase quantity"
                                    className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="size-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      toggleWishlist(item.product)
                                      handleRemove(item.product.id, item)
                                    }}
                                    aria-label="Move to wishlist"
                                    className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-accent"
                                  >
                                    <Heart className="size-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemove(item.product.id, item)}
                                    aria-label="Remove item"
                                    className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="border-t border-border px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-lg font-semibold">
                      <AnimatedNumber value={cartSubtotal} format={(v) => formatPrice(v)} />
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Checkout · <AnimatedNumber value={cartSubtotal} format={(v) => formatPrice(v)} />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    className="mt-2 flex h-11 items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-muted"
                  >
                    View bag
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="grid size-20 place-items-center rounded-full bg-muted">
                  <ShoppingBag className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Your bag is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discover something you&apos;ll love.
                  </p>
                </div>
                <Link
                  href="/category/all"
                  onClick={() => setCartOpen(false)}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background',
                  )}
                >
                  Start shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
