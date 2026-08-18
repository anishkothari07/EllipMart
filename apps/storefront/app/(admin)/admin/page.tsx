'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminDashboardAction } from './actions';
import {
  ShoppingBag,
  CreditCard,
  Activity,
  Users,
  Store,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardAction().then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading platform overview...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${Number(data?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: 'bg-emerald-500/10 text-emerald-600',
      href: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? 0,
      icon: Activity,
      color: 'bg-indigo-500/10 text-indigo-600',
      href: '/admin/orders',
    },
    {
      label: 'Total Products',
      value: data?.totalProducts ?? 0,
      icon: ShoppingBag,
      color: 'bg-orange-500/10 text-orange-600',
      href: '/admin/products',
    },
    {
      label: 'Registered Sellers',
      value: data?.totalSellers ?? 0,
      icon: Store,
      color: 'bg-violet-500/10 text-violet-600',
      href: '/admin/sellers',
    },
    {
      label: 'Total Customers',
      value: data?.totalCustomers ?? 0,
      icon: Users,
      color: 'bg-sky-500/10 text-sky-600',
      href: '/admin/customers',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Real-time snapshot of EllipMart operations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="p-5 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200 space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`size-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <h2 className="text-2xl font-bold">{kpi.value}</h2>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h3 className="font-bold text-sm text-foreground">Recent Orders</h3>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="size-3" />
          </Link>
        </div>

        {!data?.recentOrders?.length ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Activity className="size-8 opacity-30" />
            <p className="text-xs">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {data.recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-foreground">#{order.orderNumber}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ORDER_STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold">₹{Number(order.grandTotal).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
