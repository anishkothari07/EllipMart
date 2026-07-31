'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ChevronRight, RotateCcw } from 'lucide-react';
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';
import { OrderStatusBadge } from '@/components/merchant/order/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/merchant/order/PaymentStatusBadge';
import { FulfillmentStatusBadge } from '@/components/merchant/order/FulfillmentStatusBadge';
import { OrderSummary } from '@/components/merchant/order/OrderSummary';
import { OrderItemsTable } from '@/components/merchant/order/OrderItemsTable';
import { CustomerCard } from '@/components/merchant/order/CustomerCard';
import { AddressCard } from '@/components/merchant/order/AddressCard';
import { ShipmentCard } from '@/components/merchant/order/ShipmentCard';
import { OrderTimeline } from '@/components/merchant/order/OrderTimeline';
import { OrderNotes } from '@/components/merchant/order/OrderNotes';
import { FulfillmentPanel } from '@/components/merchant/order/FulfillmentPanel';
import { StatusUpdatePanel } from '@/components/merchant/order/StatusUpdatePanel';
import { CommunicationPanel } from '@/components/merchant/order/CommunicationPanel';
import { RefundDialog } from '@/components/merchant/order/RefundDialog';
import { PaymentPanel } from '@/components/merchant/order/PaymentPanel';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MerchantOrderDetailPage({ params }: PageProps) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MerchantOrderClient.getOrderDetail(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 space-y-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Orders
        </Link>
        <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-3xl text-center space-y-2">
          <p className="font-semibold text-destructive">Error Loading Order</p>
          <p className="text-xs text-muted-foreground">{error || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  const maxRefundable = order.grandTotal;
  const isRefundable = order.payment?.status === 'CAPTURED' && order.status !== 'REFUNDED';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Link href="/orders" className="hover:text-foreground transition-colors">
              Orders
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">#{order.orderNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
              Order #{order.orderNumber}
            </h1>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.payment?.status || null} />
              <FulfillmentStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrder}
            className="size-9 flex items-center justify-center border border-border/80 hover:bg-muted/50 rounded-2xl transition-colors"
            title="Reload details"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </button>
          <Link
            href="/orders"
            className="px-4 py-2 border border-border/80 hover:bg-muted/50 text-xs font-bold text-foreground rounded-2xl transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Items, summary, timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <OrderItemsTable items={order.items} />

          {/* Refund CTA if paid */}
          {isRefundable && (
            <div className="p-5 rounded-2xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-foreground">Refund Customer</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Process full or partial refund for items returned or damaged.
                </p>
              </div>
              <button
                onClick={() => setShowRefundDialog(true)}
                className="px-3.5 py-2 text-xs font-bold border border-destructive/20 text-destructive hover:bg-destructive/5 rounded-xl transition-all duration-150 flex items-center gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Initiate Refund
              </button>
            </div>
          )}

          {/* Chronological Timeline */}
          <OrderTimeline timeline={order.timeline} />
        </div>

        {/* Right column: Customer, addresses, fulfillment operations, internal notes */}
        <div className="space-y-6">
          {/* Order Summary costs */}
          <OrderSummary order={order} />

          {/* Payment Panel: COD collection, payment status */}
          {order.payment && (
            <PaymentPanel order={order} onSuccess={loadOrder} />
          )}

          {/* Fulfillment Panel */}
          <FulfillmentPanel orderId={order.id} status={order.status} onSuccess={loadOrder} />

          {/* Status Manual Update Panel */}
          <StatusUpdatePanel orderId={order.id} currentStatus={order.status} onSuccess={loadOrder} />

          {/* Shipment status/tracking Card */}
          <ShipmentCard order={order} />

          {/* Customer info */}
          <CustomerCard customer={order.customer} />

          {/* Shipping Address */}
          <AddressCard title="Shipping" address={order.shippingAddress} />

          {/* Billing Address */}
          <AddressCard title="Billing" rawAddress={order.billingAddr} />

          {/* Internal Notes card */}
          <OrderNotes orderId={order.id} notes={order.notes} onNoteAdded={loadOrder} />

          {/* Transactional Emails Mock */}
          <CommunicationPanel orderNumber={order.orderNumber} customerEmail={order.customer.email} />
        </div>
      </div>

      {/* Refund Modal Dialog */}
      {showRefundDialog && (
        <RefundDialog
          orderId={order.id}
          maxAmount={maxRefundable}
          onSuccess={() => {
            setShowRefundDialog(false);
            loadOrder();
          }}
          onClose={() => setShowRefundDialog(false)}
        />
      )}
    </div>
  );
}
