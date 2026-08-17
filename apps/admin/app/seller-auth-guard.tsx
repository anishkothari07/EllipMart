'use client';

import React from 'react';
import { useSellerSession } from '../components/seller-auth-provider';
import { SellerLayout } from '../components/layout/SellerLayout';
import SellerLogin from './login/page';
import { Loader2 } from 'lucide-react';

export function SellerAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSellerSession();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-blue-400" />
          <p className="text-xs text-muted-foreground font-medium">Validating seller session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SellerLogin />;
  }

  return <SellerLayout>{children}</SellerLayout>;
}
