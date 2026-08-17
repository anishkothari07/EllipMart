'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export function DeleteDialog({ isOpen, onClose, onConfirm, productName }: DeleteDialogProps) {
  const [deleting, setDeleting] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full p-6 rounded-3xl border border-border bg-card shadow-float space-y-6">
        <div className="flex gap-4 items-start">
          <div className="size-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1.5 text-left">
            <h3 className="text-sm font-bold text-foreground">Delete product?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{productName}</strong>? This action will soft delete the product and its variants from your storefront catalogs.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="h-10 px-4 rounded-full border border-border hover:bg-muted/50 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirm}
            className="h-10 px-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            {deleting && <div className="size-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </>
  );
}
