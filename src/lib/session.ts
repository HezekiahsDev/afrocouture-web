/**
 * The web app's own session cookie: a signed note of who is signed in and their role, so
 * the proxy can decide access before rendering. It holds no API token. It is issued by
 * /api/session only after the API confirms the access token (GET /auth/me), and is
 * HMAC-SHA256 signed with SESSION_SECRET (server-only).
 */
import type { AppRole } from './access';

export const SESSION_COOKIE = 'ac_session';
/** Matches the API's refresh-token lifetime; re-issued on every refresh, so it slides. */
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export interface SessionClaims {
  sub: string;
  role: AppRole;
  /** Expiry, seconds since epoch. */
  exp: number;
}

const ROLES: AppRole[] = ['customer', 'tailor', 'merchant', 'admin'];
const encoder = new TextEncoder();

function secret(): string | null {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  // Local development only; production refuses to sign or trust cookies without a real secret.
  return process.env.NODE_ENV === 'production' ? null : 'afrocouture-dev-session-secret-not-for-production';
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function key(value: string) {
  return crypto.subtle.importKey('raw', encoder.encode(value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  const value = secret();
  if (!value) throw new Error('SESSION_SECRET is not set (32+ characters required).');
  const payload = b64url(encoder.encode(JSON.stringify(claims)));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await key(value), encoder.encode(payload)));
  return `${payload}.${b64url(signature)}`;
}

/** The claims if the cookie is authentic and unexpired; otherwise null. */
export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  const value = secret();
  if (!token || !value) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(value), fromB64url(signature), encoder.encode(payload));
    if (!ok) return null;
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Partial<SessionClaims>;
    if (typeof claims.sub !== 'string' || !ROLES.includes(claims.role as AppRole)) return null;
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return null;
    return claims as SessionClaims;
  } catch {
    return null;
  }
}
