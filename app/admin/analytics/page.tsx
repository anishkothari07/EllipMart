import React from 'react';
import { DashboardView } from '@/components/analytics/dashboard-view';

export const metadata = {
  title: 'Analytics Studio | SmartGO Admin',
  description: 'Enterprise Analytics & Business Intelligence Dashboard',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <DashboardView />
    </div>
  );
}
