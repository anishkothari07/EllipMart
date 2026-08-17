import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'b'.repeat(32));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static files, API routes, and login pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('ellipmart_seller_refresh')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);

    // Only MERCHANT role is allowed in the Seller Portal
    if (payload.role !== 'MERCHANT') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('ellipmart_seller_refresh');
      return response;
    }
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('ellipmart_seller_refresh');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
