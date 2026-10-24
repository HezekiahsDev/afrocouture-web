'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { apiErrorMessage } from '@/lib/api';
import { decideAccess } from '@/lib/access';
import { hasKnownAccount } from '@/lib/session-client';
import type { SelfServiceRole } from '@/types';

const ROLE_LABEL: Record<SelfServiceRole, string> = {
  customer: 'customer',
  tailor: 'artisan',
  merchant: 'merchant',
};

/**
 * Gate for signed-in pages. Anonymous visitors are sent to sign up (with the role
 * this page needs and a way back); signed-in people with another role can switch.
 * Roles a page never serves (e.g. admins on member pages, members on admin pages) are
 * redirected using the same rules as the proxy (lib/access.ts).
 */
export function RequireAuth({ role, children }: { role?: SelfServiceRole | 'admin'; children: ReactNode }) {
  const { user, status, signedOutReason, setRole } = useAuth();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    const decision = decideAccess(window.location.pathname, user.role);
    const to =
      decision.kind === 'redirect' ? decision.to : role === 'admin' && user.role !== 'admin' ? '/marketplace' : null;
    if (to) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hide the page while navigating away
      setRedirecting(true);
      router.replace(to);
    }
  }, [status, user, role, router]);

  useEffect(() => {
    if (status !== 'anonymous') return;
    if (signedOutReason === 'suspended') {
      router.replace('/signin?reason=suspended');
      return;
    }
    if (signedOutReason === 'user') {
      // They chose to sign out — don't push them into a sign-up form.
      router.replace('/marketplace');
      return;
    }
    // Read the location here rather than with usePathname(), which would block
    // prerendering on dynamic routes that use this gate.
    const params = new URLSearchParams({ next: window.location.pathname + window.location.search });
    // Expired sessions and returning visitors sign in; only new people are sent to sign up.
    if (signedOutReason === 'expired' || hasKnownAccount()) {
      router.replace(`/signin?${params}`);
      return;
    }
    if (role && role !== 'admin') params.set('role', role);
    router.replace(role === 'admin' ? `/signin?${params}` : `/signup?${params}`);
  }, [status, signedOutReason, role, router]);

  if (status !== 'authenticated' || !user || redirecting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#94A3B8]" role="status">
        <LoaderCircle className="animate-spin" size={28} aria-label="Loading your account" />
      </div>
    );
  }

  if (role && role !== 'admin' && user.role !== role) {
    const wanted: SelfServiceRole = role;
    async function switchRole() {
      setSwitching(true);
      setError('');
      try {
        await setRole(wanted);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setSwitching(false);
      }
    }

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <ShieldAlert size={36} className="text-[#00A3FF]" />
        <h1 className="text-2xl font-bold text-[#F8FAFC]">This page is for {ROLE_LABEL[role]}s</h1>
        <p className="text-sm text-[#94A3B8]">
          You&apos;re signed in as a {ROLE_LABEL[user.role as SelfServiceRole] ?? user.role}. Switch your account to{' '}
          {ROLE_LABEL[role]} to continue. Accounts can switch until they place an order or submit a profile for review.
        </p>
        {error && <p className="text-sm text-[#ffb4ab]">{error}</p>}
        <div className="flex gap-3">
          <button type="button" className="btn-primary" onClick={switchRole} disabled={switching}>
            {switching ? 'Switching…' : `Continue as ${ROLE_LABEL[role]}`}
          </button>
          <Link href="/marketplace" className="btn-ghost">
            Back to discover
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
