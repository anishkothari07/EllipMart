import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as uploadMedia } from './route';

const mockPrisma = (globalThis as any).mockPrisma;

describe('Media Upload API Route (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if no files are uploaded', async () => {
    const req = {
      formData: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        get: vi.fn().mockReturnValue(null),
      })
    } as unknown as NextRequest;
    
    const response = await uploadMedia(req);
    expect(response.status).toBe(400);
  });

  it('should return 200 and process uploaded file', async () => {
    // Mock the uploaded asset
    mockPrisma.media.create.mockResolvedValue({
      id: 'media-1',
      originalName: 'test.png',
      publicUrl: 'https://res.cloudinary.com/demo/image/upload/test.png'
    });
    mockPrisma.mediaTag.upsert.mockResolvedValue({ id: 'tag-1' });
    mockPrisma.mediaTagMapping.create.mockResolvedValue({});

    const file = new Blob(['test content'], { type: 'image/png' }) as any;
    file.name = 'test.png';
    file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));

    const req = {
      formData: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([file]),
        get: vi.fn().mockImplementation((key) => {
          if (key === 'altText') return 'Test image';
          if (key === 'tags') return 'test, image';
          return null;
        }),
      })
    } as unknown as NextRequest;
    
    const response = await uploadMedia(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('media');
    expect(body.data.media.originalName).toBe('test.png');
  });
});
