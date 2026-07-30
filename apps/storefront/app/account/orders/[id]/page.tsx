import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Check, CircleDashed, MapPin, Package, Truck } from 'lucide-react'
import { formatPrice } from '@corecart/shared'
import { cn } from '@corecart/shared'
import { prisma } from '@corecart/database'
import { getCurrentUser } from '@corecart/shared/src/auth'

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order ${id} · SmartGO`,
    description: `Details and tracking for order ${id}.`,
  }
}

export type OrderStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PENDING'

const statusMeta: Record<string, { label: string; className: string }> = {
  PROCESSING: { label: 'Processing', className: 'bg-primary/10 text-primary' },
  SHIPPED: { label: 'Shipped', className: 'bg-info/10 text-info' },
  DELIVERED: { label: 'Delivered', className: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
  PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
}

const steps: { key: OrderStatus; label: string; icon: typeof Package }[] = [
  { key: 'PROCESSING', label: 'Order placed', icon: Check },
  { key: 'SHIPPED', label: 'Shipped', icon: Package },
  { key: 'DELIVERED', label: 'Delivered', icon: Truck },
]

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const order = await prisma.order.findUnique({
    where: { id, userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: true }
              }
            }
          }
        }
      }
    }
  })

  if (!order) notFound()

  const isCancelled = order.status === 'CANCELLED'
  const activeIndex = steps.findIndex((s) => s.key === order.status)

  // Map snapshot JSON back to something usable
  const address = order.shippingAddress as any || {}

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/account/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">Order {order.orderNumber}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusMeta[order.status]?.className || ''}`}
          >
            {statusMeta[order.status]?.label || order.status}
          </span>
        </div>
      </div>

      {/* Tracking timeline */}
      {!isCancelled ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const done = i <= activeIndex
              const Icon = done ? step.icon : CircleDashed
              return (
                <div key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex w-full items-center">
                    <span
                      className={cn(
                        'h-0.5 flex-1',
                        i === 0 ? 'bg-transparent' : done ? 'bg-success' : 'bg-border',
                      )}
                    />
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full border-2',
                        done
                          ? 'border-success bg-success text-background'
                          : 'border-border bg-card text-muted-foreground',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span
                      className={cn(
                        'h-0.5 flex-1',
                        i === steps.length - 1
                          ? 'bg-transparent'
                          : i < activeIndex
                            ? 'bg-success'
                            : 'bg-border',
                      )}
                    />
                  </div>
                  <span className={cn('text-xs font-medium', !done && 'text-muted-foreground')}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          This order was cancelled. If you were charged, a refund has been issued to your original
          payment method.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Items</h2>
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {order.items.map((line: any) => {
              const productName = line.productName || line.variant?.product?.name || 'Unknown'
              const price = Number(line.unitPrice || 0)
              const image = line.variant?.product?.images?.[0]?.path || '/placeholder.svg'
              return (
              <li key={line.id} className="flex gap-4 p-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={image}
                    alt={productName}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {line.variant?.product?.brand || 'Brand'}
                  </p>
                  <p className="text-sm font-medium transition-colors hover:text-accent">
                    {productName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Qty {line.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(price * line.quantity)}
                </span>
              </li>
            )})}
          </ul>
        </div>

        {/* Summary + address */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">
              {order.isBusinessOrder ? 'Tax Invoice (B2B)' : 'Retail Invoice'}
            </h2>
            {order.isBusinessOrder && (
              <div className="mb-3 rounded-xl bg-muted/30 p-2.5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground uppercase tracking-wider text-[9px] mb-1">GSTIN Details</p>
                <p>GSTIN: <span className="font-mono font-semibold text-foreground">{order.gstin}</span></p>
                <p>Company: <span className="font-semibold text-foreground">{order.companyName}</span></p>
              </div>
            )}
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(Number(order.subTotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{Number(order.shippingTotal) === 0 ? 'Free' : formatPrice(Number(order.shippingTotal))}</dd>
              </div>
              {order.cgstDecimal !== null && Number(order.cgstDecimal) > 0 && (
                <div className="flex justify-between font-mono text-xs">
                  <dt className="text-muted-foreground">CGST (9%)</dt>
                  <dd>+{formatPrice(Number(order.cgstDecimal))}</dd>
                </div>
              )}
              {order.sgstDecimal !== null && Number(order.sgstDecimal) > 0 && (
                <div className="flex justify-between font-mono text-xs">
                  <dt className="text-muted-foreground">SGST (9%)</dt>
                  <dd>+{formatPrice(Number(order.sgstDecimal))}</dd>
                </div>
              )}
              {order.igstDecimal !== null && Number(order.igstDecimal) > 0 && (
                <div className="flex justify-between font-mono text-xs">
                  <dt className="text-muted-foreground">IGST (18%)</dt>
                  <dd>+{formatPrice(Number(order.igstDecimal))}</dd>
                </div>
              )}
              {(!order.cgstDecimal && !order.sgstDecimal && !order.igstDecimal) && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd>{formatPrice(Number(order.taxTotal))}</dd>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(Number(order.grandTotal))}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4" /> Shipping address
            </h2>
            <address className="text-sm not-italic leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{address.fullName || 'N/A'}</span>
              <br />
              {address.street}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </address>
          </div>
        </aside>
      </div>
    </div>
  )
}
