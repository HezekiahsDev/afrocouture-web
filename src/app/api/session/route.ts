import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from '@/lib/session';
import type { AppRole } from '@/lib/access';

// Server-side calls can use a private URL for the API; the public one works too.
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function cleared(status: number, body: object) {
  const res = NextResponse.json(body, { status });
  res.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return res;
}

/**
 * Exchanges a valid API access token for the session cookie. The role comes from the API
 * (GET /auth/me reads it from the database), never from the client.
 */
export async function POST(request: NextRequest) {
  let accessToken: unknown;
  try {
    ({ accessToken } = (await request.json()) as { accessToken?: unknown });
  } catch {
    return cleared(400, { error: 'Invalid request.' });
  }
  if (typeof accessToken !== 'string' || accessToken.length > 4096) return cleared(400, { error: 'Invalid request.' });

  let me: Response;
  try {
    me = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Can't reach the API: keep whatever cookie exists rather than signing people out.
    return NextResponse.json({ error: 'Could not reach the API.' }, { status: 503 });
  }
  if (!me.ok) return cleared(401, { error: 'Session is not valid.' });

  const user = (await me.json()) as { id: string; role: AppRole; status?: string };
  if (user.status && user.status !== 'active') return cleared(403, { error: 'Account is not active.' });

  let token: string;
  try {
    token = await signSession({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
  } catch {
    return NextResponse.json({ error: 'Sessions are not configured on this server.' }, { status: 500 });
  }
  const res = NextResponse.json({ role: user.role });
  res.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
  return res;
}

export async function DELETE() {
  return cleared(200, { ok: true });
}
