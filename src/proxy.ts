import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const session = request.cookies.get('taskmatrix-session')?.value;
  const { pathname } = request.nextUrl;

  // Define route matching
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // If trying to access protected dashboard routes without session: redirect to /login
  if (isDashboardRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth pages (login/register) with active session: redirect to /dashboard
  if (isAuthRoute && session) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Config matcher to optimize proxy execution paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
