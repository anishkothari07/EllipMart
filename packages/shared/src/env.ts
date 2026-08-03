import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_ACCESS_SECRET: z.string().catch('a'.repeat(32)),
  JWT_REFRESH_SECRET: z.string().catch('b'.repeat(32)),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCK_DURATION_MINUTES: z.coerce.number().default(30),
});

const _env = typeof window === 'undefined' ? envSchema.safeParse(process.env) : { success: true, data: process.env as any };

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data as z.infer<typeof envSchema>;
