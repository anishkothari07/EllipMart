import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'b'.repeat(32));
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || 'super@corecart.com').split(',').map(e => e.trim());

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static files, api routes, and login pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('ellipmart_admin_refresh')?.value;

  if (!token) {
    // Redirect to admin login screen if there is no session token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    const email = (payload as any).email;
    
    // Verify user is ADMIN and their email is explicitly registered in SUPER_ADMIN_EMAILS
    const isSuperAdmin = payload.role === 'ADMIN' && email && SUPER_ADMIN_EMAILS.includes(email);
    if (!isSuperAdmin) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('ellipmart_admin_refresh');
      return response;
    }
  } catch (e) {
    // Clear invalid token and redirect to login page
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('ellipmart_admin_refresh');
    return response;
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
