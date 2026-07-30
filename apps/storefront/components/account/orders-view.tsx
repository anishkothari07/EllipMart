'use client'

import { ArrowRight, Package, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { EmptyState } from '@corecart/ui'
import { formatPrice } from '@corecart/shared'
import { cn } from '@corecart/shared'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-500/10 text-blue-500' },
  SHIPPED: { label: 'Shipped', className: 'bg-indigo-500/10 text-indigo-500' },
  DELIVERED: { label: 'Delivered', className: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
}

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
        o.lines.some((l: any) => l.product?.name?.toLowerCase().includes(query.toLowerCase()))
      return matchStatus && matchQuery
    })
  }, [filter, query])

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
          {filtered.map((order) => (
            <li key={order.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold">{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Placed{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta[order.status as OrderStatus]?.className}`}
                >
                  {statusMeta[order.status as OrderStatus]?.label}
                </span>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="flex -space-x-3">
                  {order.lines.slice(0, 3).map((line: any) => (
                    <img
                      key={line.id}
                      src={line.product?.images?.[0]?.path || '/placeholder.svg'}
                      alt=""
                      className="size-16 rounded-xl border-2 border-card object-cover"
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
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(Number(order.total))}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  {order.lines.length} item{order.lines.length !== 1 && 's'}
                </p>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
