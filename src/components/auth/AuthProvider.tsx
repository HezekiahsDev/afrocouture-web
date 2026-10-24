'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiErrorCode, SESSION_EXPIRED_EVENT, TOKENS_REFRESHED_EVENT } from '@/lib/api';
import * as auth from '@/lib/auth';
import { clearSessionCookie, rememberAccount, syncSessionCookie } from '@/lib/session-client';
import { bindChatSocketUser } from '@/lib/socket';
import type { AuthSession, SelfServiceRole, User } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
/** Why the current anonymous state began — guarded pages redirect differently for each. */
export type SignedOutReason = 'never' | 'user' | 'expired' | 'suspended';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signedOutReason: SignedOutReason;
  /** Store a session returned by login or email verification; resolves once the server session is set. */
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: SelfServiceRole) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [signedOutReason, setSignedOutReason] = useState<SignedOutReason>('never');

  const refreshUser = useCallback(async () => {
    if (!auth.hasStoredSession()) {
      void clearSessionCookie();
      setUser(null);
      setStatus('anonymous');
      return;
    }
    try {
      const me = await auth.fetchMe();
      // Renew the server session (and its role) before guarded pages act on this state.
      await syncSessionCookie();
      setUser(me);
      setStatus('authenticated');
    } catch (err) {
      auth.clearTokens();
      void clearSessionCookie();
      if (apiErrorCode(err) === 'ACCOUNT_SUSPENDED') setSignedOutReason('suspended');
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    // Restoring the session needs localStorage, which only exists after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser();
    const expired = (event: Event) => {
      void clearSessionCookie();
      setUser(null);
      setSignedOutReason((event as CustomEvent<string>).detail === 'suspended' ? 'suspended' : 'expired');
      setStatus('anonymous');
    };
    const refreshed = () => void syncSessionCookie();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    window.addEventListener(TOKENS_REFRESHED_EVENT, refreshed);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
      window.removeEventListener(TOKENS_REFRESHED_EVENT, refreshed);
    };
  }, [refreshUser]);

  // Live connections belong to one person: drop them when that person changes.
  useEffect(() => bindChatSocketUser(user?.id ?? null), [user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signedOutReason,
      signIn: async (session) => {
        auth.saveTokens(session);
        rememberAccount();
        await syncSessionCookie();
        setUser(session.user);
        setStatus('authenticated');
      },
      signOut: async () => {
        await Promise.all([auth.logout(), clearSessionCookie()]);
        setUser(null);
        setSignedOutReason('user');
        setStatus('anonymous');
      },
      setRole: async (role) => {
        const updated = await auth.setRole(role);
        await syncSessionCookie();
        setUser(updated);
        return updated;
      },
      refreshUser,
    }),
    [user, status, signedOutReason, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
