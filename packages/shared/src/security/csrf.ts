import { NextRequest, NextResponse } from 'next/server';

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
/**
 * Validates Origin and Referer headers against the expected host.
 * This is the first line of defense against CSRF.
 */
export function validateOrigin(req: NextRequest, allowedOrigins: string[] = []): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');

  if (!origin && !referer) {
    // Some strict API clients might not send origin/referer, 
    // but browsers always do for cross-origin POST requests.
    return false;
  }

  const expectedHost = host ? `https://${host}` : null;
  const expectedHostHttp = host ? `http://${host}` : null;

  if (origin) {
    return origin === expectedHost || origin === expectedHostHttp || allowedOrigins.includes(origin);
  }

  if (referer) {
    return referer.startsWith(expectedHost || '') || referer.startsWith(expectedHostHttp || '') || allowedOrigins.some(o => referer.startsWith(o));
  }

  return false;
}

/**
 * Verifies the Double Submit Cookie CSRF token.
 * It expects the client to send a header `x-csrf-token` matching the `csrf_token` cookie.
 */
export function validateCsrfToken(req: NextRequest): boolean {
  const csrfCookie = req.cookies.get('csrf_token')?.value;
  const csrfHeader = req.headers.get('x-csrf-token');

  if (!csrfCookie || !csrfHeader) {
    return false;
  }

  return timingSafeEqualStr(csrfCookie, csrfHeader);
}

/**
 * Generates a new CSRF token and returns a modified NextResponse with the Set-Cookie header.
 */
export function setCsrfCookie(response: NextResponse): NextResponse {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  response.cookies.set('csrf_token', token, {
    httpOnly: false, // Must be readable by frontend to set the header!
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}
