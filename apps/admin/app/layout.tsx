import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Super Admin Dashboard | CoreCart',
  description: 'Multi-tenant admin bootstrap shell.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
