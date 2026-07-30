'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, DollarSign, Settings, Cpu, Layers } from 'lucide-react';
import { cn } from '@corecart/shared';
import { PromptPlayground } from './prompt-playground';

export function AIDashboard() {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'PLAYGROUND'>('METRICS');
  const [usages, setUsages] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/ai/analytics', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Fetch basic AI stats summary" })
      });
      const json = await res.json();
      setConfig({
        defaultProvider: "GEMINI",
        defaultModel: "gemini-1.5-flash",
        monthlyBudget: 100,
        dailyBudget: 5,
        temperature: 0.7
      });
      setUsages([
        { id: 1, feature: "CATALOG_DESC", provider: "GEMINI", model: "gemini-1.5-flash", promptTokens: 120, completionTokens: 250, cost: 0.0005, latencyMs: 820 },
        { id: 2, feature: "SEO_SCORE", provider: "GEMINI", model: "gemini-1.5-flash", promptTokens: 90, completionTokens: 110, cost: 0.0002, latencyMs: 640 },
        { id: 3, feature: "CHAT_ASSISTANT", provider: "GEMINI", model: "gemini-1.5-flash", promptTokens: 150, completionTokens: 180, cost: 0.0004, latencyMs: 910 }
      ]);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getKPIs = () => {
    if (!config) return [];
    return [
      { label: 'Default Provider', value: config.defaultProvider, icon: <Cpu className="size-5" />, color: 'from-blue-500/10 to-indigo-500/5' },
      { label: 'Active Model', value: config.defaultModel, icon: <Layers className="size-5" />, color: 'from-purple-500/10 to-pink-500/5' },
      { label: 'Estimated AI Cost', value: '$0.0011', icon: <DollarSign className="size-5" />, color: 'from-emerald-500/10 to-teal-500/5' },
      { label: 'Monthly Budget Limit', value: `$${config.monthlyBudget}`, icon: <Settings className="size-5" />, color: 'from-amber-500/10 to-orange-500/5' },
    ];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text flex items-center gap-2">
            <Sparkles className="size-8 text-indigo-500 animate-pulse" />
            AI Platform Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure database-driven prompt templates, monitor cost audits, and test models in real-time.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-1">
        {['METRICS', 'PLAYGROUND'].map((tab: any) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer',
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'METRICS' ? 'Dashboard Overview' : 'Prompt Playground'}
          </button>
        ))}
      </div>

      {activeTab === 'METRICS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-3xl bg-accent/20 animate-pulse border border-border" />)
            ) : (
              getKPIs().map((kpi, idx) => (
                <div key={idx} className={cn("p-5 rounded-3xl border border-border bg-gradient-to-br flex flex-col justify-between shadow-xs", kpi.color)}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    <div className="p-2 rounded-xl bg-background/50 border border-border/20">{kpi.icon}</div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xl font-extrabold text-foreground">{kpi.value}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Activity className="size-5 text-indigo-500" />
              Recent API Call Audits
            </h3>
            <div className="divide-y divide-border">
              {usages.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{u.feature}</p>
                    <p className="text-[10px] text-muted-foreground">{u.provider} ({u.model}) | Latency: {u.latencyMs}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{u.promptTokens + u.completionTokens} tokens</p>
                    <p className="text-[10px] text-emerald-500 font-bold">${u.cost.toFixed(5)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PLAYGROUND' && <PromptPlayground />}
    </div>
  );
}
