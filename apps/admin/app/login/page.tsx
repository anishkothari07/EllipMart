'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('super@corecart.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login and redirect
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-sm p-8 border border-border bg-card rounded-3xl space-y-6 shadow-md text-left">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="size-11 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg">
            <Shield className="size-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-serif">CoreCart Platform</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Super Administrator Access</p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Secret Passphrase</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Establish Secure Connection'}
            {!loading && <ArrowRight className="size-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
