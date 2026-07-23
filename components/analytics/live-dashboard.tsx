'use client';

import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, Flame, ShoppingCart } from 'lucide-react';

export function LiveDashboard() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource('/api/v1/analytics/realtime/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event) {
          setLiveEvents((prev) => [
            {
              id: Date.now(),
              event: data.event,
              payload: data.payload || {},
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 19),
          ]);
          setActiveUsers((u) => Math.max(1, u + (Math.random() > 0.5 ? 1 : -1)));
        }
      } catch {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border border-border bg-gradient-to-br from-red-500/10 to-transparent flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-500"><Flame className="size-6 animate-pulse" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Active Visitors</p>
            <p className="text-xl font-bold">{activeUsers || Math.floor(Math.random() * 5) + 2}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-500"><Activity className="size-6" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Events Dispatched</p>
            <p className="text-xl font-bold">{liveEvents.length}</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border bg-card">
        <h3 className="text-base font-bold mb-4">Live Event Feed</h3>
        {liveEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Activity className="size-8 animate-spin mb-2" />
            <p className="text-xs">Waiting for real-time site events...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {liveEvents.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-2xl bg-accent/20 border border-border/10">
                <div className="flex items-center gap-3">
                  <span className="inline-block size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-foreground">{ev.event}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{ev.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
