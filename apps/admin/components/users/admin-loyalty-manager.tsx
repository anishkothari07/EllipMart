'use client'

import { useState } from 'react'
import { Coins, Plus, Minus, Check, AlertCircle, RefreshCw } from 'lucide-react'

interface AdminLoyaltyManagerProps {
  userId: string
  currentPoints: number
  onUpdated?: () => void
}

export function AdminLoyaltyManager({ userId, currentPoints, onUpdated }: AdminLoyaltyManagerProps) {
  const [points, setPoints] = useState<number>(50)
  const [mode, setMode] = useState<'ADD' | 'DEDUCT'>('ADD')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setMsg({ type: 'error', text: 'Please enter a reason for the adjustment.' })
      return
    }

    setLoading(true)
    setMsg(null)

    try {
      const delta = mode === 'ADD' ? Math.abs(points) : -Math.abs(points)
      const res = await fetch('/api/v1/admin/loyalty/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points: delta, reason }),
      })

      const data = await res.json()
      if (data.success) {
        setMsg({ type: 'success', text: `Successfully ${mode === 'ADD' ? 'added' : 'deducted'} ${Math.abs(points)} points!` })
        setReason('')
        if (onUpdated) onUpdated()
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to adjust points.' })
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error executing request.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Coins className="size-4 text-amber-500" /> Admin Loyalty Points Manager
        </h3>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          Current Balance: {currentPoints} pts
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('ADD')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border text-xs font-semibold transition-colors ${
              mode === 'ADD' ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600' : 'border-border bg-background text-muted-foreground'
            }`}
          >
            <Plus className="size-3.5" /> Add Points
          </button>
          <button
            type="button"
            onClick={() => setMode('DEDUCT')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border text-xs font-semibold transition-colors ${
              mode === 'DEDUCT' ? 'border-red-600 bg-red-500/10 text-red-600' : 'border-border bg-background text-muted-foreground'
            }`}
          >
            <Minus className="size-3.5" /> Deduct Points
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Points Delta</label>
            <input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-foreground/40"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Equivalent Value (₹)</label>
            <div className="h-10 w-full rounded-xl border border-border bg-accent/40 px-3 flex items-center text-sm font-semibold text-muted-foreground">
              ₹{points}.00
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Reason for Audit Log</label>
          <input
            type="text"
            placeholder="e.g. Goodwill refund / Promotional gift / Manual correction"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-foreground/40"
            required
          />
        </div>

        {msg && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
            {msg.type === 'success' ? <Check className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {loading && <RefreshCw className="size-3.5 animate-spin" />}
          {mode === 'ADD' ? `Grant +${points} Points` : `Deduct -${points} Points`}
        </button>
      </form>
    </div>
  )
}
