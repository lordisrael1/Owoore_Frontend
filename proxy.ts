import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE_ADMIN  = 'owoore_admin_token';
const TOKEN_COOKIE_MEMBER = 'owoore_member_token';

function getTokenFromCookies(request: NextRequest, cookieName: string): string | null {
  return request.cookies.get(cookieName)?.value ?? null;
}

function isTokenStructurallyValid(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const token   = getTokenFromCookies(request, TOKEN_COOKIE_ADMIN);
    const isValid = token ? isTokenStructurallyValid(token) : false;

    if (!isValid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/portal')) {
    const token   = getTokenFromCookies(request, TOKEN_COOKIE_MEMBER);
    const isValid = token ? isTokenStructurallyValid(token) : false;

    if (!isValid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/register/logo')) {
    const token   = getTokenFromCookies(request, TOKEN_COOKIE_ADMIN);
    const isValid = token ? isTokenStructurallyValid(token) : false;

    if (!isValid) {
      return NextResponse.redirect(new URL('/register', request.url));
    }
  }

  if (pathname.startsWith('/setup')) {
    const token   = getTokenFromCookies(request, TOKEN_COOKIE_ADMIN);
    const isValid = token ? isTokenStructurallyValid(token) : false;

    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portal/:path*',
    '/register/logo',
    '/setup/:path*',
  ],
};
