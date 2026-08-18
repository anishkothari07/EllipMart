'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminDashboardAction } from '../actions';
import { BarChart3, TrendingUp, Users, ShoppingBag, CreditCard, Store } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardAction().then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center gap-2">
        <div className="size-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  const metrics = [
    { label: 'Total Revenue', value: `₹${Number(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-500/10', desc: 'Gross merchandise value' },
    { label: 'Total Orders', value: data?.totalOrders ?? 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-500/10', desc: 'All-time order count' },
    { label: 'Total Products', value: data?.totalProducts ?? 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-500/10', desc: 'Active catalog size' },
    { label: 'Registered Sellers', value: data?.totalSellers ?? 0, icon: Store, color: 'text-violet-600', bg: 'bg-violet-500/10', desc: 'Onboarded seller accounts' },
    { label: 'Total Customers', value: data?.totalCustomers ?? 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-500/10', desc: 'Registered buyer accounts' },
    {
      label: 'Avg. Order Value',
      value: data?.totalOrders
        ? `₹${Math.round(data.totalRevenue / data.totalOrders).toLocaleString('en-IN')}`
        : '₹0',
      icon: BarChart3,
      color: 'text-pink-600',
      bg: 'bg-pink-500/10',
      desc: 'Revenue per order',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide performance metrics and KPIs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-6 rounded-3xl border border-border/80 bg-card space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <div className={`size-9 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">{m.value}</h2>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-6 flex flex-col items-center justify-center gap-3 min-h-[200px] text-muted-foreground border-dashed">
        <BarChart3 className="size-10 opacity-20" />
        <p className="text-sm font-medium">Detailed charts coming soon</p>
        <p className="text-xs opacity-60">Revenue trends, order analytics and conversion funnels will appear here.</p>
      </div>
    </div>
  );
}
