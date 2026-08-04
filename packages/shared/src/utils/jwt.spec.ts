import { describe, it, expect } from 'vitest';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';

describe('JWT Utility Functions', () => {
  const payload = {
    userId: 'user_123',
    role: 'CUSTOMER',
    email: 'test@example.com',
  };

  it('should successfully sign and verify access token', async () => {
    const token = await signAccessToken(payload);
    expect(token).toBeTypeOf('string');
    expect(token.length).toBeGreaterThan(0);

    const verified = await verifyAccessToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.role).toBe(payload.role);
    expect(verified.email).toBe(payload.email);
  });

  it('should successfully sign and verify refresh token', async () => {
    const token = await signRefreshToken(payload);
    expect(token).toBeTypeOf('string');

    const verified = await verifyRefreshToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.role).toBe(payload.role);
    expect(verified.email).toBe(payload.email);
  });

  it('should reject invalid or expired tokens', async () => {
    await expect(verifyAccessToken('invalid-token')).rejects.toThrow();
  });
});
