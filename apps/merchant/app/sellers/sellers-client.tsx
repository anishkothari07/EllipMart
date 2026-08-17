'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Copy, Check, ShieldOff, ShieldCheck, Store } from 'lucide-react';
import { updateSellerStatusAction } from './actions';

type Seller = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}
    >
      <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {isActive ? 'Active' : 'Suspended'}
    </span>
  );
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 text-gray-500 hover:text-blue-400 transition-colors"
      title="Copy email"
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export default function SellersClient({ sellers }: { sellers: Seller[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localSellers, setLocalSellers] = useState(sellers);

  const handleStatusToggle = async (seller: Seller) => {
    const newStatus = seller.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setLoadingId(seller.id);
    const res = await updateSellerStatusAction(seller.id, newStatus as 'ACTIVE' | 'SUSPENDED');
    if (res.success) {
      setLocalSellers((prev) =>
        prev.map((s) => (s.id === seller.id ? { ...s, status: newStatus } : s))
      );
    }
    setLoadingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sellers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all seller accounts on EllipMart.{' '}
            <span className="font-semibold text-foreground">{localSellers.length}</span> total.
          </p>
        </div>
        <Link
          href="/sellers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-md"
        >
          <UserPlus className="size-4" />
          Add Seller
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
        {localSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
              <Store className="size-8 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">No sellers yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first seller to get started.
            </p>
            <Link
              href="/sellers/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
            >
              <UserPlus className="size-4" />
              Add Seller
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Seller
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {localSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-muted/10 transition-colors">
                  {/* Seller Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                        {seller.firstName[0]}{seller.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {seller.firstName} {seller.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{seller.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <span className="text-foreground font-medium">{seller.email}</span>
                      <CopyEmailButton email={seller.email} />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={seller.status} />
                  </td>

                  {/* Joined */}
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(seller.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(seller)}
                      disabled={loadingId === seller.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                        seller.status === 'ACTIVE'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                      }`}
                    >
                      {seller.status === 'ACTIVE' ? (
                        <><ShieldOff className="size-3.5" /> Suspend</>
                      ) : (
                        <><ShieldCheck className="size-3.5" /> Activate</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
