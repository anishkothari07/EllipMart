'use client'

import { Check, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

const FREE_SHIP_THRESHOLD = 75

export function useOrderTotals(subtotal: number, discountPct: number) {
  const discount = (subtotal * discountPct) / 100
  const afterDiscount = subtotal - discount
  const shipping = afterDiscount >= FREE_SHIP_THRESHOLD || afterDiscount === 0 ? 0 : 8
  const tax = Math.round(afterDiscount * 0.08 * 100) / 100
  const total = afterDiscount + shipping + tax
  return { discount, shipping, tax, total }
}

export function OrderSummary({
  subtotal,
  children,
  showCoupon = true,
  onDiscountChange,
}: {
  subtotal: number
  children?: React.ReactNode
  showCoupon?: boolean
  onDiscountChange?: (pct: number) => void
}) {
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState<{ code: string; discountPct: number } | null>(null)
  const [error, setError] = useState('')

  const discountPct = applied?.discountPct ?? 0
  const { discount, shipping, tax, total } = useOrderTotals(subtotal, discountPct)

  const apply = async () => {
    try {
      const res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal })
      });
      const data = await res.json();
      
      if (data.success) {
        setApplied({ code: data.data.code, discountPct: data.data.discountType === 'PERCENTAGE' ? data.data.discountValue : 0 });
        setError('');
        // Since the backend handles robust types (fixed, percentage, free_shipping), 
        // the frontend logic useOrderTotals should ideally be updated, 
        // but passing discountPct keeps it compatible for now if it's a percentage.
        // Or if it's FIXED, we can hack it to a percentage for useOrderTotals:
        const pct = data.data.discountType === 'PERCENTAGE' 
          ? data.data.discountValue 
          : (data.data.discountValue / subtotal) * 100;
          
        onDiscountChange?.(pct);
      } else {
        setError(data.message || 'Invalid or expired code');
      }
    } catch (e) {
      setError('Error validating code');
    }
  }

  const remove = () => {
    setApplied(null)
    setCode('')
    onDiscountChange?.(0)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="text-lg font-semibold">Order summary</h2>

      {showCoupon && (
        <div className="mt-5">
          {applied ? (
            <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-success">
                <Tag className="size-4" /> {applied.code} applied
              </span>
              <button
                onClick={remove}
                aria-label="Remove coupon"
                className="grid size-6 place-items-center rounded-full text-success hover:bg-success/10"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError('')
                  }}
                  placeholder="Discount code"
                  className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground/30"
                />
                <button
                  onClick={apply}
                  disabled={!code.trim()}
                  className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {/* Mock suggestions removed */}
              </div>
            </div>
          )}
        </div>
      )}

      <dl className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount ({discountPct}%)</dt>
            <dd className="font-medium">-{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className={cn('font-medium', shipping === 0 && 'text-success')}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated tax</dt>
          <dd className="font-medium">{formatPrice(tax)}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-xl font-semibold">{formatPrice(total)}</dd>
        </div>
      </dl>

      {children}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5 text-success" /> Secure checkout · encrypted payment
      </p>
    </div>
  )
}
