export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Gift, Heart, MapPin, Package, Truck, Clock } from 'lucide-react'
import { 
  formatPrice, 
  ORDER_STATUS_MAP, 
  OrderStatus,
  getEstimatedDeliveryDate,
  getDeliveryMessage,
  getPaymentPresentation,
  getOrderProductImage,
  getOrderProductName
} from '@corecart/shared'
import { getCurrentUser } from '@corecart/shared/src/auth'
import { prisma } from '@corecart/database'

export const metadata: Metadata = {
  title: 'Account · EllipMart',
  description: 'Manage your EllipMart account, orders, and preferences.',
}

export default async function AccountDashboardPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/auth/login')
  }

  // Fetch real orders from database
  const orders = await prisma.order.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: 'desc' },
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
                    take: 1
                  }
                }
              }
            }
          }
        }
      },
      payment: true,
      timeline: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  const activeOrder = orders.find(
    (o: typeof orders[number]) => o.status === 'SHIPPED' || o.status === 'PROCESSING' || o.status === 'PACKED' || o.status === 'CONFIRMED'
  )
  const recent = orders.slice(0, 3)
  
  // Lifetime spend = sum of all successful orders
  const excludedStatuses = ['CANCELLED', 'RETURNED', 'REFUNDED']
  const totalSpent = orders
    .filter((o: typeof orders[number]) => !excludedStatuses.includes(o.status))
    .reduce((sum: number, o: typeof orders[number]) => sum + Number(o.grandTotal), 0)

  const stats = [
    { label: 'Total orders', value: orders.length, icon: Package },
    { label: 'Lifetime spend', value: formatPrice(totalSpent), icon: Gift },
    { label: 'Reward points', value: "0", icon: Heart }, // Reward points system not yet implemented in DB
  ]

  const memberSince = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          Hello, {currentUser?.firstName ?? ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentUser?.role ?? "User"} member since {memberSince}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <s.icon className="size-5 text-accent" />
            <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active shipment */}
      {activeOrder && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-accent" />
              <h2 className="font-medium">Latest shipment</h2>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_MAP[activeOrder.status as OrderStatus]?.className || ''}`}
            >
              {ORDER_STATUS_MAP[activeOrder.status as OrderStatus]?.label || activeOrder.status}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex -space-x-3">
              {activeOrder.items.slice(0, 3).map((item: any) => (
                <img
                  key={item.id}
                  src={getOrderProductImage(item)}
                  alt=""
                  className="size-14 rounded-xl border-2 border-card object-cover"
                />
              ))}
              {activeOrder.items.length > 3 && (
                <div className="grid size-14 place-items-center rounded-xl border-2 border-card bg-muted text-xs font-medium">
                  +{activeOrder.items.length - 3}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {getOrderProductName(activeOrder.items[0])}
                {activeOrder.items.length > 1 && <span className="text-muted-foreground"> and more</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeOrder.items.length} item{activeOrder.items.length !== 1 && 's'}
              </p>
            </div>
            <Link
              href={`/account/orders/${activeOrder.id}`}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-background"
            >
              Track <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Package className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">When you place orders, they will appear here.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {recent.map((order: typeof orders[number]) => {
              const image = getOrderProductImage(order.items[0]);
              const estDate = getEstimatedDeliveryDate(order.createdAt.toISOString(), order.estimatedDelivery);
              
              const latestTimeline = order.timeline?.[0];
              const deliveredAt = order.status === 'DELIVERED' && latestTimeline?.status === 'DELIVERED' ? latestTimeline.createdAt : null;
              
              const deliveryMsg = getDeliveryMessage(
                order.status as OrderStatus,
                estDate,
                deliveredAt?.toISOString(),
                order.payment?.paymentMethodCode
              );
              
              const isCancelled = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status);
              const isCodLegacy = order.status === 'PENDING_PAYMENT' && order.payment?.paymentMethodCode === 'COD';
              // COD orders at PENDING_PAYMENT should show as active (they are placed, not failed)
              const isActive = !isCancelled && order.status !== 'DELIVERED' &&
                (order.status !== 'PENDING_PAYMENT' || isCodLegacy);
              
              // For status badge: COD legacy shows "Order placed" not "Payment pending"
              const statusLabel = isCodLegacy
                ? 'Order placed'
                : ORDER_STATUS_MAP[order.status as OrderStatus]?.label || order.status;
              const statusClass = isCodLegacy
                ? 'bg-primary/10 text-primary'
                : ORDER_STATUS_MAP[order.status as OrderStatus]?.className || '';
              
              return (
                <li key={order.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold">Order #{order.orderNumber || order.id.slice(0, 8)}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })} • {order.items.length} item{order.items.length !== 1 && 's'}
                      </span>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 py-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      <img
                        src={image}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium transition-colors">
                        {getOrderProductName(order.items[0])}
                        {order.items.length > 1 && <span className="text-muted-foreground"> and more</span>}
                      </p>
                      
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span className={isCancelled ? "line-through opacity-70" : ""}>{deliveryMsg}</span>
                      </div>
                      
                      {isActive && (
                        <div className="mt-2.5 flex items-center gap-1">
                          {['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((stepStatus, idx) => {
                            const statuses = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
                            const currentIdx = statuses.indexOf(order.status);
                            const done = idx <= currentIdx;
                            return (
                              <div key={stepStatus} className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                                {done && <div className="h-full bg-foreground w-full" />}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{formatPrice(Number(order.grandTotal))}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      View order <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/addresses"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
        >
          <MapPin className="size-5 text-accent" />
          <div>
            <p className="text-sm font-medium">Addresses</p>
            <p className="text-xs text-muted-foreground">Manage shipping locations</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-muted-foreground" />
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
        >
          <Heart className="size-5 text-accent" />
          <div>
            <p className="text-sm font-medium">Wishlist</p>
            <p className="text-xs text-muted-foreground">Saved for later</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}
