import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('jne_admin_session');
  const { pathname } = request.nextUrl;

  // 1. If no session and trying to access admin pages, redirect to login
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/broadcast'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If session exists and trying to access login, redirect to dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Allow access to auth pages and public assets
  return NextResponse.next();
}

// Config to match all routes except public ones (images, fonts, etc)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/broadcast/:path*',
    '/employees/:path*',
    '/attendance/:path*',
    '/settings/:path*',
    '/login'
  ],
};
