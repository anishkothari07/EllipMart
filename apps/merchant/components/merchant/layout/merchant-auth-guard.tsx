'use client';

import React from 'react';
import { useMerchantSession } from '../providers/merchant-auth-provider';
import { Lock, ShieldAlert } from 'lucide-react';

export function MerchantAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useMerchantSession();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Validating merchant session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-border bg-card shadow-soft text-center space-y-6">
          <div className="mx-auto size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <Lock className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Access Denied</h1>
            <p className="text-sm text-muted-foreground">
              You must be logged in to view the Merchant Admin dashboard.
            </p>
          </div>
          <button
            onClick={() => login('merchant@smartgo.in')}
            className="w-full h-11 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Authenticate Mock Merchant
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
