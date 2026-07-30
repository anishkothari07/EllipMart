'use client';

import React, { useState } from 'react';
import { Percent, Plus, Trash2, Globe } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';

interface TaxSettingsFormProps {
  taxRules: any[];
  onUpdate: () => void;
}

export function TaxSettingsForm({ taxRules, onUpdate }: TaxSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('GST');
  const [rate, setRate] = useState('18');
  const [country, setCountry] = useState('IN');
  const [state, setState] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await MerchantOperationsClient.createTaxRule('MERCHANT', {
        name,
        rate: parseFloat(rate) || 0,
        country,
        state: state.trim() || undefined,
      });
      setName('GST');
      setRate('18');
      setCountry('IN');
      setState('');
      setShowForm(false);
      onUpdate();
    } catch (err) {
      console.error('Failed to create tax rule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rate rule?')) return;
    setLoading(true);
    try {
      await MerchantOperationsClient.deleteTaxRule('MERCHANT', id);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete tax rule:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Percent className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Tax Rules & Region Rates</h3>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Tax Rate
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-border bg-muted/10 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150">
          <h4 className="text-xs font-bold text-foreground">Create Tax Rule</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Tax Name</label>
              <input
                type="text"
                required
                placeholder="e.g. GST, VAT, Sales Tax"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Tax Rate Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Country Code</label>
              <input
                type="text"
                required
                placeholder="e.g. IN"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">State / Region (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-[10px] font-bold border border-border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-[10px] font-bold bg-foreground text-background rounded-lg"
            >
              Create Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {taxRules.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-3xl">
            No tax rates configured. Add one above.
          </p>
        ) : (
          taxRules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 border border-border/80 bg-card rounded-2xl flex items-center justify-between"
            >
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-foreground">{rule.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Globe className="size-3" />
                  <span>Region: {rule.country}{rule.state ? ` (${rule.state})` : ' (All States)'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm font-bold text-foreground">{rule.rate}%</span>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                  title="Delete tax rate rule"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
