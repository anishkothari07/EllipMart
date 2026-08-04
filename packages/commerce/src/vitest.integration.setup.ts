import dotenv from 'dotenv';
import path from 'path';

// Load .env.test from the project root for integration tests
const envPath = path.resolve(process.cwd(), '.env.test');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set in .env.test. Integration tests may fail.');
}

// Optionally, mock external third-party services that should NEVER be hit during integration testing
import { vi } from 'vitest';

vi.mock('razorpay', () => {
  return {
    default: class MockRazorpay {
      orders = {
        create: vi.fn().mockResolvedValue({ id: 'rzp_order_integration', amount: 1000 }),
      };
      payments = {
        refund: vi.fn().mockResolvedValue({ id: 'rfnd_integration', status: 'processed' }),
      };
    },
  };
});

// Import Prisma client after mocks to add query monitor
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn(`[SLOW QUERY WARNING] ${e.duration}ms - ${e.query}`);
  }
});

