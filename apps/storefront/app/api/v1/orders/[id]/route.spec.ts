import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getOrder } from './route';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Order Details API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validHeaders = { 'x-user-id': 'user-123' };

  it('should return 401 if x-user-id is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/orders/order-1', { headers: {} });
    const response = await getOrder(req, { params: Promise.resolve({ id: 'order-1' }) });
    expect(response.status).toBe(401);
  });

  it('should return 404 if order is not found', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/v1/orders/not-found', { headers: validHeaders });
    const response = await getOrder(req, { params: Promise.resolve({ id: 'not-found' }) });
    
    expect(response.status).toBe(404);
  });

  it('should return 403 if order belongs to another user', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'other-user',
      status: 'CONFIRMED'
    });

    const req = new NextRequest('http://localhost:3000/api/v1/orders/order-1', { headers: validHeaders });
    const response = await getOrder(req, { params: Promise.resolve({ id: 'order-1' }) });
    
    expect(response.status).toBe(403);
  });

  it('should return 200 and order details for a valid owner', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'ORD-123',
      userId: 'user-123',
      status: 'CONFIRMED',
      grandTotal: 150,
      items: []
    });

    const req = new NextRequest('http://localhost:3000/api/v1/orders/order-1', { headers: validHeaders });
    const response = await getOrder(req, { params: Promise.resolve({ id: 'order-1' }) });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.orderNumber).toBe('ORD-123');
  });
});
