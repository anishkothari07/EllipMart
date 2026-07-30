'use client';

import React, { useEffect, useState } from 'react';
import { MerchantCustomerClient } from '@/lib/services/merchant-customer-client';
import { CustomerTable } from '@/components/merchant/customer/CustomerTable';
import { RefreshCw, Search, X, ChevronRight, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserStatus } from '@prisma/client';
import { cn } from '@corecart/shared';

const SEGMENTS = [
  { value: '', label: 'All Customers' },
  { value: 'VIP', label: 'VIP' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'NEW', label: 'New (30d)' },
  { value: 'RETURNING', label: 'Returning' },
  { value: 'HIGH_SPEND', label: 'High Spend' },
  { value: 'INACTIVE', label: 'Inactive (90d+)' },
];

const SORT_OPTIONS = [
  { value: 'customerSince_desc', label: 'Newest Members' },
  { value: 'customerSince_asc', label: 'Oldest Members' },
  { value: 'totalSpend_desc', label: 'Spend: High → Low' },
  { value: 'totalOrders_desc', label: 'Orders: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
];

export default function MerchantCustomerListPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & State
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('customerSince_desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const [sortField, sortDir] = sort.split('_') as [string, 'asc' | 'desc'];

      const data = await MerchantCustomerClient.listCustomers({
        page,
        limit,
        search: search || undefined,
        segment: segment || undefined,
        status: status || undefined,
        sortField,
        sortDir,
      });

      setCustomers(data.items);
      setTotalCount(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to fetch customer directories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, segment, status, sort]);

  useEffect(() => {
    loadCustomers();
    setSelectedIds([]);
  }, [page, search, segment, status, sort]);

  const handleBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    setBulkLoading(true);
    try {
      await MerchantCustomerClient.bulkUpdateStatus(selectedIds, bulkStatus as UserStatus);
      setStatusMsg({
        type: 'success',
        text: `Successfully updated status to ${bulkStatus} for ${selectedIds.length} customer records.`,
      });
      setSelectedIds([]);
      setBulkStatus('');
      await loadCustomers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update customer records.' });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Operations</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Customers</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif mt-1">Customers</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer directories, view profiles, track segments, and log staff notes.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="self-start sm:self-center size-9 flex items-center justify-center border border-border/80 hover:bg-muted/50 rounded-2xl transition-colors shrink-0"
          title="Reload directories"
        >
          <RefreshCw className={`size-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/5 border-destructive/10 text-destructive'
          }`}
        >
          <span className="font-medium">{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-[10px] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main card */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by customer name, email, phone, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150 placeholder:text-muted-foreground"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="pl-3 pr-8 py-2.5 text-sm border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 transition-all duration-150 text-foreground cursor-pointer min-w-[180px] appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Segments:</span>
            {SEGMENTS.map((seg) => (
              <button
                key={seg.value}
                onClick={() => setSegment(seg.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                  segment === seg.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground',
                )}
              >
                {seg.label}
              </button>
            ))}

            {/* Status dropdown filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={cn(
                'pl-3 pr-6 py-1.5 text-xs border rounded-full outline-none transition-all duration-150 cursor-pointer appearance-none font-medium ml-auto',
                status
                  ? 'border-foreground/30 bg-foreground/5 text-foreground'
                  : 'border-border/80 bg-background text-muted-foreground',
              )}
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px' }}
            >
              <option value="">Any Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_VERIFICATION">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <span className="text-xs text-muted-foreground font-medium ml-2">{totalCount} clients</span>
          </div>
        </div>

        {/* Bulk Action panel */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-muted/30 border border-border/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-semibold text-muted-foreground px-1">
              {selectedIds.length} client{selectedIds.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={bulkLoading}
                className="pl-3 pr-8 py-1.5 text-xs border border-border bg-background rounded-xl outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
              >
                <option value="">Update Status...</option>
                <option value="ACTIVE">Activate Accounts</option>
                <option value="SUSPENDED">Suspend Accounts</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={bulkLoading || !bulkStatus}
                className="px-3.5 py-1.5 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 rounded-xl transition-all duration-150 flex items-center gap-1.5"
              >
                {bulkLoading ? (
                  <div className="size-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Main table */}
        <CustomerTable
          customers={customers}
          loading={loading}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 border border-border/80 rounded-xl text-xs font-bold text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-3 py-1.5 border border-border/80 rounded-xl text-xs font-bold text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                Next
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
