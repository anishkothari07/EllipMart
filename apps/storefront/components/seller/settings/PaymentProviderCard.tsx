'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Check, Settings } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';
import { cn } from '@corecart/shared';

interface PaymentProviderCardProps {
  initialConfig: any;
}

export function PaymentProviderCard({ initialConfig }: PaymentProviderCardProps) {
  const [config, setConfig] = useState(initialConfig);
  const [activeProvider, setActiveProvider] = useState<'cod' | 'razorpay' | 'stripe' | 'paypal' | null>(null);

  // Mock Form credentials
  const [keyId, setKeyId] = useState('rzp_test_9k8dF39s');
  const [keySecret, setKeySecret] = useState('••••••••••••••••••••••••');
  const [mode, setMode] = useState('test');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleProvider = async (provider: 'cod' | 'razorpay' | 'stripe' | 'paypal') => {
    const updated = { ...config, [provider]: !config[provider] };
    setLoading(true);
    try {
      await MerchantOperationsClient.savePaymentConfig('SELLER', updated);
      setConfig(updated);
    } catch (err) {
      console.error('Failed to update payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      // Simulate saving API Keys
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setActiveProvider(null);
        }, 1000);
        setLoading(false);
      }, 800);
    } catch {}
  };

  const providersList = [
    {
      key: 'cod',
      title: 'Cash on Delivery (COD)',
      description: 'Accept cash payments upon delivery. No technical gateway setup required.',
      badge: 'Manual',
    },
    {
      key: 'razorpay',
      title: 'Razorpay Payment Gateway',
      description: 'Popular gateway supporting UPI, netbanking, credit cards and EMI options in India.',
      badge: 'UPI & Cards',
    },
    {
      key: 'stripe',
      title: 'Stripe Global Checkout',
      description: 'Accept credit card payments globally with standard localized checkout experiences.',
      badge: 'Global Credit Cards',
    },
    {
      key: 'paypal',
      title: 'PayPal Standard Integration',
      description: 'Enable express buttons, digital wallet, and global client transactions.',
      badge: 'Wallets & Credit',
    },
  ] as const;

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Payment Gateways & Providers</h3>
        </div>
      </div>

      <div className="space-y-3">
        {providersList.map((p) => {
          const isEnabled = config[p.key];
          const isConfiguring = activeProvider === p.key;

          return (
            <div
              key={p.key}
              className={cn(
                'p-5 border border-border/80 bg-card rounded-3xl space-y-4 transition-all duration-150',
                isEnabled && 'border-foreground/15 bg-muted/5'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground">{p.title}</h4>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-foreground/10 px-1.5 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.key !== 'cod' && isEnabled && (
                    <button
                      onClick={() => setActiveProvider(isConfiguring ? null : p.key)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Configure provider credentials"
                    >
                      <Settings className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleProvider(p.key)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1 text-[10px] font-bold border rounded-xl transition-colors',
                      isEnabled
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                        : 'border-border bg-background text-muted-foreground'
                    )}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Mock Configuration form */}
              {isConfiguring && (
                <form
                  onSubmit={handleSaveCredentials}
                  className="p-4 border border-border bg-muted/20 rounded-2xl space-y-3.5 animate-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center gap-1.5 border-b border-border/40 pb-2 mb-2">
                    <ShieldCheck className="size-3.5 text-accent" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gateway API Credentials</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground">API Key / Key ID</label>
                      <input
                        type="text"
                        required
                        value={keyId}
                        onChange={(e) => setKeyId(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-border bg-background rounded-lg outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground">API Secret / Private Key</label>
                      <input
                        type="password"
                        required
                        value={keySecret}
                        onChange={(e) => setKeySecret(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-border bg-background rounded-lg outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground">Environment Mode</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-border bg-background rounded-lg outline-none cursor-pointer"
                      >
                        <option value="test">Sandbox / Testing</option>
                        <option value="production">Live / Production</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveProvider(null)}
                        className="px-2.5 py-1 text-[9px] font-bold border border-border hover:bg-background rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-2.5 py-1 text-[9px] font-bold bg-foreground text-background hover:bg-foreground/90 rounded-lg flex items-center gap-1"
                      >
                        {loading ? 'Saving...' : success ? <Check className="size-3 text-emerald-500" /> : 'Save Keys'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
