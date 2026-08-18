'use client';

import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
