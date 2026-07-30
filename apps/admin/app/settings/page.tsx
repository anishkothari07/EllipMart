'use client';

import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Settings, ShieldCheck } from 'lucide-react';

export default function SettingsAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Platform Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">Configure database nodes, cluster pools, and encryption keys.</p>
        </div>

        <div className="p-12 border border-dashed rounded-3xl text-center text-muted-foreground">
          <ShieldCheck className="size-8 mx-auto stroke-[1.5] mb-2" />
          <h3 className="text-xs font-bold text-foreground">Cluster credentials</h3>
          <p className="text-[10px] mt-0.5 max-w-xs mx-auto">Database encryption keys and secret keys rotation defaults are customized here.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
