'use client';

import React, { useState } from 'react';
import { Truck, Package, Check, X, Calendar } from 'lucide-react';
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';

interface FulfillmentPanelProps {
  orderId: string;
  status: string;
  onSuccess: () => void;
}

export function FulfillmentPanel({ orderId, status, onSuccess }: FulfillmentPanelProps) {
  const [loading, setLoading] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);

  // Form states for Shipping
  const [provider, setProvider] = useState('FedEx');
  const [tracking, setTracking] = useState('');
  const [estDelivery, setEstDelivery] = useState('');

  const triggerFulfillmentAction = async (
    action: 'PACK' | 'MARK_READY' | 'SHIP' | 'DELIVER' | 'CANCEL',
    payload: any = {},
  ) => {
    setLoading(true);
    try {
      await MerchantOrderClient.fulfillOrder(orderId, action, payload);
      setShowShipForm(false);
      onSuccess();
    } catch (err) {
      console.error(`Fulfillment action ${action} failed:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tracking.trim()) return;
    triggerFulfillmentAction('SHIP', {
      shippingProvider: provider,
      trackingNumber: tracking,
      estimatedDelivery: estDelivery || undefined,
    });
  };

  // Define buttons based on status
  // PENDING_PAYMENT, CONFIRMED, PROCESSING, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED
  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Truck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Fulfillment Actions</h3>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-3.5 border-2 border-muted-foreground border-t-transparent animate-spin rounded-full" />
          <span>Processing fulfillment status change...</span>
        </div>
      )}

      {!loading && !showShipForm && (
        <div className="flex flex-wrap gap-2">
          {/* Confirmed / Pending Payment -> Pack */}
          {(status === 'CONFIRMED' || status === 'PENDING_PAYMENT' || status === 'PROCESSING') && (
            <>
              <button
                onClick={() => triggerFulfillmentAction('PACK')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
              >
                <Package className="size-3.5" />
                Pack Order
              </button>
              {status !== 'PROCESSING' && (
                <button
                  onClick={() => triggerFulfillmentAction('MARK_READY')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border hover:bg-muted/50 rounded-xl transition-colors"
                >
                  Mark as Processing
                </button>
              )}
            </>
          )}

          {/* Packed -> Ship */}
          {status === 'PACKED' && (
            <button
              onClick={() => setShowShipForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
            >
              <Truck className="size-3.5" />
              Ship Order
            </button>
          )}

          {/* Shipped -> Deliver */}
          {status === 'SHIPPED' && (
            <button
              onClick={() => triggerFulfillmentAction('DELIVER')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-600/90 transition-colors"
            >
              <Check className="size-3.5" />
              Mark as Delivered
            </button>
          )}

          {/* Cancel fulfillment capability if packed or shipped */}
          {(status === 'PACKED' || status === 'SHIPPED') && (
            <button
              onClick={() => triggerFulfillmentAction('CANCEL', { note: 'Fulfillment cancelled by merchant' })}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-destructive/20 text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
            >
              <X className="size-3.5" />
              Cancel Fulfillment
            </button>
          )}

          {/* Finished or Cancelled states */}
          {(status === 'DELIVERED' || status === 'CANCELLED' || status === 'RETURNED' || status === 'REFUNDED') && (
            <p className="text-xs text-muted-foreground italic">
              No further fulfillment actions are available for this order status ({status.replace(/_/g, ' ')}).
            </p>
          )}
        </div>
      )}

      {showShipForm && (
        <form onSubmit={handleShipSubmit} className="space-y-3.5 p-3 rounded-2xl border border-border bg-muted/20 animate-in slide-in-from-top-2 duration-150">
          <h4 className="text-xs font-bold text-foreground">Create Shipment</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Carrier Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-border/80 bg-background rounded-lg outline-none"
              >
                <option value="FedEx">FedEx</option>
                <option value="DHL">DHL</option>
                <option value="Delhivery">Delhivery</option>
                <option value="BlueDart">Blue Dart</option>
                <option value="UPS">UPS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Tracking Number</label>
              <input
                type="text"
                required
                placeholder="e.g. TRK123456"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                className="w-full px-2.5 py-1 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              Estimated Delivery Date
            </label>
            <input
              type="text"
              placeholder="e.g. Aug 10, 2026 or 3-5 Business Days"
              value={estDelivery}
              onChange={(e) => setEstDelivery(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-border/80 bg-background rounded-lg outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1.5 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowShipForm(false)}
              className="px-3 py-1 text-[10px] font-bold border border-border hover:bg-muted/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-[10px] font-bold bg-foreground text-background hover:bg-foreground/90 rounded-lg flex items-center gap-1"
            >
              <Check className="size-3" />
              Create Shipment
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
