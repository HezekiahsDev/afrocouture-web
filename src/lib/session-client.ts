import { TOKEN_KEYS } from './api';
import type { AppRole } from './access';

/**
 * Keeps the server-side session cookie (see lib/session.ts) in step with the tokens in
 * localStorage. Resolves to the role the server confirmed, or null.
 */
export async function syncSessionCookie(): Promise<AppRole | null> {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS);
  if (!accessToken) {
    await clearSessionCookie();
    return null;
  }
  try {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    return ((await res.json()) as { role: AppRole }).role;
  } catch {
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' });
  } catch {
    // Expires on its own; the API rejects the old tokens regardless.
  }
}
