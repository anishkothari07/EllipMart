'use client';

import React, { useState } from 'react';
import { Send, StickyNote, User } from 'lucide-react';
import { MerchantOrderClient } from '@/lib/services/merchant-order-client';
import type { MerchantOrderNote } from '@corecart/commerce';

interface OrderNotesProps {
  orderId: string;
  notes: MerchantOrderNote[];
  onNoteAdded: () => void;
}

export function OrderNotes({ orderId, notes: initialNotes, onNoteAdded }: OrderNotesProps) {
  const [notes, setNotes] = useState<MerchantOrderNote[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const added = await MerchantOrderClient.addNote(orderId, newNote, 'Merchant Admin');
      setNotes((prev) => [...prev, added]);
      setNewNote('');
      onNoteAdded(); // trigger parent update to refresh full timeline or log
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatNoteDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <StickyNote className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Internal Notes</h3>
      </div>

      {/* Existing Notes List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No internal notes for this order.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-3 bg-muted/30 rounded-2xl border border-border/40 space-y-1.5">
              <p className="text-xs text-foreground font-medium leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <User className="size-3" />
                <span>{note.createdBy}</span>
                <span>•</span>
                <span>{formatNoteDate(note.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          placeholder="Add an internal note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={submitting}
          className="w-full pl-3.5 pr-10 py-2.5 text-xs border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150"
        />
        <button
          type="submit"
          disabled={submitting || !newNote.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-opacity"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
