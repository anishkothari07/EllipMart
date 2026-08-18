'use client';

import React, { useState } from 'react';
import { useMerchantSession } from '../providers/merchant-auth-provider';
import { Lock, ShieldAlert, KeyRound, Mail, Loader2 } from 'lucide-react';

export function MerchantAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useMerchantSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await login({ email, password });
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials or unauthorized');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Validating merchant session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B0F19] text-white p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl space-y-6">
          <div className="mx-auto size-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <Lock className="size-6 text-[#3B82F6]" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">EllipMart Seller Portal</h1>
            <p className="text-sm text-gray-400">
              Sign in with your seller credentials to continue
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 size-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@ellipmart.com"
                  className="w-full h-11 pl-11 pr-4 rounded-full bg-white/[0.04] border border-white/10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 size-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-4 rounded-full bg-white/[0.04] border border-white/10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
