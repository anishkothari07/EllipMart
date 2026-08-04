import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from './route';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Cart API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.productVariant.findUnique.mockResolvedValue({ 
      id: 'var-1', 
      price: 50,
      isActive: true,
      inventory: { quantityAvailable: 10, quantityReserved: 0 },
      product: { status: 'ACTIVE', deletedAt: null }
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      status: 'ACTIVE'
    });
  });

  const mockCart = {
    id: 'cart-1',
    userId: 'user-123',
    items: [
      {
        id: 'item-1',
        variantId: 'var-1',
        quantity: 2,
        variant: {
          id: 'var-1',
          price: 50,
          product: { id: 'prod-1', name: 'Product 1', currency: 'USD' }
        }
      }
    ]
  };

  describe('GET /api/v1/cart', () => {
    it('should return 401 if x-user-id is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/cart', { headers: {} });
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('should return 200 and the cart for a valid user', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);

      const req = new NextRequest('http://localhost:3000/api/v1/cart', { headers: { 'x-user-id': 'user-123' } });
      const response = await GET(req);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('cart-1');
    });
  });

  describe('POST /api/v1/cart', () => {
    it('should return 200 and add item to cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.upsert.mockResolvedValue(mockCart.items[0]);

      const req = new NextRequest('http://localhost:3000/api/v1/cart', {
        method: 'POST',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify({ variantId: 'var-1', quantity: 1 })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('should return 400 if variantId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/cart', {
        method: 'POST',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify({ quantity: 1 })
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/cart', () => {
    it('should return 200 and update item quantity', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.update.mockResolvedValue({ ...mockCart.items[0], quantity: 3 });

      const req = new NextRequest('http://localhost:3000/api/v1/cart', {
        method: 'PATCH',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify({ variantId: 'var-1', quantity: 3 })
      });

      const response = await PATCH(req);
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should return 200 and remove item if variantId is provided', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.delete.mockResolvedValue(mockCart.items[0]);

      const req = new NextRequest('http://localhost:3000/api/v1/cart?variantId=var-1', {
        method: 'DELETE',
        headers: { 'x-user-id': 'user-123' }
      });

      const response = await DELETE(req);
      expect(response.status).toBe(200);
    });

    it('should return 200 and clear cart if no variantId is provided', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const req = new NextRequest('http://localhost:3000/api/v1/cart', {
        method: 'DELETE',
        headers: { 'x-user-id': 'user-123' }
      });

      const response = await DELETE(req);
      expect(response.status).toBe(200);
    });
  });
});
