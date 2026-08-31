import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'a'.repeat(32);
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'b'.repeat(32);

// API routes that don't need a session token
const publicApiRoutes = [
  '/api/v1/health',
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/verify-email',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/payment/methods',
  '/api/v1/payment/webhook',
];

async function getSessionPayload(req: NextRequest) {
  // Try unified session cookie first (new architecture)
  let token = req.cookies.get('ellipmart_session')?.value;

  // Fallback to legacy cookies for backward compatibility
  if (!token) {
    token =
      req.cookies.get('ellipmart_customer_refresh')?.value ||
      req.cookies.get('ellipmart_seller_refresh')?.value ||
      req.cookies.get('ellipmart_merchant_refresh')?.value ||
      req.cookies.get('ellipmart_admin_refresh')?.value;
  }

  // Also check Authorization header (for API clients)
  if (!token) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  }

  if (!token) return null;

  const accessSecret = new TextEncoder().encode(JWT_ACCESS_SECRET);
  const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload;
  } catch {
    try {
      const { payload } = await jwtVerify(token, refreshSecret);
      return payload;
    } catch {
      return null;
    }
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── RBAC: /seller/* requires SELLER role ─────────────────────────────────
  if (pathname.startsWith('/seller')) {
    const payload = await getSessionPayload(req);
    if (!payload) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    // Inject user info into headers for server components / actions
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-user-role', payload.role as string);
    return NextResponse.next({ request: { headers } });
  }

  // ── RBAC: /admin/* requires ADMIN role ───────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const payload = await getSessionPayload(req);
    if (!payload) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-user-role', payload.role as string);
    return NextResponse.next({ request: { headers } });
  }

  // ── API route protection (/api/v1/*) ─────────────────────────────────────
  if (pathname.startsWith('/api/v1')) {
    // Dev-only routes
    if (pathname.startsWith('/api/v1/dev/')) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
      }
      return NextResponse.next();
    }

    // Public API routes — no auth needed
    if (
      publicApiRoutes.includes(pathname) ||
      pathname.startsWith('/api/v1/media') ||
      pathname.startsWith('/api/v1/notifications') ||
      pathname.startsWith('/api/v1/notification') ||
      pathname.startsWith('/api/v1/webhooks') ||
      pathname.startsWith('/api/v1/analytics') ||
      pathname.startsWith('/api/v1/ai') ||
      pathname.startsWith('/api/v1/products') ||
      pathname.startsWith('/api/v1/search') ||
      pathname.startsWith('/api/v1/categories') ||
      pathname.startsWith('/api/v1/brands') ||
      pathname.startsWith('/api/v1/collections') ||
      pathname.startsWith('/api/v1/pincode')
    ) {
      return NextResponse.next();
    }

    // All other /api/v1 routes require authentication
    const payload = await getSessionPayload(req);
    if (!payload) {
      // Allow guest access to cart, checkout and address routes.
      // Next.js 16 strips browser-sent x- headers, so we must explicitly
      // re-inject x-user-id from the request before forwarding.
      if (
        pathname.startsWith('/api/v1/cart') ||
        pathname.startsWith('/api/v1/checkout') ||
        pathname.startsWith('/api/v1/users/address')
      ) {
        const guestHeaders = new Headers(req.headers);
        const guestUserId = req.headers.get('x-user-id') || 'guest';
        guestHeaders.set('x-user-id', guestUserId);
        return NextResponse.next({ request: { headers: guestHeaders } });
      }
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-user-role', payload.role as string);
    if (payload.sessionId) headers.set('x-session-id', payload.sessionId as string);
    return NextResponse.next({ request: { headers } });
  }

  // ── Customer Auth Guard: /checkout and /account require login ──────────────
  if (
    pathname === '/checkout' ||
    (pathname.startsWith('/checkout') && !pathname.startsWith('/checkout/success')) ||
    pathname.startsWith('/account')
  ) {
    const payload = await getSessionPayload(req);
    if (!payload) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-user-role', payload.role as string);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/:path*', '/seller/:path*', '/admin/:path*', '/checkout/:path*', '/checkout', '/account/:path*', '/account'],
};
