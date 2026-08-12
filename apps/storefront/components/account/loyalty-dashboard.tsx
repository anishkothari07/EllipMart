'use client'

import { useState, useEffect } from 'react'
import { Coins, Gift, Share2, Copy, Check, Users, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles } from 'lucide-react'
import { formatPrice } from '@corecart/shared'

interface LoyaltyBalance {
  points: number
  availablePoints: number
  monetaryValue: number
  lifetimeEarned: number
  lifetimeRedeemed: number
}

interface ReferralStats {
  referralCode: string
  totalReferrals: number
  successfulReferrals: number
  totalPointsEarned: number
  referrals: Array<{
    id: string
    refereeName: string
    status: string
    createdAt: string
  }>
}

interface Transaction {
  id: string
  type: string
  points: number
  pointsBalance: number
  monetaryValue: number
  description: string
  createdAt: string
}

export function LoyaltyDashboard() {
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null)
  const [referral, setReferral] = useState<ReferralStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const authHeader = { headers: { 'x-user-id': 'mock-user-id' } }
        const [balRes, refRes, txRes] = await Promise.all([
          fetch('/api/v1/loyalty', authHeader),
          fetch('/api/v1/loyalty/referral', authHeader),
          fetch('/api/v1/loyalty/transactions', authHeader)
        ])

        const balData = await balRes.json()
        const refData = await refRes.json()
        const txData = await txRes.json()

        if (balData.success) setBalance(balData.data)
        if (refData.success) setReferral(refData.data)
        if (txData.success) setTransactions(txData.data.transactions || [])
      } catch (err) {
        console.error('Failed to load loyalty data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const copyReferralLink = () => {
    if (!referral?.referralCode) return
    const link = `${window.location.origin}/auth/login?ref=${referral.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-32 w-full rounded-2xl bg-accent/40" />
        <div className="h-48 w-full rounded-2xl bg-accent/30" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-background p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Gift className="size-4" /> Loyalty Balance
            </span>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              1 pt = ₹1
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {balance?.availablePoints ?? 0}
            </span>
            <span className="text-sm font-medium text-muted-foreground">pts</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Worth <span className="font-semibold text-foreground">{formatPrice(balance?.monetaryValue ?? 0)}</span> on your next purchase
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-emerald-500" /> Lifetime Earned
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {balance?.lifetimeEarned ?? 0}
            </span>
            <span className="text-sm font-medium text-muted-foreground">pts</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Redeemed: <span className="font-semibold text-foreground">{balance?.lifetimeRedeemed ?? 0} pts</span>
          </p>
        </div>

        {/* Referral Earnings */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="size-4 text-indigo-500" /> Referral Earnings
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {referral?.totalPointsEarned ?? 0}
            </span>
            <span className="text-sm font-medium text-muted-foreground">pts</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {referral?.successfulReferrals ?? 0} friends joined & ordered
          </p>
        </div>
      </div>

      {/* Refer a Friend Section */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-background to-background p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Share2 className="size-5 text-indigo-500" /> Refer Friends & Earn Rewards
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Give your friends <span className="font-semibold text-foreground">50 Welcome Points</span> on signup. You get <span className="font-semibold text-foreground">100 Points (₹100)</span> when they place their first order!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-border bg-background px-3.5 h-11 font-mono text-sm font-bold tracking-wider">
              {referral?.referralCode || 'REF-SMARTGO'}
            </div>
            <button
              onClick={copyReferralLink}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-foreground px-4 text-xs font-medium text-background hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              {copied ? 'Copied Link!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Invited Friends List */}
        {referral?.referrals && referral.referrals.length > 0 && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Invited Friends ({referral.referrals.length})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {referral.referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs">
                  <span className="font-medium text-foreground">{r.refereeName}</span>
                  <span className={r.status === 'COMPLETED' ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                    {r.status === 'COMPLETED' ? 'Completed (+100 pts)' : 'Pending Order'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h3 className="text-base font-semibold mb-4">Points Activity History</h3>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No loyalty point transactions yet.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {transactions.map((tx) => {
              const isPositive = tx.points > 0
              return (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {isPositive ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">
                        {tx.description || tx.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isPositive ? `+${tx.points}` : tx.points} pts
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Balance: {tx.pointsBalance} pts
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
