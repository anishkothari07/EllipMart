'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchCustomersAction } from '../actions';
import { Users, Search, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  SUSPENDED: 'bg-red-500/10 text-red-600',
  PENDING_VERIFICATION: 'bg-yellow-500/10 text-yellow-600',
  INACTIVE: 'bg-muted text-muted-foreground',
};

export default function CustomersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchCustomersAction({ page, search: search || undefined });
    if (res.success) setData(res.data);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">All registered customers on EllipMart.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5 rounded-xl">
          <Users className="size-3.5" />
          {data?.total ?? 0} Customers
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
        />
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        ) : !data?.customers?.length ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Users className="size-10 opacity-20" />
            <p className="text-sm font-medium">No customers found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center text-xs font-bold">
                          {c.firstName?.[0]}{c.lastName?.[0]}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <ShoppingBag className="size-3.5 text-muted-foreground" />
                        {c._count?.orders ?? 0}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status] || 'bg-muted text-muted-foreground'}`}>
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</span>
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
