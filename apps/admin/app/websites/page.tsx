'use client';

import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Globe, Plus, Search } from 'lucide-react';

export default function WebsitesAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Websites & Tenants</h1>
            <p className="text-xs text-muted-foreground mt-1">Manage database provisions and subdomains.</p>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors">
            <Plus className="size-3.5" />
            Provision Website
          </button>
        </div>

        <div className="p-12 border border-dashed rounded-3xl text-center text-muted-foreground">
          <Globe className="size-8 mx-auto stroke-[1.5] mb-2" />
          <h3 className="text-xs font-bold text-foreground">Multi-tenant sites</h3>
          <p className="text-[10px] mt-0.5 max-w-xs mx-auto">This list represents database tenant rows. Platform builder configurations are managed exclusively here.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
