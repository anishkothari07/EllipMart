'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/seller/layout/Sidebar';
import { Header } from '@/components/seller/layout/Header';
// import { MobileSidebar } from '@/components/seller/layout/MobileSidebar';

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar on desktop */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile navigation drawer - simplified for now */}
      {/* <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} /> */}

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
