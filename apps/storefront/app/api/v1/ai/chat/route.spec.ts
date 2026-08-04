import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatHandler } from './route';

const mockPrisma = (globalThis as any).mockPrisma;

describe('AI Chat API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.aIConversation.create.mockResolvedValue({ id: 'conv-1' });
    mockPrisma.aIMessage.create.mockResolvedValue({ id: 'msg-1' });
    mockPrisma.product.findMany.mockResolvedValue([]);
  });

  it('should return 400 if query is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({})
    });
    const response = await chatHandler(req);
    expect(response.status).toBe(400);
  });

  it('should return 200 and a chat response for a valid query', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query: 'I need a good laptop' })
    });
    
    const response = await chatHandler(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('reply');
    expect(body).toHaveProperty('conversationId');
    expect(body).toHaveProperty('sources');
    expect(body).toHaveProperty('suggestions');
  });

  it('should include order history context if requested', async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      { id: 'order-1', orderNumber: 'ORD-123', status: 'DELIVERED', grandTotal: 100 }
    ]);

    const req = new NextRequest('http://localhost:3000/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query: 'Where is my order?' })
    });
    
    const response = await chatHandler(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.sources).toContain('Orders Database');
  });
});
