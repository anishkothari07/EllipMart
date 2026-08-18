'use client';

import React, { useEffect, useState } from 'react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';
import { StoreSettingsForm } from '@/components/seller/settings/StoreSettingsForm';
import { ShippingZoneTable } from '@/components/seller/settings/ShippingZoneTable';
import { TaxSettingsForm } from '@/components/seller/settings/TaxSettingsForm';
import { PaymentProviderCard } from '@/components/seller/settings/PaymentProviderCard';
import { NotificationSettings } from '@/components/seller/settings/NotificationSettings';
import { StaffManager } from '@/components/seller/settings/StaffManager';
import { SystemSettingsForm } from '@/components/seller/settings/SystemSettingsForm';
import { DashboardCustomizer } from '@/components/seller/settings/DashboardCustomizer';
import { AuditLogTable } from '@/components/seller/settings/AuditLogTable';

import {
  ChevronRight,
  Store,
  Truck,
  Percent,
  CreditCard,
  Mail,
  Users,
  Settings,
  History,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@corecart/shared';

export default function MerchantSettingsPage() {
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STORE' | 'SHIPPING' | 'TAX' | 'PAYMENT' | 'NOTIFICATIONS' | 'STAFF' | 'SYSTEM' | 'AUDIT'>('STORE');

  const loadData = async () => {
    setLoading(true);
    try {
      const [storeInfoRes, shippingZonesRes, taxRulesRes, paymentConfigRes, systemSettingsRes, staffListRes] =
        await Promise.all([
          MerchantOperationsClient.getStoreInfo(),
          MerchantOperationsClient.listShippingZones(),
          MerchantOperationsClient.listTaxRules(),
          MerchantOperationsClient.getPaymentConfig(),
          MerchantOperationsClient.getSystemSettings(),
          MerchantOperationsClient.listStaff(),
        ]);

      setStoreInfo(storeInfoRes);
      setShippingZones(shippingZonesRes || []);
      setTaxRules(taxRulesRes || []);
      setPaymentConfig(paymentConfigRes);
      setSystemSettings(systemSettingsRes);
      setStaffList(staffListRes || []);
    } catch (err) {
      console.error('Failed to load operational settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabsList = [
    { key: 'STORE', label: 'Store Information', icon: Store },
    { key: 'SHIPPING', label: 'Shipping Zones', icon: Truck },
    { key: 'TAX', label: 'Taxes & GST/VAT', icon: Percent },
    { key: 'PAYMENT', label: 'Payment Providers', icon: CreditCard },
    { key: 'NOTIFICATIONS', label: 'Email Notifications', icon: Mail },
    { key: 'STAFF', label: 'Staff & Roles', icon: Users },
    { key: 'SYSTEM', label: 'System & Preferences', icon: Settings },
    { key: 'AUDIT', label: 'Operational Audit Logs', icon: History },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Operations</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground">Store Settings</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif mt-1">Store Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage shipping rates, tax configurations, payment processors, staff accounts, system localization, and audit logs.
        </p>
      </div>

      {loading && !storeInfo ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Loading operational settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Side Tabs navigation links */}
          <div className="p-3 bg-muted/10 border border-border/80 rounded-3xl space-y-1">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-left transition-all duration-150',
                    isActive
                      ? 'bg-foreground text-background shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Settings Panel */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm">
              {activeTab === 'STORE' && storeInfo && (
                <StoreSettingsForm initialSettings={storeInfo} onSuccess={loadData} />
              )}

              {activeTab === 'SHIPPING' && (
                <ShippingZoneTable zones={shippingZones} onUpdate={loadData} />
              )}

              {activeTab === 'TAX' && (
                <TaxSettingsForm taxRules={taxRules} onUpdate={loadData} />
              )}

              {activeTab === 'PAYMENT' && paymentConfig && (
                <PaymentProviderCard initialConfig={paymentConfig} />
              )}

              {activeTab === 'NOTIFICATIONS' && (
                <NotificationSettings />
              )}

              {activeTab === 'STAFF' && (
                <StaffManager staffList={staffList} onUpdate={loadData} />
              )}

              {activeTab === 'SYSTEM' && systemSettings && (
                <div className="space-y-6">
                  <SystemSettingsForm initialSettings={systemSettings} />
                  <DashboardCustomizer />
                </div>
              )}

              {activeTab === 'AUDIT' && (
                <AuditLogTable />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
