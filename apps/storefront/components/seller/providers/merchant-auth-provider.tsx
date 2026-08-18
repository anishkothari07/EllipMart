'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSellerSessionAction, loginSellerAction, logoutSellerAction } from '@/app/(seller)/seller/actions';

export interface MerchantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface MerchantSessionContextValue {
  user: MerchantUser | null;
  loading: boolean;
  login: (payload: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const MerchantSessionContext = createContext<MerchantSessionContextValue | null>(null);

export function MerchantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MerchantUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const sessionUser = await getSellerSessionAction();
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            firstName: sessionUser.firstName,
            lastName: sessionUser.lastName,
            email: sessionUser.email,
            role: sessionUser.role,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (payload: any) => {
    setLoading(true);
    const res = await loginSellerAction(payload);
    if (res.success && res.user) {
      setUser({
        id: res.user.id,
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        email: res.user.email,
        role: res.user.role,
      });
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: res.error };
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutSellerAction();
      setUser(null);
    } catch (e) {
      console.error('Failed to log out:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MerchantSessionContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </MerchantSessionContext.Provider>
  );
}

export function useMerchantSession() {
  const context = useContext(MerchantSessionContext);
  if (!context) {
    throw new Error('useMerchantSession must be used within a MerchantAuthProvider');
  }
  return context;
}
