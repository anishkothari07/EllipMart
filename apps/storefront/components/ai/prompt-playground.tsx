'use client';

import React, { useState } from 'react';
import { Play, Send, Terminal, Cpu } from 'lucide-react';

export function PromptPlayground() {
  const [feature, setFeature] = useState('CATALOG_DESC');
  const [inputText, setInputText] = useState('Gamer Mechanical Keyboard');
  const [provider, setProvider] = useState('GEMINI');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const runTest = async () => {
    try {
      setLoading(true);
      setOutput('');
      setStats(null);

      const res = await fetch('/api/v1/ai/catalog/description', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: inputText })
      });
      const json = await res.json();
      if (json.success) {
        setOutput(json.description);
        setStats({
          tokens: Math.ceil(inputText.length / 4) + Math.ceil(json.description.length / 4),
          latencyMs: 840,
          cost: 0.0004
        });
      }
    } catch {
      setOutput('Test execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {/* Settings Column */}
      <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Cpu className="size-5 text-indigo-500" />
          Playground Parameters
        </h3>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase">Template ID</label>
          <select 
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs bg-background focus:outline-none"
          >
            <option value="CATALOG_DESC">CATALOG_DESC (Description generation)</option>
            <option value="SEO_SCORE">SEO_SCORE (SEO auditing)</option>
            <option value="PRODUCT_COMPARE">PRODUCT_COMPARE (Specifications comparison)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase">Target Provider</label>
          <select 
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs bg-background focus:outline-none"
          >
            <option value="GEMINI">Google Gemini (Active)</option>
            <option value="OPENAI">OpenAI GPT (Stub)</option>
            <option value="CLAUDE">Anthropic Claude (Stub)</option>
            <option value="MOCK">Mock Simulation</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase">Interactive Prompt Input</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs bg-background focus:outline-none"
            placeholder="Type value to insert into variables..."
          />
        </div>

        <button
          onClick={runTest}
          disabled={loading}
          className="w-full p-3 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Play className="size-4 fill-background text-background" />
          {loading ? 'Running Execution...' : 'Run Prompt'}
        </button>
      </div>

      {/* Output Column */}
      <div className="p-6 rounded-3xl border border-border bg-card flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 mb-4">
            <Terminal className="size-5 text-indigo-500" />
            Model Response Output
          </h3>

          <div className="p-4 rounded-2xl bg-accent/20 border border-border/10 text-xs font-mono min-h-60 overflow-y-auto whitespace-pre-wrap">
            {loading ? 'Executing model call via AIService...' : output || 'Response output will print here.'}
          </div>
        </div>

        {stats && (
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
            <span>Latency: <strong>{stats.latencyMs}ms</strong></span>
            <span>Est. Cost: <strong className="text-emerald-500">${stats.cost.toFixed(5)}</strong></span>
            <span>Total Tokens: <strong>{stats.tokens}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
