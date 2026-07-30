'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';
import { cn } from '@corecart/shared';

export function AuditLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await MerchantOperationsClient.getAuditLogs({
        page,
        limit: 15,
        search: search || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
      });
      setLogs(data.items || []);
      setTotalCount(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, action, entityType]);

  useEffect(() => {
    loadLogs();
  }, [page, search, action, entityType]);

  const formatChanges = (changesStr: string) => {
    try {
      const parsed = JSON.parse(changesStr);
      if (!parsed.prev && parsed.curr) return `Created entity: ${JSON.stringify(parsed.curr)}`;
      if (parsed.prev && !parsed.curr) return `Deleted entity`;
      
      // Calculate diff
      const diffKeys = Object.keys(parsed.curr || {}).filter(
        (k) => JSON.stringify(parsed.prev[k]) !== JSON.stringify(parsed.curr[k])
      );
      
      if (diffKeys.length === 0) return 'No visible attribute changes.';
      return diffKeys.map((k) => `Changed ${k}: "${parsed.prev[k]}" → "${parsed.curr[k]}"`).join('; ');
    } catch {
      return changesStr;
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Operational Audit Logs ({totalCount})</h3>
        </div>
        <button
          onClick={loadLogs}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          title="Reload logs"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, changes content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs border border-border bg-background rounded-xl outline-none"
          />
        </div>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="px-3 py-1.5 text-xs border border-border bg-background rounded-xl outline-none cursor-pointer"
        >
          <option value="">Any Action</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="px-3 py-1.5 text-xs border border-border bg-background rounded-xl outline-none cursor-pointer"
        >
          <option value="">Any Entity Type</option>
          <option value="WebsiteSettings">Store Settings</option>
          <option value="ShippingZone">Shipping Zones</option>
          <option value="ShippingRate">Shipping Rates</option>
          <option value="TaxRule">Tax Rates</option>
          <option value="StaffUser">Staff Accounts</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 italic border border-dashed rounded-2xl">
            No audit history logs recorded.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                {['Timestamp', 'User', 'Action', 'Entity', 'Details'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 px-2 first:pl-0 last:pr-0 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3 px-2 pl-0 text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  {/* User */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    <p className="font-bold text-foreground">{log.userName}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{log.userEmail}</p>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none leading-none',
                        log.action === 'CREATE'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : log.action === 'DELETE'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      )}
                    >
                      {log.action}
                    </span>
                  </td>

                  {/* Entity */}
                  <td className="py-3 px-2 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                    {log.entityType} ({log.entityId.slice(0, 8)})
                  </td>

                  {/* Details */}
                  <td className="py-3 px-2 pr-0 font-medium text-foreground max-w-xs truncate" title={formatChanges(log.changes)}>
                    {formatChanges(log.changes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground font-semibold">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 border rounded hover:bg-muted disabled:opacity-40"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 border rounded hover:bg-muted disabled:opacity-40"
            >
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
