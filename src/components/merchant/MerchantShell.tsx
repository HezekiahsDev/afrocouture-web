'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Clock, Store } from 'lucide-react';
import { PortalHeader } from '@/components/onboarding/PortalHeader';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { LoadErrorState, LoadingState } from '@/components/onboarding/verification/layout';
import { apiErrorMessage } from '@/lib/api';
import { getMyMerchantProfile } from '@/lib/catalog';
import type { MerchantProfile } from '@/types';

const LINKS = [
  { label: 'Business profile', href: '/onboarding/merchant-verification' },
  { label: 'Marketplace', href: '/fabric-explorer' },
];

export function MerchantShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0E8] text-[#171717]">
      <PortalHeader portal="Merchant Portal" current="My fabrics" links={LINKS} />
      <main className="relative w-full flex-1 pb-16 pt-20 md:pt-24">
        <div className="pointer-events-none absolute right-1/4 top-10 h-72 w-72 rounded-full bg-[#B8734E]/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10">
          <RequireAuth role="merchant">{children}</RequireAuth>
        </div>
      </main>
    </div>
  );
}

const ApprovedMerchantContext = createContext<MerchantProfile | null>(null);

/** The verified merchant's profile, inside <ApprovedMerchant>. */
export function useApprovedMerchant(): MerchantProfile {
  const profile = useContext(ApprovedMerchantContext);
  if (!profile) throw new Error('useApprovedMerchant must be used inside <ApprovedMerchant>');
  return profile;
}

/** Only verified merchants can list fabric; everyone else is told where they stand. */
export function ApprovedMerchant({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; profile?: MerchantProfile | null; error?: string }>({
    status: 'loading',
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      setState({ status: 'ready', profile: await getMyMerchantProfile() });
    } catch (err) {
      setState({ status: 'error', error: apiErrorMessage(err, 'We could not load your merchant account.') });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load();
  }, [load]);

  if (state.status === 'loading') return <LoadingState label="Loading your merchant account…" />;
  if (state.status === 'error') return <LoadErrorState message={state.error ?? ''} onRetry={load} />;

  const profile = state.profile;
  if (profile?.verificationStatus === 'approved') {
    return <ApprovedMerchantContext.Provider value={profile}>{children}</ApprovedMerchantContext.Provider>;
  }

  const pending = profile?.verificationStatus === 'pending' || profile?.verificationStatus === 'under_review';
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#B8734E]">
        {pending ? <Clock size={26} /> : <Store size={26} />}
      </span>
      <h1 className="text-2xl font-extrabold text-[#171717]">
        {pending ? 'Your verification is under review' : 'Get verified to list fabric'}
      </h1>
      <p className="text-sm leading-relaxed text-[#6B655C]">
        {pending
          ? 'You can add fabrics as soon as our team approves your business. We’ll email you when that happens.'
          : 'Customers buy from verified merchants only. Share your business and CAC details first — it takes a few minutes.'}
      </p>
      <Link href="/onboarding/merchant-verification" className="btn-primary">
        {pending ? 'View your submission' : 'Start verification'}
      </Link>
    </div>
  );
}
