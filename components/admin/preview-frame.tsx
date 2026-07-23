'use client';

import { useState } from 'react';
import { Monitor, Tablet, Smartphone, FoldHorizontal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'foldable';

export function PreviewFrame({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isFolded, setIsFolded] = useState(true);

  const deviceSpecs = {
    desktop: { width: '100%', height: '100%', label: 'Desktop (100% Viewport)' },
    tablet: { width: '768px', height: '1024px', label: 'iPad / Tablet' },
    mobile: { width: '375px', height: '812px', label: 'iPhone / Phone' },
    foldable: {
      width: isFolded ? '280px' : '540px',
      height: isFolded ? '653px' : '720px',
      label: isFolded ? 'Folded Cover' : 'Unfolded Main',
    },
  };

  const current = deviceSpecs[device];

  return (
    <div className="flex flex-col w-full min-h-screen bg-secondary/20">
      {/* Device Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-card shadow-soft z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Storefront Merchant Preview</span>
          <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">{current.label}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl">
          {[
            { id: 'desktop', label: 'Desktop', icon: Monitor },
            { id: 'tablet', label: 'Tablet', icon: Tablet },
            { id: 'mobile', label: 'Mobile', icon: Smartphone },
            { id: 'foldable', label: 'Foldable', icon: FoldHorizontal },
          ].map((btn) => {
            const Icon = btn.icon;
            const active = device === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setDevice(btn.id as DeviceType)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  active
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {device === 'foldable' && (
          <button
            onClick={() => setIsFolded(!isFolded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold shadow-soft transition-all hover:bg-indigo-600"
          >
            <RefreshCw className="size-3.5" />
            <span>Toggle Fold ({isFolded ? 'Unfold' : 'Fold'})</span>
          </button>
        )}
      </div>

      {/* Preview Viewport Frame wrapper */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div
          style={{ width: current.width, height: current.height }}
          className={cn(
            'transition-all duration-300 ease-in-out border border-border shadow-2xl bg-background relative',
            device !== 'desktop' && 'rounded-[36px] overflow-hidden max-h-[85vh] ring-12 ring-muted shadow-float'
          )}
        >
          {/* Simulated Speaker notch on mobile viewports */}
          {device === 'mobile' && (
            <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 flex items-center justify-center">
              <div className="w-24 h-4 bg-black rounded-b-xl" />
            </div>
          )}

          {/* Child content container */}
          <div className={cn('w-full h-full overflow-y-auto', device === 'mobile' && 'pt-6')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
