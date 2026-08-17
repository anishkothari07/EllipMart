'use client';

import React, { useEffect, useState } from 'react';
import { fetchSellerDashboardOverviewAction } from './dashboard-actions';
import { ShoppingBag, CreditCard, Activity, PlusCircle, ArrowUpRight, Settings } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchSellerDashboardOverviewAction();
        if (res.success && res.data) {
          setKpis(res.data);
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
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {kpis.productsDraft} Draft
              </span>
            </div>
          </div>
        </div>

        {/* Revenue KPI Placeholder */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-soft transition-all duration-200 space-y-4 opacity-70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales</span>
            <div className="size-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif">₹0</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                Coming soon
              </span>
            </div>
          </div>
        </div>

        {/* Orders KPI Placeholder */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card hover:border-foreground/20 hover:shadow-soft transition-all duration-200 space-y-4 opacity-70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</span>
            <div className="size-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif">0</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Quick links & operations shortcuts card */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border/60 pb-4">
            <PlusCircle className="size-4.5 text-muted-foreground" />
            <h3 className="font-serif text-lg font-bold text-foreground">Operations Center</h3>
          </div>

          <div className="space-y-3">
            <Link
              href="/products/new"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-foreground/10 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">Add New Product</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Create a new listing</span>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/products"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-foreground/10 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">Manage Catalog</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Edit inventory, descriptions</span>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/settings"
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
