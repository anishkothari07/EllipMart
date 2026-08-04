import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as registerPOST } from './route';
import { NextRequest } from 'next/server';
import * as bcrypt from 'bcryptjs';

const mockPrisma = (globalThis as any).mockPrisma;
const PrismaClientKnownRequestError = Error; // Mock the error class

describe('Auth Register API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for validation errors', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid' }) // missing required fields
    });
    
    const response = await registerPOST(req);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    if (response.status === 500) console.log("500 Error:", body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 201 and create user for valid data', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: 'cust-123',
      email: 'newuser@example.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      firstName: 'New',
      lastName: 'User',
      phone: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockPrisma.userSession.create.mockResolvedValue({
      id: 'sess-123',
      userId: 'cust-123',
      token: 'session-token',
      expiresAt: new Date(Date.now() + 1000000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User'
      })
    });
    
    const response = await registerPOST(req);
    expect(response.status).toBe(201);
    
    const body = await response.json();
    expect(body.message).toBe('Registration successful');
    expect(body.data.user.email).toBe('newuser@example.com');
  });

  it('should return 400 for duplicate email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'existing-123',
      email: 'existing@example.com'
    });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Existing',
        lastName: 'User'
      })
    });
    
    const response = await registerPOST(req);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    if (response.status === 500) console.log("500 Error:", body);
    expect(body.error.code).toBe('DUPLICATE_EMAIL');
    expect(body.message).toContain('Email already registered');
  });
});
