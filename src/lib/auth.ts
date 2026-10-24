import api, { TOKEN_KEYS } from './api';
import type { AuthSession, SelfServiceRole, User } from '@/types';

export function hasStoredSession(): boolean {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem(TOKEN_KEYS.REFRESH));
}

export function saveTokens(session: Pick<AuthSession, 'accessToken' | 'refreshToken'>) {
  localStorage.setItem(TOKEN_KEYS.ACCESS, session.accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH, session.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

export async function register(input: {
  email: string;
  password: string;
  fullName: string;
  role?: SelfServiceRole;
}): Promise<{ email: string; message: string }> {
  const { data } = await api.post('/auth/register', input);
  return data;
}

export async function verifyEmail(email: string, code: string): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>('/auth/verify-email', { email, code });
  saveTokens(data);
  return data;
}

export async function resendVerification(email: string): Promise<void> {
  await api.post('/auth/resend-verification', { email });
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>('/auth/login', { email, password });
  saveTokens(data);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // The local session is cleared either way.
  } finally {
    clearTokens();
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(email: string, code: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { email, code, password });
}

export async function setRole(role: SelfServiceRole): Promise<User> {
  const { data } = await api.patch<User>('/users/me/role', { role });
  return data;
}

/** Where each role continues after sign-up or sign-in. */
export const ROLE_HOME: Record<SelfServiceRole, string> = {
  customer: '/onboarding/fit-profile',
  tailor: '/onboarding/tailor-kyc',
  merchant: '/onboarding/merchant-verification',
};

/** Only allow same-site relative redirects, so ?next= cannot send people off-site. */
export function safeNext(next: string | null | undefined, fallback = '/marketplace'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}
