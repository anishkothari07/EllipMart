'use client';

import React, { useState } from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { formatPrice } from '@corecart/shared';
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';

interface RefundDialogProps {
  orderId: string;
  maxAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function RefundDialog({ orderId, maxAmount, onSuccess, onClose }: RefundDialogProps) {
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid refund amount greater than 0.');
      return;
    }

    if (numericAmount > maxAmount) {
      setError(`Refund amount cannot exceed paid amount of ${formatPrice(maxAmount, 'INR')}.`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the refund.');
      return;
    }

    setLoading(true);
    try {
      await MerchantOrderClient.initiateRefund(orderId, numericAmount, reason);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to process refund. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-float space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <RotateCcw className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Initiate Refund</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Process full or partial refund to customer</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-2.5 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Refund Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Refund Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">₹</span>
              <input
                type="number"
                step="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="w-full pl-7 pr-4 py-2 text-sm border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground px-1">
              <span>Max Refundable: {formatPrice(maxAmount, 'INR')}</span>
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toString())}
                disabled={loading}
                className="text-accent hover:underline font-semibold"
              >
                Use Full Amount
              </button>
            </div>
          </div>

          {/* Refund Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Reason for Refund</label>
            <textarea
              placeholder="e.g. Customer returned items, order cancellation, damaged product..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150 resize-none"
            />
          </div>

          {/* Warning Note */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-[10px] text-muted-foreground leading-relaxed">
            Note: This simulates the refund process. In production, this would communicate with the active payment gateways (Razorpay, Stripe) to reverse transaction charges.
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-foreground border border-border hover:bg-muted/50 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/95 rounded-2xl transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <div className="size-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
              ) : (
                <RotateCcw className="size-3.5" />
              )}
              Confirm Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
