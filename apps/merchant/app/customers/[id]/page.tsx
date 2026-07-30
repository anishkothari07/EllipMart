'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ChevronRight, User } from 'lucide-react';
import { MerchantCustomerClient } from '@/lib/services/merchant-customer-client';
import { CustomerStats } from '@/components/merchant/customer/CustomerStats';
import { CustomerAddress } from '@/components/merchant/customer/CustomerAddress';
import { CustomerTimeline } from '@/components/merchant/customer/CustomerTimeline';
import { CustomerOrders } from '@/components/merchant/customer/CustomerOrders';
import { CustomerNotes } from '@/components/merchant/customer/CustomerNotes';
import { CustomerTags } from '@/components/merchant/customer/CustomerTags';
import { CustomerSegmentBadge } from '@/components/merchant/customer/CustomerSegmentBadge';
import { CustomerCommunication } from '@/components/merchant/customer/CustomerCommunication';
import { cn } from '@corecart/shared';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MerchantCustomerDetailPage({ params }: PageProps) {
  const { id: userId } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MerchantCustomerClient.getCustomerProfile(userId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve customer profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading customer profile details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-12 space-y-4">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Customers
        </Link>
        <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-3xl text-center space-y-2">
          <p className="font-semibold text-destructive">Error Loading Profile</p>
          <p className="text-xs text-muted-foreground">{error || 'Customer profile not found.'}</p>
        </div>
      </div>
    );
  }

  // Determine dynamic segments for display badges
  const displaySegments = [];
  if (profile.stats.totalSpend >= 10000) displaySegments.push('VIP');
  if (profile.tags.includes('Wholesale')) displaySegments.push('Wholesale');
  if (profile.stats.totalOrders > 1) displaySegments.push('Returning');
  else if (profile.stats.totalOrders === 1) displaySegments.push('First Time');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Link href="/customers" className="hover:text-foreground transition-colors">
              Customers
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{profile.firstName} {profile.lastName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
              {profile.firstName} {profile.lastName}
            </h1>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border select-none leading-none',
                profile.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20',
              )}
            >
              {profile.status}
            </span>

            {displaySegments.map((seg) => (
              <CustomerSegmentBadge key={seg} segment={seg} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProfile}
            className="size-9 flex items-center justify-center border border-border/80 hover:bg-muted/50 rounded-2xl transition-colors"
            title="Reload details"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </button>
          <Link
            href="/customers"
            className="px-4 py-2 border border-border/80 hover:bg-muted/50 text-xs font-bold text-foreground rounded-2xl transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
        </div>
      </div>

      {/* Numerical Stats overview */}
      <CustomerStats stats={profile.stats} />

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Orders, addresses and activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order history */}
          <CustomerOrders orders={profile.orders} />

          {/* Address cards list */}
          <CustomerAddress userId={profile.id} addresses={profile.addresses} onUpdate={loadProfile} />

          {/* chronological Activity log */}
          <CustomerTimeline activities={profile.activities} />
        </div>

        {/* Right: profile contact details, tags, notes, communication center */}
        <div className="space-y-6">
          {/* Profile Card details */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4 text-left">
            <h3 className="text-sm font-bold text-foreground">Contact Profile</h3>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-foreground/10 text-foreground/60 flex items-center justify-center shrink-0">
                <User className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {profile.id}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground font-medium">
              <p>Email: <a href={`mailto:${profile.email}`} className="text-foreground hover:underline">{profile.email}</a></p>
              <p>Phone: {profile.phone ? <a href={`tel:${profile.phone}`} className="text-foreground hover:underline">{profile.phone}</a> : 'No phone'}</p>
              <p>Joined: {new Date(profile.customerSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Customer notes */}
          <CustomerNotes userId={profile.id} notes={profile.notes} onUpdate={loadProfile} />

          {/* Tag assignment */}
          <CustomerTags userId={profile.id} tags={profile.tags} onUpdate={loadProfile} />

          {/* Communication panel templates */}
          <CustomerCommunication customerName={`${profile.firstName} ${profile.lastName}`} customerEmail={profile.email} />
        </div>
      </div>
    </div>
  );
}
