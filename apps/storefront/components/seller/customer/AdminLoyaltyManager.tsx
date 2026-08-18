'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Plus, Minus, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminLoyaltyManagerProps {
  userId: string;
}

export function AdminLoyaltyManager({ userId }: AdminLoyaltyManagerProps) {
  const [points, setPoints] = useState<number>(50);
  const [mode, setMode] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const res = await fetch(`/api/v1/loyalty`, {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      if (data.success) {
        setCurrentBalance(data.data.points ?? 0);
      }
    } catch (e) {
      console.error('Failed to load customer loyalty balance:', e);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setMsg({ type: 'error', text: 'Please enter a reason for the points adjustment.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const delta = mode === 'ADD' ? Math.abs(points) : -Math.abs(points);
      const res = await fetch('http://localhost:3001/api/v1/admin/loyalty/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'mock-user-id',
        },
        body: JSON.stringify({ userId, points: delta, reason }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({
          type: 'success',
          text: `Successfully ${mode === 'ADD' ? 'added' : 'deducted'} ${Math.abs(points)} points!`,
        });
        setReason('');
        await fetchBalance();
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to adjust points.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error executing point adjustment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Coins className="size-4 text-amber-500" /> Customer Loyalty Points
        </h3>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          {balanceLoading ? '...' : `${currentBalance} pts (₹${currentBalance})`}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('ADD')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-bold transition-all ${
              mode === 'ADD'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="size-3.5" /> Add Points
          </button>
          <button
            type="button"
            onClick={() => setMode('DEDUCT')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-bold transition-all ${
              mode === 'DEDUCT'
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <Minus className="size-3.5" /> Deduct Points
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Points Delta</label>
            <input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-foreground/40"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Value (₹)</label>
            <div className="h-9 w-full rounded-xl border border-border bg-muted/40 px-3 flex items-center text-xs font-bold text-muted-foreground">
              ₹{points}.00
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Audit Reason</label>
          <input
            type="text"
            placeholder="e.g. Goodwill bonus / Compensation / Correction"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-foreground/40"
            required
          />
        </div>

        {msg && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
            }`}
          >
            {msg.type === 'success' ? <Check className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs"
        >
          {loading && <RefreshCw className="size-3.5 animate-spin" />}
          {mode === 'ADD' ? `Assign +${points} Loyalty Points` : `Deduct -${points} Loyalty Points`}
        </button>
      </form>
    </div>
  );
}
