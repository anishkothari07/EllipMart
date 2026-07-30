'use client';

import React, { useEffect, useState } from 'react';
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';
import { OrderFilters, OrderFiltersState } from '@/components/merchant/order/OrderFilters';
import { OrderTable } from '@/components/merchant/order/OrderTable';
import { RefreshCw, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export default function MerchantOrderListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<OrderFiltersState>({
    search: '',
    status: '',
    paymentStatus: '',
    sort: 'createdAt_desc',
    dateFrom: '',
    dateTo: '',
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [sortField, sortDir] = filters.sort.split('_') as [string, 'asc' | 'desc'];

      const data = await MerchantOrderClient.listOrders({
        page,
        limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        sortField,
        sortDir,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });

      setOrders(data.items);
      setTotalCount(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to retrieve orders list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page on filter changes
  }, [filters]);

  useEffect(() => {
    loadOrders();
    setSelectedIds([]); // Clear selection when page or filters change
  }, [page, filters]);

  const handleBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    setBulkLoading(true);
    try {
      await MerchantOrderClient.bulkUpdateStatus(selectedIds, bulkStatus as OrderStatus);
      setStatusMsg({
        type: 'success',
        text: `Successfully updated status to ${bulkStatus.replace(/_/g, ' ')} for ${selectedIds.length} orders.`,
      });
      setSelectedIds([]);
      setBulkStatus('');
      await loadOrders();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update selected orders.' });
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
            <span className="text-foreground">Orders</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif mt-1">Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage transactions, fulfillments, shipments, and customer invoicing
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="self-start sm:self-center size-9 flex items-center justify-center border border-border/80 hover:bg-muted/50 rounded-2xl transition-colors shrink-0"
          title="Reload order list"
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

      {/* Main Card with filters & table */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
        {/* Order Filters component */}
        <OrderFilters filters={filters} onFiltersChange={setFilters} totalCount={totalCount} />

        {/* Bulk Action Panel */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-muted/30 border border-border/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-semibold text-muted-foreground px-1">
              {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected
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
                <option value="CONFIRMED">Confirm Order</option>
                <option value="PROCESSING">Start Processing</option>
                <option value="PACKED">Mark Packed</option>
                <option value="SHIPPED">Mark Shipped</option>
                <option value="DELIVERED">Mark Delivered</option>
                <option value="CANCELLED">Cancel Order</option>
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

        {/* Order list Table */}
        <OrderTable
          orders={orders}
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
