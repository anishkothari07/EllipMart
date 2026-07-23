import React from 'react';
import { AIDashboard } from '@/components/ai/ai-dashboard';

export const metadata = {
  title: 'AI Platform Console | SmartGO Admin',
  description: 'Enterprise AI & Prompt Playground Console',
};

export default function AdminAIPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <AIDashboard />
    </div>
  );
}
