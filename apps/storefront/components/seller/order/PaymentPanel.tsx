'use client';

import React, { useState } from 'react';
import { Banknote, Check, AlertCircle, Clock, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';
import type { MerchantOrderDetail } from '@corecart/commerce';

function getMethodIcon(code: string) {
  switch (code?.toUpperCase()) {
    case 'COD':      return <Banknote className="size-4 text-teal-500" />;
    case 'UPI':      return <Smartphone className="size-4 text-indigo-500" />;
    case 'CARD':     return <CreditCard className="size-4 text-blue-500" />;
    case 'NETBANKING': return <Building2 className="size-4 text-emerald-500" />;
    case 'WALLET':   return <Wallet className="size-4 text-amber-500" />;
    default:         return <CreditCard className="size-4 text-muted-foreground" />;
  }
}

interface PaymentPanelProps {
  order: MerchantOrderDetail;
  onSuccess: () => void;
}

export function PaymentPanel({ order, onSuccess }: PaymentPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const payment = order.payment;
  if (!payment) return null;

  const isCod = payment.paymentMethodCode === 'COD';
  const isPaid = payment.status === 'CAPTURED';
  const isPending = payment.status === 'PENDING';
  const canCollect = isCod && isPending;

  const handleCollect = async () => {
    setLoading(true);
    setError(null);
    try {
      await MerchantOrderClient.markCodPaymentCollected(order.id);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to mark payment collected.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadgeClass = isPaid
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : isCod
    ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

  const statusLabel = isPaid
    ? 'Paid'
    : isCod
    ? 'Pending collection'
    : 'Pending';

  const paidAt = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : null;

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-teal-500/10 flex items-center justify-center">
          <Banknote className="size-3.5 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Payment</h3>
      </div>

      {/* Payment Info */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getMethodIcon(payment.paymentMethodCode)}
            <span className="text-xs font-semibold text-foreground">
              {isCod ? 'Cash on Delivery' : payment.paymentMethodCode.replace(/_/g, ' ')}
            </span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>

        {isCod && (
          <p className="text-[11px] text-muted-foreground">
            {isPaid
              ? 'Customer paid cash at delivery.'
              : 'Customer pays cash when the order is delivered.'}
          </p>
        )}

        {paidAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span>Collected on {paidAt}</span>
          </div>
        )}
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5 shrink-0 mt-0.5" />
          <span>Payment marked as collected!</span>
        </div>
      )}

      {/* COD Collection button */}
      {canCollect && !success && (
        <button
          onClick={handleCollect}
          disabled={loading}
          className="w-full py-2 text-xs font-bold bg-teal-600 text-white hover:bg-teal-600/90 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <div className="size-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
          ) : (
            <Check className="size-3.5" />
          )}
          Mark payment collected
        </button>
      )}

      {/* Already paid — no action */}
      {isPaid && !canCollect && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="size-4" />
          <span>Payment confirmed</span>
        </div>
      )}
    </div>
  );
}
