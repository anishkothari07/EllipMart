'use client';

import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';

interface SystemSettingsFormProps {
  initialSettings: any;
}

export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [dateFormat, setDateFormat] = useState(initialSettings.dateFormat || 'dd/MM/yyyy');
  const [timeFormat, setTimeFormat] = useState(initialSettings.timeFormat || '12h');
  const [numberFormat, setNumberFormat] = useState(initialSettings.numberFormat || 'INR');
  const [defaultPagination, setDefaultPagination] = useState(initialSettings.defaultPagination || 10);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await MerchantOperationsClient.saveSystemSettings('MERCHANT', {
        dateFormat,
        timeFormat,
        numberFormat,
        defaultPagination: parseInt(defaultPagination.toString()) || 10,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-border/80 bg-card rounded-3xl space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Settings className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Operational System Settings</h3>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : success ? 'Saved!' : 'Save System Settings'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Date Format</label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="dd/MM/yyyy">dd/MM/yyyy (e.g. 28/07/2026)</option>
            <option value="MM/dd/yyyy">MM/dd/yyyy (e.g. 07/28/2026)</option>
            <option value="yyyy-MM-dd">yyyy-MM-dd (e.g. 2026-07-28)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Time Format</label>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="12h">12-Hour format (e.g. 01:25 PM)</option>
            <option value="24h">24-Hour format (e.g. 13:25)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Local Number Formatting</label>
          <select
            value={numberFormat}
            onChange={(e) => setNumberFormat(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="INR">Indian Rupees Lakh Formatting (₹1,00,000.00)</option>
            <option value="USD">Standard Millions Formatting ($100,000.00)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Default Directory List Pagination Limit</label>
          <select
            value={defaultPagination}
            onChange={(e) => setDefaultPagination(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="10">10 Rows per page</option>
            <option value="25">25 Rows per page</option>
            <option value="50">50 Rows per page</option>
          </select>
        </div>
      </div>
    </form>
  );
}
