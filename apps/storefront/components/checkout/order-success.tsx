'use client'

import { Package, Truck, Receipt, Check } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Container } from '@corecart/ui'
import { SuccessDraw } from '@corecart/ui'
import { formatPrice } from '@corecart/shared'

export function OrderSuccess({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/v1/orders/${orderId}`, {
          headers: { 'x-user-id': 'mock-user-id' }
        })
        const json = await res.json()
        if (json.success) {
          setOrder(json.data)
        }
      } catch (e) {
        console.error("Order details loading failure:", e)
      }
    }
    if (orderId && orderId !== 'CC-000000') {
      loadOrder()
    }
  }, [orderId])

  const eta = new Date(Date.now() + 5 * 864e5).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Container className="flex flex-col items-center py-16 text-center lg:py-24">
      <div className="flex size-20 items-center justify-center rounded-full bg-success/5">
        <SuccessDraw size={64} color="var(--success)" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance">
        Thank you for your order!
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground text-sm">
        Your order has been placed successfully. A confirmation email with your receipt is on its way.
      </p>

      <div className="mt-8 w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-left shadow-soft">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {order?.isBusinessOrder ? 'Tax Invoice (B2B)' : 'Retail Invoice'}
            </span>
            <span className="font-mono text-sm font-bold mt-0.5 text-foreground">{orderId}</span>
          </div>
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success flex items-center gap-1">
            <Check className="size-3" /> Paid
          </span>
        </div>

        {order?.isBusinessOrder && (
          <div className="mt-4 border-b border-border pb-4 text-xs flex flex-col gap-1 bg-muted/20 p-3 rounded-2xl">
            <p className="font-semibold text-foreground uppercase tracking-wide text-[10px]">Business Billing Details</p>
            <p><span className="text-muted-foreground">GSTIN:</span> <span className="font-mono font-semibold">{order.gstin}</span></p>
            <p><span className="text-muted-foreground">Company:</span> <span className="font-semibold">{order.companyName}</span></p>
          </div>
        )}

        <div className="mt-4 flex items-start gap-3">
          <Truck className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Estimated delivery</p>
            <p className="text-sm text-muted-foreground">{eta}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2 text-xs">
          <p className="font-semibold text-foreground uppercase tracking-wide text-[10px]">Invoice Summary</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(Number(order?.subTotal || 0))}</span>
          </div>
          {order?.cgstDecimal > 0 && (
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-muted-foreground">CGST (9%)</span>
              <span>+{formatPrice(Number(order.cgstDecimal))}</span>
            </div>
          )}
          {order?.sgstDecimal > 0 && (
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-muted-foreground">SGST (9%)</span>
              <span>+{formatPrice(Number(order.sgstDecimal))}</span>
            </div>
          )}
          {order?.igstDecimal > 0 && (
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-muted-foreground">IGST (18%)</span>
              <span>+{formatPrice(Number(order.igstDecimal))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(Number(order?.shippingTotal || 0))}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm border-t border-dashed border-border pt-2 text-foreground">
            <span>Grand Total</span>
            <span>{formatPrice(Number(order?.grandTotal || 0))}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/account/orders"
          className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95"
        >
          View order
        </Link>
        <Link
          href="/category/all"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          Continue shopping
        </Link>
      </div>
    </Container>
  )
}
