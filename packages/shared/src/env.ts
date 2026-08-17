import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters. Set it in your .env file.'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters. Set it in your .env file.'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCK_DURATION_MINUTES: z.coerce.number().default(15),
});

export type Env = z.infer<typeof envSchema>;

// Skip validation during Docker/CI builds — env vars are only available at runtime
const skipValidation = !!process.env.SKIP_ENV_VALIDATION || !!process.env.VERCEL;

// On the client side, process.env won't have server-only vars — skip validation
const isServer = typeof window === 'undefined';

let _envData: Env;

if (skipValidation || !isServer) {
  // Client or build-time: return a best-effort object without throwing
  _envData = process.env as unknown as Env;
} else {
  const _env = envSchema.safeParse(process.env);
  if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables');
  }
  _envData = _env.data;
}

export const env = _envData;
