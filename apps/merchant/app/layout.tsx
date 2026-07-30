import React from 'react';
import './globals.css';
import { MerchantAuthProvider } from '@/components/merchant/providers/merchant-auth-provider';
import { MerchantAuthGuard } from '@/components/merchant/layout/merchant-auth-guard';
import { MerchantLayout } from '@/components/merchant/layout/MerchantLayout';

export default function RootMerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <MerchantAuthProvider>
          <MerchantAuthGuard>
            <MerchantLayout>{children}</MerchantLayout>
          </MerchantAuthGuard>
        </MerchantAuthProvider>
      </body>
    </html>
  );
}
