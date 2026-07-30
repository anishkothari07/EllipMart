'use client';

import React, { useState } from 'react';
import { Layers, Folder, X, ShieldAlert } from 'lucide-react';

interface BulkAssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  onAssignCategory: (catId: string, operation: 'REPLACE' | 'APPEND' | 'REMOVE') => Promise<void>;
  onAssignCollection: (colId: string, operation: 'REPLACE' | 'APPEND' | 'REMOVE') => Promise<void>;
}

export function BulkAssignDialog({
  isOpen,
  onClose,
  selectedProductIds,
  categories,
  collections,
  onAssignCategory,
  onAssignCollection,
}: BulkAssignDialogProps) {
  const [targetType, setTargetType] = useState<'CATEGORY' | 'COLLECTION'>('CATEGORY');
  const [operation, setOperation] = useState<'REPLACE' | 'APPEND' | 'REMOVE'>('APPEND');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!selectedTargetId) {
      setError('Please select a target category or collection.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (targetType === 'CATEGORY') {
        await onAssignCategory(selectedTargetId, operation);
      } else {
        await onAssignCollection(selectedTargetId, operation);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply bulk categorization changes.');
    } finally {
      setSaving(false);
    }
  };

  const operations = [
    { value: 'APPEND', label: 'Append (Add to)', desc: 'Adds selected products to target list without affecting current groups' },
    { value: 'REPLACE', label: 'Replace groups', desc: 'Overwrites existing groups for selected products with target choice' },
    { value: 'REMOVE', label: 'Remove from', desc: 'Removes selected products from target list' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-lg w-full p-6 rounded-3xl border border-border bg-card shadow-float space-y-6">
        <div className="flex justify-between items-center border-b border-border/60 pb-3">
          <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="size-4.5 text-muted-foreground" /> Bulk Product Organization
          </h3>
          <button onClick={onClose} className="size-7 rounded-lg hover:bg-muted/50 flex items-center justify-center">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-[11px] font-semibold flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-[11px] text-muted-foreground">
            You are bulk managing <strong className="text-foreground">{selectedProductIds.length} product(s)</strong>.
          </p>

          {/* Target Type select */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
              <input
                type="radio"
                name="target-type"
                checked={targetType === 'CATEGORY'}
                onChange={() => {
                  setTargetType('CATEGORY');
                  setSelectedTargetId('');
                }}
                className="size-4 rounded border-border accent-foreground"
              />
              Category mappings
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
              <input
                type="radio"
                name="target-type"
                checked={targetType === 'COLLECTION'}
                onChange={() => {
                  setTargetType('COLLECTION');
                  setSelectedTargetId('');
                }}
                className="size-4 rounded border-border accent-foreground"
              />
              Collection groups
            </label>
          </div>

          {/* Operation type dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Operation Type</label>
            <div className="grid gap-2 grid-cols-1">
              {operations.map((op) => (
                <label
                  key={op.value}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex gap-3 items-start select-none transition-colors ${
                    operation === op.value
                      ? 'border-indigo-500/20 bg-indigo-500/5'
                      : 'border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="bulk-operation"
                    value={op.value}
                    checked={operation === op.value}
                    onChange={() => setOperation(op.value as any)}
                    className="mt-1 size-4 accent-indigo-600"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">{op.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{op.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target category / collection dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Select Target {targetType === 'CATEGORY' ? 'Category' : 'Collection'}
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="h-10 px-3 w-full rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="" disabled>Select target...</option>
              {targetType === 'CATEGORY'
                ? categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                : collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-10 px-4 rounded-full border border-border hover:bg-muted/50 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleApply}
            className="h-10 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            {saving && <div className="size-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />}
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
}
