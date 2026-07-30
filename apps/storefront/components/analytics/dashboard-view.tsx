'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign, Activity, FileText, Settings } from 'lucide-react';
import { cn } from '@corecart/shared';
import { FunnelChart } from './funnel-chart';
import { HeatmapRenderer } from './heatmap-renderer';
import { LiveDashboard } from './live-dashboard';

export function DashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LIVE' | 'FUNNEL' | 'HEATMAP'>('OVERVIEW');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/analytics/dashboard?range=${range}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getKPIs = () => {
    if (!data?.kpis) return [];
    const k = data.kpis;
    return [
      { label: 'Revenue', value: `$${k.revenue.toLocaleString()}`, icon: <DollarSign className="size-5" />, gradient: 'from-emerald-500/20 to-teal-500/5' },
      { label: 'Net Revenue', value: `$${k.netRevenue.toLocaleString()}`, icon: <TrendingUp className="size-5 text-indigo-500" />, gradient: 'from-indigo-500/20 to-violet-500/5' },
      { label: 'Orders', value: k.ordersCount.toLocaleString(), icon: <ShoppingBag className="size-5 text-blue-500" />, gradient: 'from-blue-500/20 to-sky-500/5' },
      { label: 'Avg Order Value', value: `$${k.aov.toFixed(2)}`, icon: <Activity className="size-5 text-amber-500" />, gradient: 'from-amber-500/20 to-orange-500/5' },
    ];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-muted-foreground/80 bg-clip-text">Analytics Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time enterprise metrics, business intelligence summaries, and forecast dataset preparation.</p>
        </div>

        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors',
                range === r
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-border'
              )}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto scrollbar-none">
        {['OVERVIEW', 'LIVE', 'FUNNEL', 'HEATMAP'].map((tab: any) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-accent/20 animate-pulse border border-border" />
              ))
            ) : (
              getKPIs().map((kpi, idx) => (
                <div key={idx} className={cn("p-5 rounded-3xl border border-border bg-gradient-to-br flex flex-col justify-between shadow-xs", kpi.gradient)}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    <div className="p-2 rounded-xl bg-background/50 border border-border/20">{kpi.icon}</div>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-extrabold text-foreground">{kpi.value}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Top Products */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-xs">
            <h3 className="text-base font-bold mb-4">Top Performing Products</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-accent/20 animate-pulse rounded-lg" />)}
              </div>
            ) : !data?.topProducts || data.topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No product metrics recorded for this date range.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Product ID: {p.productId}</p>
                      <p className="text-[10px] text-muted-foreground">Views: {p.views} | Purchases: {p.purchases}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{(p.conversionRate || 0).toFixed(1)}% Conv</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'LIVE' && <LiveDashboard />}
      {activeTab === 'FUNNEL' && <FunnelChart />}
      {activeTab === 'HEATMAP' && <HeatmapRenderer />}
    </div>
  );
}
