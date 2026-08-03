'use client';

import React, { useState } from 'react';
import { cn } from '@corecart/shared';
import { MapPin, Plus, Trash2, Home, Check, X, CheckSquare, Edit } from 'lucide-react';
import { MerchantCustomerClient } from '@/lib/services/merchant-customer-client';
import type { CustomerAddress as AddressType } from '@corecart/commerce';

interface CustomerAddressProps {
  userId: string;
  addresses: AddressType[];
  onUpdate: () => void;
}

export function CustomerAddress({ userId, addresses, onUpdate }: CustomerAddressProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null);

  // Address form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('IN');
  const [addressType, setAddressType] = useState('HOME');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setCompany('');
    setStreet('');
    setLandmark('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('IN');
    setAddressType('HOME');
    setIsDefault(false);
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (addr: AddressType) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setCompany(addr.company || '');
    setStreet(addr.street);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullName,
        phone,
        company: company || null,
        street,
        landmark: landmark || null,
        city,
        state,
        postalCode,
        country,
        addressType,
        isDefault,
        isShipping: true,
        isBilling: true,
      };

      if (editingAddress) {
        await MerchantCustomerClient.updateAddress(userId, editingAddress.id, payload);
      } else {
        await MerchantCustomerClient.createAddress(userId, payload);
      }
      resetForm();
      onUpdate();
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addrId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setLoading(true);
    try {
      await MerchantCustomerClient.deleteAddress(userId, addrId);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete address:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addrId: string) => {
    setLoading(true);
    try {
      await MerchantCustomerClient.setDefaultAddress(userId, addrId);
      onUpdate();
    } catch (err) {
      console.error('Failed to set default address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
            <MapPin className="size-3.5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Saved Addresses ({addresses.length})</h3>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border border-border hover:bg-muted/50 rounded-xl transition-colors"
          >
            <Plus className="size-3" />
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-border/80 bg-muted/10 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150 text-left">
          <h4 className="text-xs font-bold text-foreground">{editingAddress ? 'Edit Address' : 'New Address'}</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Address Type</label>
              <select
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none cursor-pointer"
              >
                <option value="HOME">Home</option>
                <option value="OFFICE">Office</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Street Address</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">PIN Code</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border/80 bg-background rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1 select-none">
            <input
              type="checkbox"
              id="default-chk"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="size-3.5 border-border rounded cursor-pointer"
            />
            <label htmlFor="default-chk" className="text-[10px] font-bold text-muted-foreground cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-3.5 py-1 text-[10px] font-bold border border-border hover:bg-muted/50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1 text-[10px] font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {/* Address cards list */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {addresses.length === 0 ? (
          <p className="text-xs text-muted-foreground col-span-2 text-center py-4">No address cards available.</p>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'p-4 rounded-2xl border border-border/80 bg-muted/10 relative space-y-2 text-left',
                addr.isDefault && 'border-foreground/20 bg-muted/20',
              )}
            >
              {/* Type tag */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold bg-foreground/10 text-foreground px-2 py-0.5 rounded-full select-none">
                  {addr.addressType}
                </span>
                {addr.isDefault && (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5 select-none">
                    <Check className="size-3" />
                    Default
                  </span>
                )}
              </div>

              {/* Address details */}
              <div className="space-y-0.5 text-xs text-foreground font-medium">
                <p className="font-bold text-sm leading-snug">{addr.fullName}</p>
                {addr.company && <p className="text-muted-foreground">{addr.company}</p>}
                <p className="text-muted-foreground leading-normal mt-1">{addr.street}</p>
                {addr.landmark && <p className="text-muted-foreground leading-normal">Landmark: {addr.landmark}</p>}
                <p className="text-muted-foreground leading-normal">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="text-muted-foreground">{addr.country}</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-1.5">Phone: {addr.phone}</p>
              </div>

              {/* Actions footer */}
              <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={loading}
                    className="text-[10px] font-bold text-accent hover:underline"
                  >
                    Set Default
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic font-semibold">Active default card</span>
                )}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleEdit(addr)}
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Edit address"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={loading}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Delete address"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
