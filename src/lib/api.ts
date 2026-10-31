import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const TOKEN_KEYS = {
  ACCESS: 'IPILE_access_token',
  REFRESH: 'IPILE_refresh_token',
} as const;

/**
 * Fired when the session can no longer be refreshed, so the auth context can sign out.
 * `detail` is 'suspended' when the account was suspended, otherwise 'expired'.
 */
export const SESSION_EXPIRED_EVENT = 'IPILE:session-expired';
/** Fired after tokens rotate, so the auth context can renew the session cookie. */
export const TOKENS_REFRESHED_EVENT = 'IPILE:tokens-refreshed';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// One refresh at a time: concurrent 401s wait for the same rotation instead of
// each spending (and invalidating) the single-use refresh token.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    localStorage.setItem(TOKEN_KEYS.ACCESS, data.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, data.refreshToken);
    window.dispatchEvent(new Event(TOKENS_REFRESHED_EVENT));
    return data.accessToken as string;
  } catch (err) {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    const reason = apiErrorCode(err) === 'ACCOUNT_SUSPENDED' ? 'suspended' : 'expired';
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: reason }));
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    // A 401 from sign-in style calls means bad credentials, not an expired token. /auth/me
    // and /auth/logout carry the access token like any other call, so they do refresh.
    const isAuthCall = original?.url?.startsWith('/auth/') && original.url !== '/auth/me' && original.url !== '/auth/logout';
    if (typeof window === 'undefined' || error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const token = await refreshing;
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

interface ApiErrorBody {
  error?: { message?: string | string[]; code?: string; missing?: string[] } | string;
  message?: string | string[];
}

/** A readable message for any failed request — never a raw status code or stack. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return err.code === 'ECONNABORTED'
        ? 'The request took too long. Check your connection and try again.'
        : 'We could not reach IPILE. Check your connection and try again.';
    }
    const body = err.response.data as ApiErrorBody | undefined;
    const raw = typeof body?.error === 'object' ? body.error.message : (body?.message ?? body?.error);
    const message = Array.isArray(raw) ? raw[0] : raw;
    if (typeof message === 'string' && message.trim()) return message;
    if (err.response.status >= 500) return 'Our servers had a problem. Please try again in a moment.';
  }
  return fallback;
}

/** The machine-readable error code the API attached, e.g. EMAIL_NOT_VERIFIED. */
export function apiErrorCode(err: unknown): string | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  const body = err.response?.data as ApiErrorBody | undefined;
  return typeof body?.error === 'object' ? body.error.code : undefined;
}

export default api;
