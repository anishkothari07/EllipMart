'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, ArrowUpCircle, ArrowDownCircle, RotateCcw, SlidersHorizontal, Plus, Loader2 } from 'lucide-react'
import { cn } from '@corecart/shared'

type WalletTxType = 'TOPUP' | 'PURCHASE' | 'REFUND' | 'ADJUSTMENT'

type Transaction = {
  id: string
  type: WalletTxType
  amount: number
  balance: number
  description: string | null
  orderId: string | null
  createdAt: string
}

type WalletBalance = {
  balance: number
  pendingHolds: number
  availableBalance: number
  recentTransactions: Transaction[]
}

const txConfig: Record<WalletTxType, { label: string; icon: React.ElementType; color: string }> = {
  TOPUP:      { label: 'Top-up',     icon: ArrowUpCircle,   color: 'text-emerald-500' },
  PURCHASE:   { label: 'Purchase',   icon: ArrowDownCircle, color: 'text-destructive'  },
  REFUND:     { label: 'Refund',     icon: RotateCcw,       color: 'text-blue-500'    },
  ADJUSTMENT: { label: 'Adjustment', icon: SlidersHorizontal,color: 'text-amber-500'  },
}

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Math.abs(amount))
}

export function WalletView() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)
  const [topupAmount, setTopupAmount] = useState('')
  const [topupLoading, setTopupLoading] = useState(false)
  const [showTopup, setShowTopup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/wallet', {
        headers: { 'x-user-id': 'mock-user-id' }
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setWallet(data.data)
      }
    } catch (e) {
      console.error('Failed to load wallet:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTransactions = useCallback(async (p = 1) => {
    try {
      setTxLoading(true)
      const res = await fetch(`/api/v1/wallet/transactions?page=${p}&limit=10`, {
        headers: { 'x-user-id': 'mock-user-id' }
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setTransactions(data.data.transactions)
        setTotalPages(data.data.totalPages)
      }
    } catch (e) {
      console.error('Failed to load wallet transactions:', e)
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => { loadWallet(); loadTransactions(1) }, [loadWallet, loadTransactions])

  const handlePageChange = (p: number) => {
    setPage(p)
    loadTransactions(p)
  }

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount)
    setError(null)

    if (isNaN(amount) || amount < 100) { setError('Minimum top-up is ₹100'); return }
    if (amount > 10000) { setError('Maximum top-up per transaction is ₹10,000'); return }

    try {
      setTopupLoading(true)

      // First, try to initiate via Razorpay
      const initRes = await fetch('/api/v1/wallet/topup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'mock-user-id' },
        body: JSON.stringify({ amount }),
      })
      const initData = await initRes.json()

      // If Razorpay keys are configured and valid, open Razorpay checkout
      if (initData.success && initData.data?.keyId) {
        const { razorpayOrderId, amountInPaise, keyId } = initData.data
        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'EllipMart Wallet',
          description: 'Wallet Top-up',
          order_id: razorpayOrderId,
          handler: async () => {
            setTimeout(() => { loadWallet(); loadTransactions(1); setShowTopup(false) }, 3000)
          },
          theme: { color: '#0f0f0f' },
        }
        // @ts-ignore — Razorpay is loaded via script tag
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
        return
      }

      // Razorpay not configured — fall back to mock top-up (dev mode)
      const mockRes = await fetch('/api/v1/wallet/topup/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'mock-user-id' },
        body: JSON.stringify({ amount }),
      })
      const mockData = await mockRes.json()
      if (!mockData.success) { setError(mockData.error || 'Top-up failed'); return }

      // Success — reload wallet and close modal
      await loadWallet()
      await loadTransactions(1)
      setShowTopup(false)
      setTopupAmount('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setTopupLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium tracking-tight">My Wallet</h1>
        <button
          id="wallet-topup-btn"
          onClick={() => setShowTopup(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          <Plus className="size-4" /> Add Money
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Available Balance */}
        <div className="sm:col-span-2 rounded-2xl bg-foreground p-6 text-background">
          <div className="mb-1 flex items-center gap-2 text-sm opacity-70">
            <Wallet className="size-4" /> Available Balance
          </div>
          <p className="text-4xl font-semibold tracking-tight">
            {fmt(wallet?.availableBalance ?? 0)}
          </p>
          {(wallet?.pendingHolds ?? 0) > 0 && (
            <p className="mt-2 text-xs opacity-60">
              {fmt(wallet!.pendingHolds)} on hold (active checkout)
            </p>
          )}
        </div>

        {/* Total Balance */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Total Balance</p>
          <p className="text-2xl font-semibold">{fmt(wallet?.balance ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Incl. holds</p>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Add Money to Wallet</h2>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  id={`wallet-quickamt-${amt}`}
                  onClick={() => setTopupAmount(String(amt))}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                    topupAmount === String(amt) ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted',
                  )}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <input
              id="wallet-topup-amount"
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="Enter amount (₹100 – ₹10,000)"
              className="mb-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
            />
            {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
            <p className="mb-4 text-xs text-muted-foreground">Min ₹100 · Max ₹10,000 per transaction · Balance cap ₹50,000</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowTopup(false); setError(null) }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                id="wallet-topup-submit"
                onClick={handleTopup}
                disabled={topupLoading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
              >
                {topupLoading ? <Loader2 className="size-4 animate-spin" /> : 'Pay via Razorpay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-medium">Transaction History</h2>
        </div>

        {txLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Wallet className="size-8 opacity-30" />
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => {
              const cfg = txConfig[tx.type]
              const Icon = cfg.icon
              const isCredit = tx.amount > 0
              return (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-4">
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-muted', cfg.color)}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{cfg.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tx.description || '—'}
                      {tx.orderId && <span className="ml-1 opacity-60">· Order #{tx.orderId.slice(-8)}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold tabular-nums', isCredit ? 'text-emerald-500' : 'text-destructive')}>
                      {isCredit ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-border px-5 py-3">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
            <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
