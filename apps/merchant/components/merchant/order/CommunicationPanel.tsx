'use client';

import React, { useState } from 'react';
import { Mail, Send, Check } from 'lucide-react';

interface CommunicationPanelProps {
  orderNumber: string;
  customerEmail: string;
}

export function CommunicationPanel({ orderNumber, customerEmail }: CommunicationPanelProps) {
  const [activeTemplate, setActiveTemplate] = useState<'CONFIRMATION' | 'SHIPPING' | 'DELIVERY'>('CONFIRMATION');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const templates = {
    CONFIRMATION: {
      subject: `Order Confirmation - #${orderNumber}`,
      body: `Hi there!\n\nYour order #${orderNumber} has been successfully placed. We're getting it ready now.\n\nThanks for shopping with EllipMart!`,
    },
    SHIPPING: {
      subject: `Your order #${orderNumber} is on the way!`,
      body: `Hi there!\n\nGood news! Your order #${orderNumber} has shipped and is on the way to you.\n\nYou can track its progress on our website.`,
    },
    DELIVERY: {
      subject: `Delivered: Order #${orderNumber}`,
      body: `Hi there!\n\nYour order #${orderNumber} has been delivered successfully. We hope you enjoy your purchase!`,
    },
  };

  const handleSend = () => {
    setSending(true);
    // Simulate API request to email / notification service
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    }, 1000);
  };

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <Mail className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Customer Communication</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 pb-1.5 gap-3 text-[10px] font-bold text-muted-foreground">
        {(['CONFIRMATION', 'SHIPPING', 'DELIVERY'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTemplate(t)}
            className={`pb-1 border-b-2 hover:text-foreground transition-colors ${
              activeTemplate === t ? 'border-foreground text-foreground' : 'border-transparent'
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Preview Card */}
      <div className="p-3 bg-muted/20 border border-border/60 rounded-2xl space-y-2 text-left">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold">To:</span>{' '}
          <span className="text-xs text-foreground font-medium">{customerEmail}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold">Subject:</span>{' '}
          <span className="text-xs text-foreground font-semibold">{templates[activeTemplate].subject}</span>
        </div>
        <div className="pt-2 border-t border-border/40">
          <pre className="text-[10px] font-sans text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {templates[activeTemplate].body}
          </pre>
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={sending || sent}
        className="w-full py-2 text-xs font-bold border border-border bg-background hover:bg-muted/50 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        {sending ? (
          <div className="size-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
        ) : sent ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Send className="size-3.5" />
        )}
        {sent ? 'Notification Sent!' : 'Resend Email Notification'}
      </button>
    </div>
  );
}
