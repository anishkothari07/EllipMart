'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchSellersAction, updateSellerStatusAction, createSellerAction } from '../actions';
import { Store, Search, CheckCircle, XCircle, Package, UserPlus, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  SUSPENDED: 'bg-red-500/10 text-red-600',
  PENDING_VERIFICATION: 'bg-yellow-500/10 text-yellow-600',
  INACTIVE: 'bg-muted text-muted-foreground',
};

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', phone: '' };

export default function SellersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchSellersAction({ page, search: search || undefined });
    if (res.success) setData(res.data);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleStatusToggle(sellerId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(sellerId);
    await updateSellerStatusAction(sellerId, newStatus as any);
    await load();
    setActionLoading(null);
  }

  async function handleCreateSeller(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setFormError('All required fields must be filled.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    setFormLoading(true);
    const res = await createSellerAction(form);
    setFormLoading(false);
    if (res.success) {
      setShowModal(false);
      setForm(EMPTY_FORM);
      await load();
    } else {
      setFormError(res.error || 'Failed to create seller.');
    }
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sellers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all registered sellers on the platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5 rounded-xl">
              <Store className="size-3.5" />
              {data?.total ?? 0} Sellers
            </div>
            <button
              onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setFormError(''); }}
              className="flex items-center gap-2 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <UserPlus className="size-3.5" />
              Add Seller
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
          />
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
          {loading ? (
            <div className="py-20 flex items-center justify-center gap-2">
              <div className="size-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
            </div>
          ) : !data?.sellers?.length ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Store className="size-10 opacity-20" />
              <p className="text-sm font-medium">No sellers found</p>
              <p className="text-xs opacity-60">
                {search ? 'Try a different search term.' : 'No sellers have registered yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-2 flex items-center gap-2 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="size-3.5" />
                  Add First Seller
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seller</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Products</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.sellers.map((seller: any) => (
                    <tr key={seller.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center text-xs font-bold">
                            {seller.firstName?.[0]}{seller.lastName?.[0]}
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {seller.firstName} {seller.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{seller.email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Package className="size-3.5 text-muted-foreground" />
                          {seller._count?.sellerProducts ?? 0}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[seller.status] || 'bg-muted text-muted-foreground'}`}>
                          {seller.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(seller.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleStatusToggle(seller.id, seller.status)}
                          disabled={actionLoading === seller.id}
                          title={seller.status === 'ACTIVE' ? 'Suspend Seller' : 'Activate Seller'}
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                            seller.status === 'ACTIVE'
                              ? 'text-red-600 hover:bg-red-500/10'
                              : 'text-emerald-600 hover:bg-emerald-500/10'
                          } ${actionLoading === seller.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === seller.id ? (
                            <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : seller.status === 'ACTIVE' ? (
                            <><XCircle className="size-3.5" /> Suspend</>
                          ) : (
                            <><CheckCircle className="size-3.5" /> Activate</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Page {data.page} of {data.totalPages} · {data.total} sellers
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page === 1} className="text-xs px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                    <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={data.page === data.totalPages} className="text-xs px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Seller Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!formLoading) setShowModal(false); }}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                  <UserPlus className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Add New Seller</h2>
                  <p className="text-[10px] text-muted-foreground">Create a seller account directly</p>
                </div>
              </div>
              <button
                onClick={() => { if (!formLoading) setShowModal(false); }}
                className="size-8 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSeller} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="John"
                    required
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Smith"
                    required
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="seller@example.com"
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <XCircle className="size-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold border border-border/70 rounded-xl hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {formLoading ? (
                    <><Loader2 className="size-4 animate-spin" /> Creating...</>
                  ) : (
                    <><UserPlus className="size-4" /> Create Seller</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
