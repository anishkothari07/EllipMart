import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { env } from '../env';

export interface TokenPayload extends JWTPayload {
  userId: string;
  role: string;
  email?: string; // Included for email-based role check in middleware
  sessionId?: string; // Included for access tokens to map to a specific session
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES)
    .sign(secret);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}
