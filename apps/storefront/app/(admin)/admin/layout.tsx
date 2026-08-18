import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SellerAuthProvider } from '@/components/admin/seller-auth-provider';

export const metadata = {
  title: 'EllipMart Super Admin',
  description: 'EllipMart platform management.',
};

// This layout wraps all /admin/* routes.
// Access to this route group is enforced by middleware.ts (requires ADMIN role).
export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellerAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </SellerAuthProvider>
  );
}
