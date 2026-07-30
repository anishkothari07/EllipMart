'use client';

import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Shield, Globe, Cpu, Database, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Active Tenant Sites', value: '1,284', change: '+12% this month', icon: Globe },
    { label: 'Platform GTV (Monthly)', value: '₹14.8M', change: '+24% this month', icon: Activity },
    { label: 'Global Server Load', value: '28%', change: 'Normal limits', icon: Cpu },
    { label: 'Tenant Databases', value: '1,284', change: 'Synced & Healthy', icon: Database },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Platform Overview</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Super Administrator console for monitoring server capacities, multi-tenant databases, and deployment states.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-5 border border-border/80 bg-card rounded-3xl space-y-3 shadow-sm text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <Icon className="size-4.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[9px] font-bold text-emerald-500 mt-0.5">{s.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Placeholder Table */}
        <div className="p-6 border border-border/80 bg-card rounded-3xl space-y-4 shadow-sm text-left">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Recently Provisioned Websites</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 pb-2">
                  {['Store / Site', 'Domain Address', 'Registered Owner', 'Database Cluster', 'Status'].map((h) => (
                    <th key={h} className="pb-2 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                {[
                  { name: 'SmartGO Electronics', domain: 'electronics.smartgo.com', owner: 'owner@smartgo.com', db: 'cluster-db-in-1', status: 'Healthy' },
                  { name: 'Aroma Threads', domain: 'aroma-apparel.in', owner: 'aroma@threads.com', db: 'cluster-db-in-1', status: 'Healthy' },
                  { name: 'TechWare Store', domain: 'techware-intl.com', owner: 'sales@techware.com', db: 'cluster-db-us-3', status: 'Healthy' },
                ].map((site) => (
                  <tr key={site.domain} className="hover:bg-muted/10">
                    <td className="py-3 font-bold text-foreground">{site.name}</td>
                    <td className="py-3 font-mono text-[10px]">{site.domain}</td>
                    <td className="py-3">{site.owner}</td>
                    <td className="py-3 font-mono text-[10px]">{site.db}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                        {site.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
