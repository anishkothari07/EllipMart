'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatPrice } from '@corecart/shared';
import type { CustomerSummary } from '@corecart/commerce';
import { cn } from '@corecart/shared';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface CustomerTableProps {
  customers: CustomerSummary[];
  loading: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
}

export function CustomerTable({ customers, loading, selectedIds, onSelectIds }: CustomerTableProps) {
  const allSelected = customers.length > 0 && selectedIds.length === customers.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectIds([]);
    } else {
      onSelectIds(customers.map((c) => c.id));
    }
  };

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter((x) => x !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="w-10 py-3 px-3 text-left" />
              {['Customer', 'Location/ID', 'Orders', 'Total Spend', 'Avg. Order', 'Last Order', 'Since', 'Status'].map((h) => (
                <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
              <th className="w-10 py-3 px-3" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border/40">
                {Array.from({ length: 10 }).map((_, j) => (
                  <td key={j} className="py-3.5 px-3">
                    <div className="h-4 bg-muted/60 rounded-full animate-pulse" style={{ width: j === 0 ? '16px' : j === 9 ? '16px' : `${50 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
        <div className="size-14 rounded-3xl bg-muted/50 flex items-center justify-center">
          <Users className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">No customers found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your dynamic search filters or segments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {/* Checkbox all */}
            <th className="w-10 py-3 px-3">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="size-4 rounded border-border/80 cursor-pointer accent-foreground"
                />
              </div>
            </th>
            {[
              { key: 'customer', label: 'Customer' },
              { key: 'details', label: 'Contact Info' },
              { key: 'orders', label: 'Orders' },
              { key: 'spend', label: 'Total Spend' },
              { key: 'avg', label: 'Avg. Order' },
              { key: 'last', label: 'Last Order' },
              { key: 'since', label: 'Member Since' },
              { key: 'status', label: 'Status' },
            ].map((col) => (
              <th
                key={col.key}
                className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            <th className="w-10 py-3 px-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-border/40">
          {customers.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <tr
                key={c.id}
                className={cn(
                  'group hover:bg-muted/30 transition-colors duration-100',
                  isSelected && 'bg-muted/20',
                )}
              >
                {/* Checkbox */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(c.id)}
                      className="size-4 rounded border-border/80 cursor-pointer accent-foreground"
                    />
                  </div>
                </td>

                {/* Customer name / avatar info */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <Link
                    href="#"
                    className="flex items-center gap-2.5 group-hover:text-accent transition-colors"
                  >
                    <div className="size-8 rounded-xl bg-foreground/10 text-foreground/60 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {c.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[130px]">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{c.id.slice(0, 8)}…</p>
                    </div>
                  </Link>
                </td>

                {/* Contact detail */}
                <td className="py-3.5 px-3">
                  <div>
                    <p className="text-xs text-foreground font-medium leading-tight truncate max-w-[150px]">{c.email}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{c.phone || 'No phone'}</p>
                  </div>
                </td>

                {/* Total Orders */}
                <td className="py-3.5 px-3">
                  <span className="text-xs font-semibold text-foreground">{c.totalOrders}</span>
                </td>

                {/* Total Spend */}
                <td className="py-3.5 px-3 font-semibold text-foreground whitespace-nowrap">
                  {formatPrice(c.totalSpend, 'INR')}
                </td>

                {/* Avg Order */}
                <td className="py-3.5 px-3 text-muted-foreground whitespace-nowrap">
                  {formatPrice(c.avgOrderValue, 'INR')}
                </td>

                {/* Last Order Date */}
                <td className="py-3.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                  {c.lastOrderDate ? formatDate(c.lastOrderDate) : 'Never'}
                </td>

                {/* Member Since */}
                <td className="py-3.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(c.customerSince)}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none leading-none',
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    )}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </td>

                {/* Link */}
                <td className="py-3.5 px-3">
                  <Link
                    href="#"
                    className="size-7 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all duration-150"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
