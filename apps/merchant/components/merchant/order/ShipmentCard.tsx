'use client';

import React from 'react';
import { Truck, Copy, CheckCheck } from 'lucide-react';
import type { MerchantOrderDetail } from '@corecart/commerce';

interface ShipmentCardProps {
  order: MerchantOrderDetail;
}

export function ShipmentCard({ order }: ShipmentCardProps) {
  const [copied, setCopied] = React.useState(false);

  const hasShipment = order.trackingNumber || order.shippingProvider || order.estimatedDelivery;

  const copyTracking = async () => {
    if (!order.trackingNumber) return;
    await navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasShipment) {
    return (
      <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
            <Truck className="size-3.5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Shipment</h3>
        </div>
        <p className="text-xs text-muted-foreground">No shipment created yet.</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Truck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Shipment</h3>
      </div>

      <div className="space-y-2.5">
        {order.shippingProvider && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Provider</span>
            <span className="text-xs font-semibold text-foreground">{order.shippingProvider}</span>
          </div>
        )}

        {order.trackingNumber && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Tracking #</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">{order.trackingNumber}</span>
              <button
                onClick={copyTracking}
                className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Copy tracking number"
              >
                {copied ? <CheckCheck className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
        )}

        {order.estimatedDelivery && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Est. Delivery</span>
            <span className="text-xs font-semibold text-foreground">{order.estimatedDelivery}</span>
          </div>
        )}
      </div>
    </div>
  );
}
