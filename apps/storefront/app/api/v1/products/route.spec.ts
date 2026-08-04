import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getProducts } from './route';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Products API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 and a paginated list of products', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
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
        // Mocked includes for the mapper
        category: { id: 'cat-1', name: 'Test Category', slug: 'test-category' },
        brand: { id: 'brand-1', name: 'Test Brand', slug: 'test-brand' },
        images: [{ id: 'img-1', url: 'https://res.cloudinary.com/test', isPrimary: true }],
        variants: [{ name: 'Default Size', price: 100 }],
        tags: []
      }
    ]);
    mockPrisma.product.count.mockResolvedValue(1);

    const req = new NextRequest('http://localhost:3000/api/v1/products?page=1&limit=20');
    const response = await getProducts(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].slug).toBe('test-product-1');
    expect(body.data.meta.total).toBe(1);
  });

  it('should handle empty results when no products match filters', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);

    const req = new NextRequest('http://localhost:3000/api/v1/products?category=non-existent');
    const response = await getProducts(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(0);
    expect(body.data.meta.total).toBe(0);
  });

  it('should parse filters correctly and apply them to the query', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);

    const req = new NextRequest('http://localhost:3000/api/v1/products?search=shoes&category=sneakers&minPrice=50&maxPrice=150');
    await getProducts(req);

    // Verify findMany was called with correct filter mapping
    expect(mockPrisma.product.findMany).toHaveBeenCalled();
    const callArgs = mockPrisma.product.findMany.mock.calls[0][0];
    
    expect(callArgs.where.category.slug).toBe('sneakers');
    expect(callArgs.where.OR).toBeDefined(); // search maps to OR
    expect(callArgs.where.variants.some.price.gte).toBe(50);
    expect(callArgs.where.variants.some.price.lte).toBe(150);
  });
});
