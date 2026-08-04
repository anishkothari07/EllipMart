import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getOrders } from './route';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Orders API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validHeaders = { 'x-user-id': 'user-123' };

  it('should return 401 if x-user-id is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/orders', { headers: {} });
    const response = await getOrders(req);
    expect(response.status).toBe(401);
  });

  it('should return 200 and a list of orders for a valid user', async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        orderNumber: 'ORD-123',
        userId: 'user-123',
        status: 'CONFIRMED',
        grandTotal: 150,
        items: []
      }
    ]);

    const req = new NextRequest('http://localhost:3000/api/v1/orders', { headers: validHeaders });
    const response = await getOrders(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].orderNumber).toBe('ORD-123');
  });
});
