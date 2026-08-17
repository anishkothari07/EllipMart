'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSellerSessionAction, sellerLoginAction, sellerLogoutAction } from '../app/actions';

interface SellerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface SellerSessionContextValue {
  user: SellerUser | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const SellerSessionContext = createContext<SellerSessionContextValue | null>(null);

export function SellerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SellerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerSessionAction().then((u) => {
      if (u) {
        setUser({ id: u.id, firstName: (u as any).firstName || '', lastName: (u as any).lastName || '', email: u.email, role: u.role });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    setLoading(true);
    const res = await sellerLoginAction(payload);
    if (res.success && res.user) {
      setUser({ id: res.user.id, firstName: (res.user as any).firstName || '', lastName: (res.user as any).lastName || '', email: res.user.email, role: res.user.role });
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: res.error };
  };

  const logout = async () => {
    await sellerLogoutAction();
    setUser(null);
  };

  return (
    <SellerSessionContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </SellerSessionContext.Provider>
  );
}

export function useSellerSession() {
  const ctx = useContext(SellerSessionContext);
  if (!ctx) throw new Error('useSellerSession must be used within SellerAuthProvider');
  return ctx;
}
