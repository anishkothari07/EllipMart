import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getProduct } from './route';
import { AppError } from '@corecart/shared';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Product Details API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 and product details for a valid slug', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'Test description',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      categoryId: 'cat-1',
      brandId: 'brand-1',
      defaultPrice: 100,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { id: 'cat-1', name: 'Test Category', slug: 'test-category' },
      brand: { id: 'brand-1', name: 'Test Brand', slug: 'test-brand' },
      images: [{ id: 'img-1', url: 'https://res.cloudinary.com/test', isPrimary: true }],
      variants: [{ name: 'Default Size', price: 100 }],
      tags: []
    });

    const req = new NextRequest('http://localhost:3000/api/v1/products/test-product-1');
    const response = await getProduct(req, { params: Promise.resolve({ slug: 'test-product-1' }) });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe('test-product-1');
  });

  it('should throw AppError 404 if product is not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/v1/products/not-found');
    
    // The route handler does not catch errors, it throws them to Next.js global error handler.
    // In our tests, we should expect the promise to reject with an AppError.
    await expect(getProduct(req, { params: Promise.resolve({ slug: 'not-found' }) }))
      .rejects.toThrow(AppError);
  });
});
