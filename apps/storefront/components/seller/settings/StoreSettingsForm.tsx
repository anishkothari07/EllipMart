'use client';

import React, { useState } from 'react';
import { Store, Save } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';

interface StoreSettingsFormProps {
  initialSettings: any;
  onSuccess: () => void;
}

export function StoreSettingsForm({ initialSettings, onSuccess }: StoreSettingsFormProps) {
  const [brandName, setBrandName] = useState(initialSettings.brandName || '');
  const [websiteName, setWebsiteName] = useState(initialSettings.websiteName || '');
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || '');
  const [businessAddress, setBusinessAddress] = useState(initialSettings.businessAddress || '');
  const [defaultCurrency, setDefaultCurrency] = useState(initialSettings.defaultCurrency || 'INR');
  const [defaultLanguage, setDefaultLanguage] = useState(initialSettings.defaultLanguage || 'en');
  
  // Re-use standard attributes to map GSTIN, timezone and businessHours
  const [gstin, setGstin] = useState(initialSettings.copyright || '');
  const [timezone, setTimezone] = useState(initialSettings.tagline || 'Asia/Kolkata');
  const [businessHours, setBusinessHours] = useState(initialSettings.supportPhone || 'Mon-Fri 9AM - 6PM');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await MerchantOperationsClient.updateStoreInfo('SELLER', {
        brandName,
        websiteName,
        contactEmail,
        contactPhone,
        businessAddress,
        defaultCurrency,
        defaultLanguage,
        gstin,
        timezone,
        businessHours,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onSuccess();
    } catch (err) {
      console.error('Failed to update store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Store className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Store Details & Information</h3>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : success ? 'Saved!' : 'Save Details'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Store Name (Brand Name)</label>
          <input
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Legal Business Name</label>
          <input
            type="text"
            required
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Contact Email Address</label>
          <input
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Business Phone</label>
          <input
            type="text"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-muted-foreground">Registered Business Address</label>
        <textarea
          required
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">GST / VAT Identification Number</label>
          <input
            type="text"
            placeholder="e.g. 29GGGGG1314R9Z1"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none uppercase"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Primary Store Currency</label>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Default Language</label>
          <select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="en">English (US)</option>
            <option value="hi">Hindi (India)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Time Zone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
          >
            <option value="Asia/Kolkata">India (IST) - UTC+5:30</option>
            <option value="America/New_York">New York (EST) - UTC-5</option>
            <option value="Europe/London">London (GMT) - UTC+0</option>
            <option value="Asia/Singapore">Singapore (SGT) - UTC+8</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Business Hours</label>
          <input
            type="text"
            placeholder="e.g. Mon-Fri 9AM - 6PM"
            value={businessHours}
            onChange={(e) => setBusinessHours(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
          />
        </div>
      </div>
    </form>
  );
}
