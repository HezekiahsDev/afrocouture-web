import { NextResponse, type NextRequest } from 'next/server';
import { decideAccess, ruleFor } from '@/lib/access';
import { KNOWN_ACCOUNT_COOKIE, SESSION_COOKIE, verifySession } from '@/lib/session';

/**
 * Role-based access before anything renders: protected pages are only served to roles
 * allowed to see them (rules in lib/access.ts). This is an optimistic check on the signed
 * session cookie; the API still authorises every request for data.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!ruleFor(pathname)) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const decision = decideAccess(pathname, session?.role ?? null, request.cookies.has(KNOWN_ACCOUNT_COOKIE));

  if (decision.kind === 'allow') {
    const res = NextResponse.next();
    // Pages behind a sign-in must never be cached by a shared cache.
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }
  const url = request.nextUrl.clone();
  url.search = '';
  if (decision.kind === 'signin' || decision.kind === 'signup') {
    url.pathname = decision.kind === 'signin' ? '/signin' : '/signup';
    url.searchParams.set('next', pathname + search);
    if (decision.kind === 'signup') url.searchParams.set('role', decision.role);
  } else {
    url.pathname = decision.to;
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/merchant/:path*',
    '/onboarding/fit-profile',
    '/onboarding/tailor-kyc',
    '/onboarding/merchant-verification',
    '/orders/:path*',
    '/saved',
    '/notifications',
    '/survey',
  ],
};
