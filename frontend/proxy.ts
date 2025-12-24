import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/', '/login', '/register'];
  const protectedPath = '/dashboard';

  // If trying to access the protected dashboard without a token, redirect to login
  if (pathname.startsWith(protectedPath) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and trying to access a public-only path like login/register, redirect to dashboard
  if (token && publicPaths.includes(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL(protectedPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher to run on all paths except for API routes, static files, and image optimization.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


