'use client';

import React from 'react';
import { User, Mail, Phone, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { MerchantOrderDetail } from '@corecart/commerce';

interface CustomerCardProps {
  customer: MerchantOrderDetail['customer'];
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Customer</h3>
        <Link
          href={`/customers/${customer.id}`}
          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors font-semibold"
        >
          View profile <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="size-10 rounded-2xl bg-foreground/10 flex items-center justify-center shrink-0">
          <User className="size-5 text-foreground/60" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">{customer.name}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Customer ID: {customer.id.slice(0, 8)}…</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
            <Mail className="size-3.5 text-muted-foreground" />
          </div>
          <a href={`mailto:${customer.email}`} className="text-xs text-foreground hover:text-accent transition-colors font-medium truncate">
            {customer.email}
          </a>
        </div>

        {customer.phone && (
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <Phone className="size-3.5 text-muted-foreground" />
            </div>
            <a href={`tel:${customer.phone}`} className="text-xs text-foreground hover:text-accent transition-colors font-medium">
              {customer.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
