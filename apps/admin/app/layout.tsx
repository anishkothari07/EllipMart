import React from 'react';
import './globals.css';
import { SellerAuthProvider } from '../components/seller-auth-provider';
import { SellerAuthGuard } from './seller-auth-guard';

export const metadata = {
  title: 'EllipMart Seller Portal',
  description: 'Manage your products on EllipMart.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <SellerAuthProvider>
          <SellerAuthGuard>
            {children}
          </SellerAuthGuard>
        </SellerAuthProvider>
      </body>
    </html>
  );
}
