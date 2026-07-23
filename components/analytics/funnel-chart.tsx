'use client';

import React from 'react';

export function FunnelChart() {
  const steps = [
    { label: 'Product Views', count: 1200, percentage: '100%' },
    { label: 'Add to Cart', count: 680, percentage: '56.6%' },
    { label: 'Checkout Start', count: 320, percentage: '26.6%' },
    { label: 'Payment Completed', count: 180, percentage: '15.0%' },
  ];

  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-xs animate-in fade-in duration-300">
      <h3 className="text-base font-bold mb-6">Checkout Funnel Conversion</h3>
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">{step.label}</span>
              <span className="text-foreground">{step.count} ({step.percentage})</span>
            </div>
            <div className="h-4 w-full bg-accent/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                style={{ width: step.percentage }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
