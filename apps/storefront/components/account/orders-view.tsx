'use client'

import { ArrowRight, Package, Search, Clock } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { EmptyState } from '@corecart/ui'
import { 
  formatPrice, 
  ORDER_STATUS_MAP, 
  OrderStatus,
  getEstimatedDeliveryDate,
  getDeliveryMessage,
  cn 
} from '@corecart/shared'

const filters: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
]

export function OrdersView({ initialOrders }: { initialOrders: any[] }) {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return initialOrders.filter((o) => {
      const matchStatus = filter === 'all' || o.status === filter
      const matchQuery =
        query.trim() === '' ||
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(query.toLowerCase()) ||
        o.lines.some((l: any) => l.product?.name?.toLowerCase().includes(query.toLowerCase()))
      return matchStatus && matchQuery
    })
  }, [filter, query, initialOrders])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Your orders</h1>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order number or product"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              filter === f.id
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:bg-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Start shopping"
          actionHref="/category/all"
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((order) => {
            const estDate = getEstimatedDeliveryDate(order.createdAt, order.estimatedDelivery);
            const latestTimeline = order.timeline?.[0];
            const deliveredAt = order.status === 'DELIVERED' && latestTimeline?.status === 'DELIVERED' ? latestTimeline.createdAt : null;
            const deliveryMsg = getDeliveryMessage(
              order.status as OrderStatus,
              estDate,
              deliveredAt,
              order.paymentMethodCode // COD-aware
            );
            const isCancelled = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status);

            // COD legacy orders at PENDING_PAYMENT should show "Order placed"
            const isCodLegacy = order.status === 'PENDING_PAYMENT' && order.paymentMethodCode === 'COD';
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
                      })} • {order.lines.length} item{order.lines.length !== 1 && 's'}
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="flex -space-x-3 shrink-0">
                    {order.lines.slice(0, 3).map((line: any) => (
                      <img
                        key={line.id}
                        src={line.product?.imagePath || '/placeholder.svg'}
                        alt=""
                        className="size-16 rounded-xl border-2 border-card object-cover bg-muted"
                      />
                    ))}
                    {order.lines.length > 3 && (
                      <div className="grid size-16 place-items-center rounded-xl border-2 border-card bg-muted text-sm font-medium">
                        +{order.lines.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.lines[0]?.product?.name || 'Unknown Product'}
                      {order.lines.length > 1 && <span className="text-muted-foreground"> and more</span>}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span className={isCancelled ? "line-through opacity-70" : ""}>{deliveryMsg}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{formatPrice(Number(order.grandTotal || 0))}</p>
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
  )
}
