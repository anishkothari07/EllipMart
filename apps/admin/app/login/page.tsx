'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { adminLoginAction } from '../actions';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await adminLoginAction({ email, password });
      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Invalid credentials or unauthorized');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white px-4">
      <div className="w-full max-w-sm p-8 border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-3xl space-y-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="size-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
            <Shield className="size-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CoreCart Platform</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Super Administrator Access</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super@corecart.com"
                className="w-full pl-9 pr-4 py-2 text-xs border border-white/10 bg-white/[0.03] rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secret Passphrase</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2 text-xs border border-white/10 bg-white/[0.03] rounded-xl outline-none font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98"
          >
            {loading ? 'Authenticating...' : 'Establish Secure Connection'}
            {!loading && <ArrowRight className="size-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
