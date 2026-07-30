'use client';

import React, { useState } from 'react';
import { StickyNote, Send, User } from 'lucide-react';
import { MerchantCustomerClient } from '@/lib/services/merchant-customer-client';
import type { CustomerNote } from '@corecart/commerce';

interface CustomerNotesProps {
  userId: string;
  notes: CustomerNote[];
  onUpdate: () => void;
}

export function CustomerNotes({ userId, notes: initialNotes, onUpdate }: CustomerNotesProps) {
  const [notes, setNotes] = useState<CustomerNote[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const added = await MerchantCustomerClient.addNote(userId, newNote);
      setNotes((prev) => [...prev, added]);
      setNewNote('');
      onUpdate(); // trigger parent component update to reload activities logs
    } catch (err) {
      console.error('Failed to add customer note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
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
        <h3 className="text-sm font-bold text-foreground">CRM Staff Notes</h3>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No notes on record for this customer.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-3 bg-muted/30 border border-border/40 rounded-2xl space-y-1.5 text-left">
              <p className="text-xs text-foreground font-medium leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <User className="size-3" />
                <span>{note.createdBy}</span>
                <span>•</span>
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          placeholder="Add internal note to this client file..."
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
