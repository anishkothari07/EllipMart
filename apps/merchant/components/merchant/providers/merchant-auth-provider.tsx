'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MerchantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  permissions: string[];
}

interface MerchantSessionContextValue {
  user: MerchantUser | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const MerchantSessionContext = createContext<MerchantSessionContextValue | null>(null);

export function MerchantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MerchantUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage or cookies for mock session
    const mockSession = localStorage.getItem('mock_merchant_session');
    if (mockSession) {
      try {
        setUser(JSON.parse(mockSession));
      } catch (e) {
        localStorage.removeItem('mock_merchant_session');
      }
    } else {
      // Seed default active mock session on first visit for layout verification
      const defaultMockUser: MerchantUser = {
        id: 'm1',
        name: 'Ani Kothari',
        email: 'merchant@smartgo.in',
        role: 'OWNER',
        organizationId: 'org-1',
        permissions: ['*'],
      };
      setUser(defaultMockUser);
      localStorage.setItem('mock_merchant_session', JSON.stringify(defaultMockUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const mockUser: MerchantUser = {
      id: 'm1',
      name: 'Ani Kothari',
      email: email || 'merchant@smartgo.in',
      role: 'OWNER',
      organizationId: 'org-1',
      permissions: ['*'],
    };
    setUser(mockUser);
    localStorage.setItem('mock_merchant_session', JSON.stringify(mockUser));
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('mock_merchant_session');
    setLoading(false);
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
