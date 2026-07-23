import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Gift, Heart, MapPin, Package, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'

export const metadata: Metadata = {
  title: 'Account · SmartGO',
  description: 'Manage your SmartGO account, orders, and preferences.',
}

const statusMeta: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-500/10 text-blue-500' },
  SHIPPED: { label: 'Shipped', className: 'bg-indigo-500/10 text-indigo-500' },
  DELIVERED: { label: 'Delivered', className: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
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
                  images: true
                }
              }
            }
          }
        }
      }
    }
  })

  const activeOrder = orders.find((o) => o.status === 'SHIPPED' || o.status === 'PROCESSING')
  const recent = orders.slice(0, 3)
  
  // Lifetime spend = sum of all non-cancelled orders
  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.grandTotal), 0)

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
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta[activeOrder.status]?.className || ''}`}
            >
              {statusMeta[activeOrder.status]?.label || activeOrder.status}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex -space-x-3">
              {activeOrder.items.slice(0, 3).map((item: any) => (
                <img
                  key={item.id}
                  src={item.variant?.product?.images?.[0]?.path || '/placeholder.svg'}
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
                {activeOrder.items[0]?.variant?.product?.name || activeOrder.items[0]?.productName || 'Unknown Product'}
                {activeOrder.items.length > 1 && <span className="text-muted-foreground"> and more</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeOrder.items.length} item{activeOrder.items.length !== 1 && 's'}
              </p>
            </div>
            <Link
              href={`/account/orders/${activeOrder.id}`}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
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
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {recent.map((order) => {
              const image = order.items[0]?.variant?.product?.images?.[0]?.path || '/placeholder.svg';
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <img
                      src={image}
                      alt=""
                      className="size-12 rounded-xl border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        · {order.items.length} item{order.items.length !== 1 && 's'}
                      </p>
                    </div>
                    <span
                      className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${statusMeta[order.status]?.className || ''}`}
                    >
                      {statusMeta[order.status]?.label || order.status}
                    </span>
                    <span className="text-sm font-semibold">{formatPrice(Number(order.grandTotal))}</span>
                  </Link>
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
