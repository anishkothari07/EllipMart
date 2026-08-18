'use client';

import React, { useEffect, useState } from 'react';
import { fetchDashboardOverviewAction } from './actions';
import { formatPrice } from '@corecart/shared';
import type { DashboardKPIs, RecentActivityItem } from '@corecart/commerce';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  TrendingDown,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchDashboardOverviewAction();
        if (res.success && res.data) {
          setKpis(res.data.kpis);
          setActivities(res.data.recentActivity);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !kpis) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading dashboard overview metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Welcome Back!</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Here is what is happening with your storefront operations today.
        </p>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue KPI */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-soft transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales</span>
            <div className="size-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif">{formatPrice(kpis.revenue, 'INR')}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                +{kpis.salesGrowth}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">vs last month</span>
            </div>
          </div>
        </div>

        {/* Orders KPI */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-soft transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</span>
            <div className="size-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CreditCard className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif">{kpis.ordersCount}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                +{kpis.ordersGrowth}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">vs last week</span>
            </div>
          </div>
        </div>

        {/* Products KPI */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-soft transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catalog Items</span>
            <div className="size-9 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <ShoppingBag className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif">{kpis.productsCount}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {kpis.productsActive} Active
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">listings</span>
            </div>
          </div>
        </div>

        {/* Customers KPI */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-soft transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Customers</span>
            <div className="size-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif">{kpis.customersCount}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +{kpis.customersNew} new
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent activity timeline */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4.5 text-muted-foreground" />
              <h3 className="font-serif text-lg font-bold text-foreground">Recent Activity</h3>
            </div>
            <span className="text-xs font-semibold text-muted-foreground select-none">Real-time alerts</span>
          </div>

          <div className="divide-y divide-border/60">
            {activities.map((act) => {
              let Icon = Activity;
              let iconStyles = 'bg-muted/40 text-muted-foreground';

              if (act.type === 'ORDER') {
                Icon = CreditCard;
                iconStyles = act.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/10 text-indigo-600';
              } else if (act.type === 'CUSTOMER') {
                Icon = Users;
                iconStyles = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
              } else if (act.type === 'PRODUCT') {
                Icon = ShoppingBag;
                iconStyles = act.status === 'warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-orange-500/10 text-orange-600';
              }

              return (
                <div key={act.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className={`size-9 rounded-2xl flex items-center justify-center shrink-0 ${iconStyles}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold text-foreground truncate">{act.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">{act.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-normal">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick links & operations shortcuts card */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border/60 pb-4">
            <PlusCircle className="size-4.5 text-muted-foreground" />
            <h3 className="font-serif text-lg font-bold text-foreground">Operations Center</h3>
          </div>

          <div className="space-y-3">
            <Link
              href="/seller/products"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-foreground/10 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">Manage Products</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Edit inventory, descriptions</span>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/seller/orders"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-foreground/10 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <CreditCard className="size-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">Order Dispatch</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Fulfill pending orders</span>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/seller/settings"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-foreground/10 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                  <Settings className="size-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">Store Configuration</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Update payout methods</span>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
