import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'b'.repeat(32));

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ellipmart_merchant_refresh')?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
      
      // Enforce that only ADMIN users can access merchant pages
      if (payload.role !== 'ADMIN') {
        const response = NextResponse.next();
        response.cookies.delete('ellipmart_merchant_refresh');
        return response;
      }
    } catch (e) {
      // Invalid token, clear it and let normal flow handle auth
      const response = NextResponse.next();
      response.cookies.delete('ellipmart_merchant_refresh');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
