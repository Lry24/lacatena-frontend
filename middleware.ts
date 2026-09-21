import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes admin — exclure la page de connexion admin
const ADMIN_PUBLIC = '/admin/connexion';

// Routes client protégées — nécessitent un token
const CLIENT_PROTECTED = ['/mon-compte', '/commande'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get('access_token')?.value ||
    request.headers.get('x-access-token');

  // ── Protection routes admin ──────────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== ADMIN_PUBLIC) {
    if (!token) {
      const loginUrl = new URL(ADMIN_PUBLIC, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Protection routes client ─────────────────────────────────────────────
  const isProtectedClient = CLIENT_PROTECTED.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedClient && !token) {
    const loginUrl = new URL('/connexion', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/mon-compte/:path*', '/commande/:path*'],
};
