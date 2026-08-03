'use client';

import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';
// UserStatus values duplicated here to avoid importing @prisma/client in a client component
const UserStatus = {
  ACTIVE: 'ACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  SUSPENDED: 'SUSPENDED',
} as const;
type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
import { cn } from '@corecart/shared';

interface StaffManagerProps {
  staffList: any[];
  onUpdate: () => void;
}

const ROLE_CONFIG: Record<string, { label: string; styles: string }> = {
  Owner: { label: 'Store Owner', styles: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  Manager: { label: 'Store Manager', styles: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  'Inventory Manager': { label: 'Inventory Manager', styles: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  Support: { label: 'Customer Support', styles: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  Viewer: { label: 'Viewer/Analytics', styles: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
};

export function StaffManager({ staffList, onUpdate }: StaffManagerProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [staffRole, setStaffRole] = useState<'Owner' | 'Manager' | 'Inventory Manager' | 'Support' | 'Viewer'>('Manager');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');

  const startNew = () => {
    setEditingStaff(null);
    setEmail('');
    setFirstName('');
    setLastName('');
    setStaffRole('Manager');
    setStatus('ACTIVE');
    setShowForm(true);
  };

  const startEdit = (s: any) => {
    setEditingStaff(s);
    const names = s.name.split(' ');
    setFirstName(names[0] || '');
    setLastName(names.slice(1).join(' ') || '');
    setEmail(s.email);
    setStaffRole(s.staffRole);
    setStatus(s.status);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStaff) {
        await MerchantOperationsClient.updateStaff('MERCHANT', editingStaff.id, {
          name: `${firstName} ${lastName}`.trim(),
          staffRole,
          status,
        });
      } else {
        await MerchantOperationsClient.createStaff('MERCHANT', {
          email,
          firstName,
          lastName,
          staffRole,
          status,
        });
      }
      setShowForm(false);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Staff Members & Permissions</h3>
        </div>
        {!showForm && (
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Staff Member
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-border bg-muted/10 rounded-2xl space-y-3.5 animate-in slide-in-from-top-2 duration-150">
          <h4 className="text-xs font-bold text-foreground">{editingStaff ? 'Edit Staff Member' : 'New Staff Member'}</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Email Address</label>
              <input
                type="email"
                required
                disabled={!!editingStaff}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Operational Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full px-2 py-1.5 text-xs border border-border bg-background rounded-lg outline-none cursor-pointer text-foreground"
              >
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Support">Support</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-2 py-1.5 text-xs border border-border bg-background rounded-lg outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active Account</option>
                <option value="PENDING_VERIFICATION">Awaiting verification</option>
                <option value="SUSPENDED">Suspended Account</option>
              </select>
            </div>

            {!editingStaff && (
              <p className="text-[9px] text-muted-foreground leading-normal italic pb-1">
                Note: Temporary login password will default to: <code className="font-bold bg-muted px-1 py-0.5 rounded">Staff123!</code>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-[10px] font-bold bg-foreground text-background rounded-lg"
            >
              {loading ? 'Saving...' : 'Save Staff'}
            </button>
          </div>
        </form>
      )}

      {/* Staff lists */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              {['Name', 'Email', 'Assigned Role', 'Status', 'Joined'].map((h) => (
                <th
                  key={h}
                  className="pb-2 px-2 first:pl-0 last:pr-0 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
              <th className="w-8 pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {staffList.map((s) => {
              const badge = ROLE_CONFIG[s.staffRole] ?? { label: s.staffRole, styles: 'bg-muted border-border' };
              return (
                <tr key={s.id} className="group hover:bg-muted/10 transition-colors">
                  {/* Name */}
                  <td className="py-3 px-2 pl-0 font-bold text-foreground whitespace-nowrap">
                    {s.name}
                  </td>

                  {/* Email */}
                  <td className="py-3 px-2 text-muted-foreground">
                    {s.email}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none leading-none', badge.styles)}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border select-none leading-none',
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    )}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-3 px-2 text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>

                  {/* Edit */}
                  <td className="py-3 px-2 pr-0 text-right">
                    <button
                      onClick={() => startEdit(s)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
