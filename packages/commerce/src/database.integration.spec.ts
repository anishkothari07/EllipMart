import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@corecart/database';

describe('Layer 2 - Database Integration', () => {
  beforeAll(async () => {
    // Optionally clean up before running
    try {
      await prisma.user.deleteMany({});
    } catch (error) {
      // Ignore if tables don't exist yet (e.g. not migrated)
    }
  });

  afterAll(async () => {
    // Safely disconnect prisma if connected
    try {
      if (prisma && typeof (prisma as any).$disconnect === 'function') {
        await (prisma as any).$disconnect();
      }
    } catch (e) {
      // Ignore disconnect errors
    }
  });

  it('should connect to the test database and run a transaction', async () => {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: 'integration_test@example.com',
          firstName: 'Integration',
          lastName: 'Tester',
          passwordHash: 'hashed_password'
        }
      });
      return user;
    });

    expect(result).toBeDefined();
    expect(result.email).toBe('integration_test@example.com');
    expect(result.id).toBeDefined();

    // Verify persistence
    const savedUser = await prisma.user.findUnique({
      where: { id: result.id }
    });
    
    expect(savedUser).not.toBeNull();
    expect(savedUser?.firstName).toBe('Integration');
  });
});
