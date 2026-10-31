'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, PencilLine, Sparkles } from 'lucide-react';
import { getMyMerchantProfile, getMyTailorProfile } from '@/lib/catalog';
import { ROLE_HOME } from '@/lib/auth';
import { useI18n } from '@/i18n/I18nProvider';
import type { KycStatus, User } from '@/types';

type Step =
  | { kind: 'choose' }
  | { kind: 'start' | 'pending' | 'changes'; who: 'artisan' | 'merchant'; href: string; note?: string | null };

/**
 * One line under the navbar while an account isn't fully set up: choose a path, finish the
 * artisan/merchant profile, wait for review, or fix what review asked for. Approved
 * accounts and customers who chose their path never see it.
 */
export function SetupBanner({
  user,
  pathname,
  onShownChange,
}: {
  user: User;
  pathname: string;
  /** Tells the navbar whether the banner is on screen, so other prompts don't stack under it. */
  onShownChange?: (shown: boolean) => void;
}) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step | null>(null);
  const shown = Boolean(step) && !pathname.startsWith('/onboarding');

  useEffect(() => {
    onShownChange?.(shown);
  }, [shown, onShownChange]);

  useEffect(() => {
    let cancelled = false;
    const done = (s: Step | null) => !cancelled && setStep(s);
    if (user.role === 'admin') return void done(null);
    if (!user.pathChosenAt) return void done({ kind: 'choose' });
    if (user.role !== 'tailor' && user.role !== 'merchant') return void done(null);

    const who = user.role === 'tailor' ? 'artisan' : 'merchant';
    const href = ROLE_HOME[user.role];
    const load =
      user.role === 'tailor'
        ? getMyTailorProfile().then((p) => (p ? { status: p.kycStatus, note: p.reviewNote } : null))
        : getMyMerchantProfile().then((p) => (p ? { status: p.verificationStatus, note: p.reviewNote } : null));
    load
      .then((profile) => {
        const status: KycStatus = profile?.status ?? 'draft';
        if (status === 'approved') return done(null);
        if (status === 'pending' || status === 'under_review') return done({ kind: 'pending', who, href });
        if (status === 'rejected') return done({ kind: 'changes', who, href, note: profile?.note });
        done({ kind: 'start', who, href });
      })
      .catch(() => done(null));
    return () => {
      cancelled = true;
    };
  }, [user.id, user.role, user.pathChosenAt]);

  // The setup pages show their own status.
  if (!step || !shown) return null;

  const content =
    step.kind === 'choose'
      ? {
          icon: Sparkles,
          text: t.setup.choose,
          cta: t.setup.chooseCta,
          href: '/onboarding',
        }
      : step.kind === 'start'
        ? {
            icon: PencilLine,
            text: t.setup.start(step.who),
            cta: t.setup.startCta,
            href: step.href,
          }
        : step.kind === 'pending'
          ? {
              icon: Clock,
              text: t.setup.pending(step.who),
              cta: t.setup.pendingCta,
              href: step.href,
            }
          : {
              icon: PencilLine,
              text: t.setup.changes(step.who, step.note ?? null),
              cta: t.setup.changesCta,
              href: step.href,
            };
  const Icon = content.icon;

  return (
    <div className="mk-setup-banner" role="status" data-testid="setup-banner" data-step={step.kind}>
      <div className="mk-setup-inner">
        <Icon size={16} aria-hidden="true" />
        <p>{content.text}</p>
        <Link href={content.href}>
          {content.cta} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
