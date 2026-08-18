import React from 'react';
import { MerchantLayout } from '@/components/seller/layout/MerchantLayout';
import { MerchantAuthProvider } from '@/components/seller/providers/merchant-auth-provider';
import { MerchantAuthGuard } from '@/components/seller/layout/merchant-auth-guard';

export const metadata = {
  title: 'EllipMart Seller Portal',
  description: 'Manage your products and orders on EllipMart.',
};

// This layout wraps all /seller/* routes.
// Access to this route group is enforced by middleware.ts (requires SELLER role).
export default function SellerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantAuthProvider>
      <MerchantAuthGuard>
        <MerchantLayout>{children}</MerchantLayout>
      </MerchantAuthGuard>
    </MerchantAuthProvider>
  );
}
