'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchAdminOrdersAction } from '../actions';
import { CreditCard, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-500/10 text-yellow-600',
  CONFIRMED: 'bg-blue-500/10 text-blue-600',
  PACKED: 'bg-indigo-500/10 text-indigo-600',
  SHIPPED: 'bg-purple-500/10 text-purple-600',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
  REFUNDED: 'bg-orange-500/10 text-orange-600',
};

const ORDER_STATUSES = ['', 'PENDING_PAYMENT', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrdersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminOrdersAction({ page, search: search || undefined, status: status || undefined });
    if (res.success) setData(res.data);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">All orders across the platform.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5 rounded-xl">
          <CreditCard className="size-3.5" />
          {data?.total ?? 0} Orders
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order number or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2.5 text-sm bg-card border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all appearance-none"
          >
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        ) : !data?.orders?.length ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <CreditCard className="size-10 opacity-20" />
            <p className="text-sm font-medium">No orders found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Items</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Payment</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-bold text-foreground">#{order.orderNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold">{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-[10px] text-muted-foreground">{order.user.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{order._count?.items ?? 0} items</td>
                    <td className="px-5 py-3.5 text-xs font-bold">₹{Number(order.grandTotal).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${order.payment?.status === 'CAPTURED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                        {order.payment?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} orders</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page === 1} className="text-xs px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={data.page === data.totalPages} className="text-xs px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
