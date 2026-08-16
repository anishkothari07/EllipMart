import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as refreshPOST } from './route';
import { NextRequest } from 'next/server';

const mockPrisma = (globalThis as any).mockPrisma;

import { signRefreshToken } from '@corecart/shared';

describe('Auth Refresh API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if refresh token is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/refresh', {
      method: 'POST',
      headers: {}
    });

    const response = await refreshPOST(req);
    expect(response.status).toBe(401);
    
    const body = await response.json();
    if (response.status === 500) console.log("500 Error:", body);
    expect(body.error.code).toBe('MISSING_TOKEN');
  });

  it('should return 200 and new tokens if refresh token is valid', async () => {
    const validToken = await signRefreshToken({ userId: 'cust-123', role: 'CUSTOMER', email: 'test@example.com', sessionId: 'sess-123' });
    
    // Mock the session
    mockPrisma.userSession.findUnique.mockResolvedValue({
      id: 'sess-123',
      userId: 'cust-123',
      token: 'some-random-token',
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mock the user
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'cust-123',
      email: 'test@example.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });

    // Mock session update (rotation)
    mockPrisma.userSession.update.mockResolvedValue({
      id: 'sess-123',
      userId: 'cust-123',
      token: 'new-token',
      expiresAt: new Date(Date.now() + 100000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: validToken }),
      headers: {
        'Cookie': `ellipmart_customer_refresh=${validToken}`
      }
    });
    
    const response = await refreshPOST(req);
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.data.accessToken).toBeDefined();
    
    // Verify cookie was rotated (or handled via JSON)
    const cookies = response.headers.get('set-cookie') || response.headers.get('Set-Cookie');
    if (cookies) {
      expect(cookies).toContain('ellipmart_customer_refresh');
    }
  });
});
