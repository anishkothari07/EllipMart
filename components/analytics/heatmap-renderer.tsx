'use client';

import React, { useState } from 'react';

export function HeatmapRenderer() {
  const [clicks, setClicks] = useState<{ x: number; y: number }[]>([]);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setClicks((prev) => [...prev, { x, y }]);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold">Interactive Click Heatmap</h3>
          <p className="text-xs text-muted-foreground mt-1">Click on the mock landing page below to record and render live click coordinates.</p>
        </div>
        <button 
          onClick={() => setClicks([])}
          className="px-3 py-1.5 bg-accent hover:bg-accent/80 text-xs font-semibold rounded-xl cursor-pointer"
        >
          Reset Heatmap
        </button>
      </div>

      <div 
        onClick={handleAreaClick}
        className="relative h-96 w-full rounded-3xl border border-border bg-gradient-to-br from-indigo-500/5 to-pink-500/5 overflow-hidden cursor-crosshair flex flex-col items-center justify-center select-none"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        <div className="text-center z-10 space-y-2 pointer-events-none">
          <h4 className="text-xl font-bold">Mock Landing Page Banner</h4>
          <p className="text-xs text-muted-foreground">Click anywhere on this card to simulate heat clicks</p>
        </div>

        {/* Heat Clicks */}
        {clicks.map((c, idx) => (
          <div
            key={idx}
            className="absolute size-6 rounded-full bg-red-500/40 border border-red-500 blur-xs pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: c.x, top: c.y }}
          />
        ))}
      </div>
    </div>
  );
}
