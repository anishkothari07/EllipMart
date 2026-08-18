'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import type { MerchantOrderDetail } from '@corecart/commerce';

interface AddressCardProps {
  title: 'Shipping' | 'Billing';
  address?: MerchantOrderDetail['shippingAddress'] | null;
  rawAddress?: string | null;
}

function AddressLine({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-1.5">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <span className="text-[10px] text-foreground font-medium">{value}</span>
    </div>
  );
}

export function AddressCard({ title, address, rawAddress }: AddressCardProps) {
  const isEmpty =
    !address?.street &&
    !address?.city &&
    !address?.state &&
    !rawAddress;

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <MapPin className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">{title} Address</h3>
      </div>

      {isEmpty ? (
        <p className="text-xs text-muted-foreground">No address on file.</p>
      ) : rawAddress ? (
        // For billing addr stored as JSON string
        <BillingAddressDisplay raw={rawAddress} />
      ) : address ? (
        <div className="space-y-1.5">
          <AddressLine label="Name" value={address.name} />
          <AddressLine label="Phone" value={address.phone} />
          <AddressLine label="Street" value={address.street} />
          <AddressLine label="City" value={address.city} />
          <AddressLine label="State" value={address.state} />
          <AddressLine label="Country" value={address.country} />
          <AddressLine label="PIN" value={address.postalCode} />
        </div>
      ) : null}
    </div>
  );
}

function BillingAddressDisplay({ raw }: { raw: string }) {
  let parsed: Record<string, string> | null = null;

  try {
    parsed = JSON.parse(raw) as Record<string, string>;
  } catch {
    parsed = null;
  }

  if (!parsed) return <p className="text-xs text-muted-foreground">{raw}</p>;

  return (
    <div className="space-y-1.5">
      <AddressLine label="Name" value={parsed.name} />
      <AddressLine label="Phone" value={parsed.phone} />
      <AddressLine label="Street" value={parsed.street ?? parsed.address1} />
      <AddressLine label="City" value={parsed.city} />
      <AddressLine label="State" value={parsed.state} />
      <AddressLine label="Country" value={parsed.country} />
      <AddressLine label="PIN" value={parsed.postalCode ?? parsed.zip} />
    </div>
  );
}
