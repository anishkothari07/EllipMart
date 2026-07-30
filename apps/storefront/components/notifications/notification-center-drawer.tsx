'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Search,
  Package,
  CreditCard,
  Truck,
  Tag,
  ShieldAlert,
  Info,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { cn } from '@corecart/shared';

export interface NotificationItem {
  id: string;
  type: string;
  category: string; // ORDER, PAYMENT, SHIPPING, PROMOTION, SYSTEM
  title: string | null;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  actions?: { id: string; label: string; url: string; type?: string }[];
}

export function NotificationCenterDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, activeCategory]);

  // Real-time SSE Connection
  useEffect(() => {
    const eventSource = new EventSource('/api/v1/notifications/stream?userId=current');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.title) {
          setNotifications((prev) => [
            {
              id: `sse_${Date.now()}`,
              type: 'REAL_TIME',
              category: 'SYSTEM',
              title: data.title,
              body: data.body,
              isRead: false,
              createdAt: new Date().toISOString(),
              actions: data.actions || [],
            },
            ...prev,
          ]);
          setUnreadCount((c) => c + 1);
        }
      } catch {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== 'ALL') params.set('category', activeCategory);
      if (searchQuery) params.set('query', searchQuery);

      const res = await fetch(`/api/v1/notifications?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/v1/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {}
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ORDER':
        return <Package className="size-4 text-emerald-500" />;
      case 'PAYMENT':
        return <CreditCard className="size-4 text-indigo-500" />;
      case 'SHIPPING':
        return <Truck className="size-4 text-blue-500" />;
      case 'PROMOTION':
        return <Tag className="size-4 text-purple-500" />;
      case 'SECURITY':
        return <ShieldAlert className="size-4 text-red-500" />;
      default:
        return <Info className="size-4 text-amber-500" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex flex-col h-full w-full max-w-md bg-background border-l border-border shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="size-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold">Notifications</h2>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="size-3.5" /> Read All
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-xl hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border p-2 bg-muted/5 scrollbar-none">
          {['ALL', 'ORDER', 'PAYMENT', 'SHIPPING', 'PROMOTION', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                activeCategory === cat
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-accent/30 animate-pulse border border-border" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="size-12 text-muted-foreground/30 mb-2" />
              <h3 className="text-sm font-semibold">No notifications</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                You are all caught up! Important order and account updates will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                className={cn(
                  'group relative flex flex-col gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer',
                  item.isRead
                    ? 'border-border bg-background/50'
                    : 'border-indigo-500/30 bg-indigo-500/5 shadow-xs'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-accent/40">{getCategoryIcon(item.category)}</div>
                    <span className="text-xs font-bold text-foreground">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!item.isRead && (
                      <span className="size-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                  {item.body}
                </p>

                {/* Render NotificationAction Buttons */}
                {item.actions && item.actions.length > 0 && (
                  <div className="flex items-center gap-2 pl-8 mt-1">
                    {item.actions.map((act) => (
                      <a
                        key={act.id || act.label}
                        href={act.url}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {act.label} <ExternalLink className="size-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
