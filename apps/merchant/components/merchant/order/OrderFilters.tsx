'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@corecart/shared';

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Any Payment' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CAPTURED', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'REFUND_PENDING', label: 'Refund Pending' },
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'grandTotal_desc', label: 'Amount: High → Low' },
  { value: 'grandTotal_asc', label: 'Amount: Low → High' },
  { value: 'updatedAt_desc', label: 'Recently Updated' },
];

export interface OrderFiltersState {
  search: string;
  status: string;
  paymentStatus: string;
  sort: string;
  dateFrom: string;
  dateTo: string;
}

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFiltersChange: (filters: OrderFiltersState) => void;
  totalCount: number;
}

export function OrderFilters({ filters, onFiltersChange, totalCount }: OrderFiltersProps) {
  const set = (key: keyof OrderFiltersState, value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.paymentStatus ||
    filters.dateFrom ||
    filters.dateTo;

  const clearAll = () =>
    onFiltersChange({ search: '', status: '', paymentStatus: '', sort: 'createdAt_desc', dateFrom: '', dateTo: '' });

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email…"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150 placeholder:text-muted-foreground"
          />
          {filters.search && (
            <button
              onClick={() => set('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value)}
          className="pl-3 pr-8 py-2.5 text-sm border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 transition-all duration-150 text-foreground cursor-pointer min-w-[180px] appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Filter className="size-3.5" />
          Filter:
        </div>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
          className={cn(
            'pl-3 pr-6 py-1.5 text-xs border rounded-full outline-none transition-all duration-150 cursor-pointer appearance-none font-medium',
            filters.status
              ? 'border-foreground/30 bg-foreground/5 text-foreground'
              : 'border-border/80 bg-background text-muted-foreground',
          )}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px' }}
        >
          {ORDER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Payment status filter */}
        <select
          value={filters.paymentStatus}
          onChange={(e) => set('paymentStatus', e.target.value)}
          className={cn(
            'pl-3 pr-6 py-1.5 text-xs border rounded-full outline-none transition-all duration-150 cursor-pointer appearance-none font-medium',
            filters.paymentStatus
              ? 'border-foreground/30 bg-foreground/5 text-foreground'
              : 'border-border/80 bg-background text-muted-foreground',
          )}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px' }}
        >
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
            className="px-3 py-1.5 text-xs border border-border/80 bg-background rounded-full outline-none focus:border-foreground/30 transition-all duration-150 text-muted-foreground cursor-pointer"
            title="From date"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set('dateTo', e.target.value)}
            className="px-3 py-1.5 text-xs border border-border/80 bg-background rounded-full outline-none focus:border-foreground/30 transition-all duration-150 text-muted-foreground cursor-pointer"
            title="To date"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <X className="size-3.5" />
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground font-medium">{totalCount} orders</span>
      </div>
    </div>
  );
}
