'use client';

import React, { useState } from 'react';
import { Mail, Check, Eye, EyeOff } from 'lucide-react';

export function NotificationSettings() {
  const [activePreview, setActivePreview] = useState<'CONFIRMATION' | 'SHIPPING' | 'DELIVERED' | null>(null);

  // Status values
  const [config, setConfig] = useState({
    orderCreated: true,
    orderShipped: true,
    orderDelivered: true,
    adminNewOrder: true,
  });

  const toggle = (key: keyof typeof config) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  const templates = {
    CONFIRMATION: {
      title: 'Order Confirmation Email',
      subject: 'Order Confirmed: Thank you for shopping with us! (#ORD-123456)',
      body: `Hi Customer,\n\nThanks for shopping with EllipMart! We've received your order and are getting it ready for shipment.\n\nYour Order details:\n- Item: Premium Noise-Cancelling Headphones x 1\n- Price: ₹2,499.00\n- Shipping Address: 123 Prime Towers, Bangalore\n\nYou'll receive another notification once your items ship.\n\nBest regards,\nEllipMart Support`,
    },
    SHIPPING: {
      title: 'Shipping Notification Email',
      subject: 'Your order has been shipped! (#ORD-123456)',
      body: `Hi Customer,\n\nGood news! Your order #ORD-123456 has been shipped via Delhivery.\n\nTracking Details:\n- Carrier: Delhivery\n- Tracking Code: TRK7890123\n- Est. Delivery: 2-3 Business Days\n\nYou can track the package status using the tracking code provided above.\n\nBest regards,\nEllipMart Fulfilment`,
    },
    DELIVERED: {
      title: 'Order Delivered Email',
      subject: 'Delivered: Your package has arrived! (#ORD-123456)',
      body: `Hi Customer,\n\nYour package for order #ORD-123456 has been successfully delivered to your address.\n\nWe hope you love your purchase! If you have any feedback or queries, reply directly to this email.\n\nBest regards,\nEllipMart Team`,
    },
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Mail className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Transactional Email Notifications</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toggle Panel */}
        <div className="lg:col-span-2 space-y-3">
          {[
            {
              key: 'orderCreated',
              title: 'Order Confirmation',
              desc: 'Sent automatically to customer immediately after purchase to confirm receipt of payment.',
              previewKey: 'CONFIRMATION',
            },
            {
              key: 'orderShipped',
              title: 'Shipping Confirmation',
              desc: 'Sent to customer once tracking numbers or carrier details are populated.',
              previewKey: 'SHIPPING',
            },
            {
              key: 'orderDelivered',
              title: 'Delivery Confirmation',
              desc: 'Sent automatically to customer after delivery agent confirms delivery.',
              previewKey: 'DELIVERED',
            },
            {
              key: 'adminNewOrder',
              title: 'New Order Alert (Merchant Staff)',
              desc: 'Admin alert sent to the customer support team once new payments clear.',
              previewKey: null,
            },
          ].map((item) => {
            const isEnabled = config[item.key as keyof typeof config];
            return (
              <div
                key={item.key}
                className="p-4 border border-border/80 bg-card rounded-2xl flex items-start justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-center">
                  {item.previewKey && (
                    <button
                      onClick={() => setActivePreview(activePreview === item.previewKey ? null : (item.previewKey as any))}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded"
                      title="Preview email template"
                    >
                      <Eye className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggle(item.key as any)}
                    className={`px-3 py-1 text-[10px] font-bold border rounded-xl transition-colors ${
                      isEnabled
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Panel */}
        <div className="space-y-3">
          {activePreview ? (
            <div className="p-4 border border-border bg-muted/10 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="border-b border-border/40 pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Preview: </span>
                <span className="text-xs font-bold text-foreground">{templates[activePreview].title}</span>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground">
                  <span className="font-bold">Subject:</span>{' '}
                  <span className="text-foreground font-semibold">{templates[activePreview].subject}</span>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <pre className="text-[10px] font-sans text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {templates[activePreview].body}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-border/80 rounded-2xl text-center text-muted-foreground py-16">
              <Mail className="size-8 stroke-[1.5] mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-xs font-semibold">Template Preview</p>
              <p className="text-[9px] mt-0.5">Click the eye icon next to a notification to preview its email layout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
