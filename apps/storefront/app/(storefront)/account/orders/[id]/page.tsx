export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Banknote, Check, CircleDashed, MapPin, Package, Truck, XCircle, Clock } from 'lucide-react'
import { 
  formatPrice, 
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  OrderStatus,
  PaymentStatus,
  getEstimatedDeliveryDate,
  getDeliveryMessage,
  getPaymentPresentation,
  getOrderProductImage,
  getOrderProductName,
  cn 
} from '@corecart/shared'
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
    title: `Order ${id} · EllipMart`,
    description: `Details and tracking for order ${id}.`,
  }
}

const TRACKING_STEPS: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED'
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
                include: {
                  images: {
                    include: { media: true },
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  }
                }
              }
            }
          }
        }
      },
      payment: true,
      timeline: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!order) notFound()

  const isCancelled = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status)
  
  // Find current step index based on timeline or status
  const currentStatusIdx = TRACKING_STEPS.indexOf(order.status as OrderStatus)

  // Map flat address columns back to an address object for the view
  const address = {
    fullName: order.shippingName,
    phone: order.shippingPhone,
    street: order.shippingStreet,
    city: order.shippingCity,
    state: order.shippingState,
    postalCode: order.shippingPostalCode,
    country: order.shippingCountry,
  }

  const cancellableStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING']
  const canCancel = cancellableStatuses.includes(order.status)

  const estDate = getEstimatedDeliveryDate(order.createdAt.toISOString(), order.estimatedDelivery);
  const latestTimeline = order.timeline.length ? order.timeline[order.timeline.length - 1] : null;
  const deliveredAt = order.status === 'DELIVERED' && latestTimeline?.status === 'DELIVERED' ? latestTimeline.createdAt : null;
  const deliveryMsg = getDeliveryMessage(
    order.status as OrderStatus,
    estDate,
    deliveredAt?.toISOString(),
    order.payment?.paymentMethodCode // COD-aware
  );
  const paymentPresentation = order.payment
    ? getPaymentPresentation(order.payment.paymentMethodCode, order.payment.status)
    : null;

  // For PENDING_PAYMENT + COD: treat as CONFIRMED for tracking progress display
  const isCodLegacy = order.status === 'PENDING_PAYMENT' && order.payment?.paymentMethodCode === 'COD';
  const displayStatus = isCodLegacy ? 'CONFIRMED' : order.status;
  const displayStatusIdx = TRACKING_STEPS.indexOf(displayStatus as OrderStatus);

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
            <h1 className="font-serif text-3xl font-medium tracking-tight">Order {order.orderNumber || order.id.slice(0,8)}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              Placed{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {paymentPresentation && (
              <span className={`rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${paymentPresentation.badgeClass}`}>
                {paymentPresentation.isCod && <Banknote className="size-3.5" />}
                {paymentPresentation.methodLabel}: {paymentPresentation.statusLabel}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${isCodLegacy ? 'bg-primary/10 text-primary' : ORDER_STATUS_MAP[order.status as OrderStatus]?.className || ''}`}
            >
              Order: {isCodLegacy ? 'Placed' : ORDER_STATUS_MAP[order.status as OrderStatus]?.label || order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking timeline */}
      {!isCancelled ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4" /> 
            <span>{deliveryMsg}</span>
          </div>
          <div className="flex items-start justify-between">
            {TRACKING_STEPS.map((stepKey, i) => {
              // Find if this step exists in timeline
              const timelineEvent = order.timeline.find((t: any) => t.status === stepKey);
              
              // Use displayStatusIdx so COD orders at PENDING_PAYMENT show CONFIRMED step highlighted
              const done = !!timelineEvent || (displayStatusIdx >= 0 && i <= displayStatusIdx);
              const isActive = (displayStatusIdx === i) || (!timelineEvent && displayStatusIdx < 0 && i === 0 && !['PENDING_PAYMENT', 'CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status));
              
              const stepInfo = ORDER_STATUS_MAP[stepKey];
              let Icon = CircleDashed;
              if (stepKey === 'DELIVERED') Icon = Truck;
              else if (stepKey === 'SHIPPED') Icon = Package;
              else if (done) Icon = Check;
              
              return (
                <div key={stepKey} className="flex flex-1 flex-col items-center gap-3 text-center relative group">
                  <div className="flex w-full items-center">
                    <span
                      className={cn(
                        'h-0.5 flex-1',
                        i === 0 ? 'bg-transparent' : done ? 'bg-foreground' : 'bg-border',
                      )}
                    />
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors',
                        done || isActive
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-muted-foreground',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span
                      className={cn(
                        'h-0.5 flex-1',
                        i === TRACKING_STEPS.length - 1
                          ? 'bg-transparent'
                          : (done && i < displayStatusIdx)
                            ? 'bg-foreground'
                            : 'bg-border',
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={cn('text-xs font-semibold', !(done || isActive) && 'text-muted-foreground')}>
                      {stepInfo?.label || stepKey}
                    </span>
                    {timelineEvent && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(timelineEvent.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        <br/>
                        {new Date(timelineEvent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 flex flex-col gap-2">
          <p className="text-sm font-semibold text-destructive flex items-center gap-2">
            <XCircle className="size-4" /> Order {order.status.toLowerCase()}
          </p>
          <p className="text-xs text-destructive/80">
            This order was cancelled. If you were charged, a refund has been issued to your original
            payment method.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Items</h2>
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {order.items.map((line: any) => {
              const productName = getOrderProductName(line)
              const price = Number(line.unitPrice || 0)
              const image = getOrderProductImage(line)
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
                    {line.brandName || line.variant?.product?.brand || 'Brand'}
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

          {/* Payment info card */}
          {paymentPresentation && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold">Payment</h2>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{paymentPresentation.methodLabel}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentPresentation.badgeClass}`}>
                    {paymentPresentation.statusLabel}
                  </span>
                </div>
                {paymentPresentation.isCod && !paymentPresentation.isPaid && (
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    💵 Pay {formatPrice(Number(order.grandTotal))} when your order arrives
                  </p>
                )}
                {paymentPresentation.isCod && paymentPresentation.isPaid && order.payment?.paidAt && (
                  <p className="text-xs text-muted-foreground">
                    Collected on {new Date(order.payment.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {!paymentPresentation.isCod && paymentPresentation.isPaid && (
                  <p className="text-xs text-muted-foreground">Payment received ✓</p>
                )}
              </div>
            </div>
          )}

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

      {/* Cancel Order */}
      {canCancel && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-destructive">Cancel this order?</p>
            <p className="text-xs text-muted-foreground mt-0.5">You can cancel before it is packed or shipped.</p>
          </div>
          <form action={`/api/v1/orders/${order.id}/cancel`} method="POST">
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-destructive/30 bg-background px-5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <XCircle className="size-3.5" />
              Cancel Order
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
