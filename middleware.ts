import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = [
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // We only intercept /api/v1 routes
  if (!pathname.startsWith('/api/v1')) {
    return NextResponse.next();
  }

  // Handle development-only routes
  if (pathname.startsWith('/api/v1/dev/')) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
    }
    return NextResponse.next();
  }

  // Allow public routes & media / notification / webhook routes
  if (
    publicRoutes.includes(pathname) ||
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
    pathname.startsWith('/api/v1/collections')
  ) {
    return NextResponse.next();
  }

  // Check Authorization header or Cookie
  const authHeader = req.headers.get('Authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    const cookieToken = req.cookies.get('refreshToken')?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized', error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  // Tokens from Authorization header are always access tokens — verify with access secret only.
  // Tokens from the refreshToken cookie are only accepted on the refresh endpoint (handled above
  // as a public route), so we never fall back to the refresh secret here. This prevents a refresh
  // token from being used to authenticate arbitrary API calls without rotation.
  const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

  let payload;
  try {
    const result = await jwtVerify(token, accessSecret);
    payload = result.payload;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token', error: { code: 'INVALID_TOKEN' } },
      { status: 401 }
    );
  }


  // Add payload to headers for downstream route handlers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.userId as string);
  requestHeaders.set('x-user-role', payload.role as string);
  requestHeaders.set('x-session-id', payload.sessionId as string);

  // Admin role guard — /api/v1/admin/* requires ADMIN
  if (pathname.startsWith('/api/v1/admin') && payload.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden', error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  // Seller role guard — /api/v1/seller/* requires SELLER or ADMIN
  if (pathname.startsWith('/api/v1/seller') && payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden', error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/v1/:path*'],
};
