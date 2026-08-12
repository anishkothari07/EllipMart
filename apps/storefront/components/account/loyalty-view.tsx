'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ArrowUpCircle, ArrowDownCircle, SlidersHorizontal, Loader2, Gift, Users } from 'lucide-react'
import { cn } from '@corecart/shared'

type LoyaltyTxType = 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'WELCOME_BONUS' | 'REFERRAL'

type LoyaltyTx = {
  id: string
  type: LoyaltyTxType
  points: number
  pointsBalance: number
  monetaryValue: number | null
  description: string | null
  orderId: string | null
  createdAt: string
}

type LoyaltyBalance = {
  points: number
  availablePoints: number
  pendingHolds: number
  monetaryValue: number
  lifetimeEarned: number
  lifetimeRedeemed: number
}

const txConfig: Record<LoyaltyTxType, { label: string; icon: React.ElementType; color: string }> = {
  EARN:          { label: 'Points Earned',   icon: ArrowUpCircle,    color: 'text-emerald-500' },
  REDEEM:        { label: 'Points Redeemed', icon: ArrowDownCircle,  color: 'text-primary'     },
  ADJUSTMENT:    { label: 'Adjustment',      icon: SlidersHorizontal,color: 'text-amber-500'   },
  WELCOME_BONUS: { label: 'Welcome Bonus',   icon: Gift,             color: 'text-violet-500'  },
  REFERRAL:      { label: 'Referral Reward', icon: Users,            color: 'text-indigo-500'  },
}

function fmtRupees(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount)
}

export function LoyaltyView() {
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null)
  const [transactions, setTransactions] = useState<LoyaltyTx[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)

  const loadBalance = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/loyalty')
      const data = await res.json()
      if (data.success) setBalance(data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTransactions = useCallback(async (p = 1) => {
    try {
      setTxLoading(true)
      const res = await fetch(`/api/v1/loyalty/transactions?page=${p}&limit=10`)
      const data = await res.json()
      if (data.success) {
        setTransactions(data.data.transactions)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => { loadBalance(); loadTransactions(1) }, [loadBalance, loadTransactions])

  const handlePageChange = (p: number) => {
    setPage(p)
    loadTransactions(p)
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
      <h1 className="font-serif text-3xl font-medium tracking-tight">Loyalty Points</h1>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Available Points */}
        <div className="col-span-2 rounded-2xl bg-foreground p-6 text-background">
          <div className="mb-1 flex items-center gap-2 text-sm opacity-70">
            <Star className="size-4 fill-current" /> Available Points
          </div>
          <p className="text-4xl font-semibold tracking-tight">
            {(balance?.availablePoints ?? 0).toLocaleString('en-IN')} pts
          </p>
          <p className="mt-2 text-sm opacity-70">
            = {fmtRupees(balance?.monetaryValue ?? 0)} redeemable value
          </p>
          {(balance?.pendingHolds ?? 0) > 0 && (
            <p className="mt-1 text-xs opacity-50">
              {balance!.pendingHolds} pts on hold (active checkout)
            </p>
          )}
        </div>

        {/* Lifetime stats */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-xs text-muted-foreground">Lifetime Earned</p>
            <p className="text-xl font-semibold">{(balance?.lifetimeEarned ?? 0).toLocaleString('en-IN')} pts</p>
          </div>
          <div className="h-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Lifetime Redeemed</p>
            <p className="text-xl font-semibold">{(balance?.lifetimeRedeemed ?? 0).toLocaleString('en-IN')} pts</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <p className="mb-3 text-sm font-medium">How loyalty points work</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">🛍</span>
            <span>Earn <strong className="text-foreground">1 point for every ₹100</strong> spent on delivered orders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-violet-500">🎁</span>
            <span>Get <strong className="text-foreground">50 Welcome Points (₹50)</strong> automatically when you join</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-500">👥</span>
            <span>Earn <strong className="text-foreground">100 points (₹100)</strong> when a friend you refer places their first order</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">💎</span>
            <span>Each point is worth <strong className="text-foreground">₹1.00</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">📦</span>
            <span>Order points are credited after your order is <strong className="text-foreground">delivered</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">🛒</span>
            <span>Redeem points at checkout to reduce your payment</span>
          </li>
        </ul>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-medium">Points History</h2>
        </div>

        {txLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Star className="size-8 opacity-30" />
            <p className="text-sm">No points history yet. Start shopping to earn!</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => {
              const cfg = txConfig[tx.type]
              const Icon = cfg.icon
              const isCredit = tx.points > 0
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
                      {isCredit ? '+' : ''}{tx.points} pts
                    </p>
                    {tx.monetaryValue != null && (
                      <p className="text-xs text-muted-foreground">{fmtRupees(Number(tx.monetaryValue))}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

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
