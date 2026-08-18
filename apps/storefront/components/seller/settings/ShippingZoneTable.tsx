'use client';

import React, { useState } from 'react';
import { Truck, Plus, Trash2, Globe, MapPin, Tag } from 'lucide-react';
import { MerchantOperationsClient } from '@/lib/services/merchant-operations-client';
import { formatPrice } from '@corecart/shared';

interface ShippingZoneTableProps {
  zones: any[];
  onUpdate: () => void;
}

export function ShippingZoneTable({ zones, onUpdate }: ShippingZoneTableProps) {
  const [loading, setLoading] = useState(false);
  
  // Zone creation form
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [selectedCountries, setSelectedCountries] = useState('IN, US, GB');

  // Rate creation form
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [methodName, setMethodName] = useState('Standard Shipping');
  const [cost, setCost] = useState('100');
  const [estDays, setEstDays] = useState('3-5 Business Days');
  const [minOrder, setMinOrder] = useState('');

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    setLoading(true);
    try {
      const countriesList = selectedCountries.split(',').map((c) => c.trim().toUpperCase());
      await MerchantOperationsClient.createShippingZone('SELLER', {
        name: zoneName.trim(),
        countries: countriesList,
      });
      setZoneName('');
      setShowZoneForm(false);
      onUpdate();
    } catch (err) {
      console.error('Failed to create zone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone and all its rates?')) return;
    setLoading(true);
    try {
      await MerchantOperationsClient.deleteShippingZone('SELLER', zoneId);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete zone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeZoneId) return;

    setLoading(true);
    try {
      await MerchantOperationsClient.createShippingRate('SELLER', {
        zoneId: activeZoneId,
        methodName,
        cost: parseFloat(cost) || 0,
        estDays,
        minOrder: minOrder ? parseFloat(minOrder) : undefined,
      });
      setMethodName('Standard Shipping');
      setCost('100');
      setEstDays('3-5 Business Days');
      setMinOrder('');
      setActiveZoneId(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to create rate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRate = async (rateId: string) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return;
    setLoading(true);
    try {
      await MerchantOperationsClient.deleteShippingRate('SELLER', rateId);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete rate:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Truck className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Shipping Zones & Rates</h3>
        </div>
        {!showZoneForm && (
          <button
            onClick={() => setShowZoneForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Shipping Zone
          </button>
        )}
      </div>

      {showZoneForm && (
        <form onSubmit={handleCreateZone} className="p-4 border border-border bg-muted/10 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150">
          <h4 className="text-xs font-bold text-foreground">Create Shipping Zone</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Zone Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Domestic Delivery, Rest of World"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Country Codes (comma-separated)</label>
              <input
                type="text"
                required
                placeholder="e.g. IN, US, GB"
                value={selectedCountries}
                onChange={(e) => setSelectedCountries(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setShowZoneForm(false)}
              className="px-3 py-1 text-[10px] font-bold border border-border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-[10px] font-bold bg-foreground text-background rounded-lg"
            >
              Create Zone
            </button>
          </div>
        </form>
      )}

      {/* Zones list */}
      <div className="space-y-4">
        {zones.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-3xl">
            No shipping zones configured. Add one above.
          </p>
        ) : (
          zones.map((zone) => {
            const countries = JSON.parse(zone.countries);
            const isAddingRate = activeZoneId === zone.id;

            return (
              <div key={zone.id} className="border border-border/80 rounded-3xl p-5 bg-card space-y-4">
                {/* Zone Info Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground">{zone.name}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Globe className="size-3" />
                      <span>Applies to: {countries.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveZoneId(isAddingRate ? null : zone.id)}
                      className="px-2.5 py-1 text-[10px] font-bold border border-border hover:bg-muted/50 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="size-3" />
                      Add Rate
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Create Rate Inline Form */}
                {isAddingRate && (
                  <form onSubmit={handleCreateRate} className="p-3 border border-border/60 bg-muted/20 rounded-2xl grid grid-cols-4 gap-2 items-end animate-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground">Method / Name</label>
                      <input
                        type="text"
                        required
                        value={methodName}
                        onChange={(e) => setMethodName(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-border bg-background rounded-lg outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground">Delivery Cost (₹)</label>
                      <input
                        type="number"
                        required
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-border bg-background rounded-lg outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground">Est. Duration</label>
                      <input
                        type="text"
                        required
                        value={estDays}
                        onChange={(e) => setEstDays(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-border bg-background rounded-lg outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 items-center">
                      <div className="space-y-1 flex-1">
                        <label className="text-[9px] font-bold text-muted-foreground">Min Order (Optional)</label>
                        <input
                          type="number"
                          value={minOrder}
                          onChange={(e) => setMinOrder(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-border bg-background rounded-lg outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-3 py-1 bg-foreground text-background text-xs font-bold rounded-lg self-end h-[28px]"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                {/* Rates List */}
                <div className="space-y-2">
                  {zone.rates.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic pl-1">
                      No rates configured for this shipping zone.
                    </p>
                  ) : (
                    zone.rates.map((rate: any) => (
                      <div
                        key={rate.id}
                        className="p-3 bg-muted/30 border border-border/40 rounded-2xl flex items-center justify-between"
                      >
                        <div className="text-xs text-foreground font-semibold">
                          <p className="font-bold">{rate.methodName}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{rate.estDays}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {rate.minOrder && (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              Above ₹{rate.minOrder}
                            </span>
                          )}
                          <span className="text-xs font-bold text-foreground">
                            {rate.cost == 0 ? 'Free Shipping' : formatPrice(rate.cost, 'INR')}
                          </span>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                            title="Delete shipping method"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
