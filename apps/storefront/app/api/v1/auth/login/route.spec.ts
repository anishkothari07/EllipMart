import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as loginPOST } from './route';
import { NextRequest } from 'next/server';
import * as bcrypt from 'bcryptjs';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Auth Login API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for validation errors', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid' }) // missing password
    });
    
    const response = await loginPOST(req);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    if (response.status === 500) console.log("500 Error:", body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 200 and set cookies for valid credentials', async () => {
    // Mock user lookup
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'cust-123',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      firstName: 'Test',
      lastName: 'User',
      phone: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mock session creation
    mockPrisma.userSession.create.mockResolvedValue({
      id: 'sess-123',
      customerId: 'cust-123',
      merchantId: null,
      adminId: null,
      refreshToken: 'mock-refresh-token',
      deviceInfo: null,
      ipAddress: null,
      userAgent: null,
      expiresAt: new Date(Date.now() + 1000000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
    });
    
    const response = await loginPOST(req);
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.user.email).toBe('test@example.com');
    
    // Verify HTTP-only cookie was set
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('ellipmart_customer_refresh');
    expect(cookies).toContain('HttpOnly');
  });

  it('should return 401 for invalid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@example.com', password: 'Password123!' })
    });
    
    const response = await loginPOST(req);
    expect(response.status).toBe(401);
    
    const body = await response.json();
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
