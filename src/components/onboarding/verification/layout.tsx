'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BadgeCheck,
  CircleCheck,
  Circle,
  Clock,
  LoaderCircle,
  RotateCcw,
  Save,
  Send,
} from 'lucide-react';
import { PortalHeader } from '@/components/onboarding/PortalHeader';
import type { KycStatus } from '@/types';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export function VerificationShell({ portal, current, children }: { portal: string; current: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#090D16] text-[#DFE2EF] selection:bg-[#00A3FF] selection:text-[#00375A]">
      <PortalHeader portal={portal} current={current} />
      <main className="relative w-full flex-1 pb-16 pt-20 md:pt-24">
        <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 rounded-full bg-[#00A3FF]/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10">{children}</div>
      </main>
      <footer className="border-t border-white/[0.06] bg-[#0A0E17]/95 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-[#64748B] sm:flex-row sm:px-6 lg:px-10">
          <span>© 2026 AfroCouture AI</span>
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-[#F8FAFC]">
              Questions? {SUPPORT_EMAIL}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">{children}</p>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-[#94A3B8]" role="status">
      <LoaderCircle className="animate-spin text-[#00A3FF]" size={28} aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function LoadErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center" role="alert">
      <AlertTriangle size={32} className="text-[#ffb4ab]" aria-hidden="true" />
      <p className="text-sm text-[#F8FAFC]">{message}</p>
      <button type="button" onClick={onRetry} className="btn-primary">
        <RotateCcw size={16} aria-hidden="true" /> Try again
      </button>
    </div>
  );
}

interface StatusBannerProps {
  status: KycStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  subject: 'artisan profile' | 'merchant account';
  approvedLink?: { href: string; label: string };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

/** What the applicant needs to know about where their review stands. */
export function StatusBanner({ status, reviewNote, submittedAt, subject, approvedLink }: StatusBannerProps) {
  if (status === 'pending' || status === 'under_review') {
    return (
      <div className="mb-6 flex gap-4 rounded-2xl border border-[#00A3FF]/30 bg-[#00A3FF]/10 p-5" role="status">
        <Clock size={24} className="mt-0.5 shrink-0 text-[#38BDF8]" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-[#F8FAFC]">Your {subject} is under review</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
            {submittedAt ? `Submitted on ${formatDate(submittedAt)}. ` : ''}Our team checks every detail and document by
            hand. We&apos;ll email you as soon as there&apos;s a decision — you don&apos;t need to do anything until then.
          </p>
        </div>
      </div>
    );
  }
  if (status === 'approved') {
    return (
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 p-5 sm:flex-row sm:items-center" role="status">
        <BadgeCheck size={28} className="shrink-0 text-[#34D399]" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-[#F8FAFC]">Your {subject} is verified</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
            You&apos;re live on AfroCouture. Identity and payout details are locked after verification
            {SUPPORT_EMAIL ? ` — email ${SUPPORT_EMAIL} if they need to change` : ''}.
          </p>
        </div>
        {approvedLink && (
          <Link href={approvedLink.href} className="btn-ghost justify-center">
            {approvedLink.label}
          </Link>
        )}
      </div>
    );
  }
  if (reviewNote) {
    // Rejected, or edited since the rejection (the API moves it back to draft but keeps the note).
    return (
      <div className="mb-6 flex gap-4 rounded-2xl border border-[#ffb4ab]/40 bg-[#93000a]/20 p-5" role="alert">
        <AlertTriangle size={24} className="mt-0.5 shrink-0 text-[#ffb4ab]" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-[#F8FAFC]">Changes needed before we can verify you</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
            Reviewer&apos;s note: <span className="font-semibold text-[#F8FAFC]">{reviewNote}</span>
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Update the details below, then submit again.</p>
        </div>
      </div>
    );
  }
  return null;
}

export interface RequirementItem {
  label: string;
  done: boolean;
}

export function RequirementsChecklist({ items }: { items: RequirementItem[] }) {
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  return (
    <aside className="rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-5 backdrop-blur-xl" aria-label="Submission checklist">
      <h2 className="text-sm font-bold text-[#F8FAFC]">Ready to submit?</h2>
      <p className="mt-1 text-xs text-[#94A3B8]">
        {done} of {items.length} required items complete
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-[#00A3FF] to-[#22D3EE] transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            {item.done ? (
              <CircleCheck size={15} className="shrink-0 text-[#22D3EE]" aria-label="Done" />
            ) : (
              <Circle size={15} className="shrink-0 text-[#475569]" aria-label="To do" />
            )}
            <span className={item.done ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

interface ActionBarProps {
  dirty: boolean;
  busy: 'save' | 'submit' | null;
  notice: string;
  actionError: string;
  missing: string[];
  onSave: () => void;
  /** Omitted once verified: only saving remains. */
  onSubmit?: () => void;
  submitLabel?: string;
}

export function ActionBar({ dirty, busy, notice, actionError, missing, onSave, onSubmit, submitLabel = 'Submit for review' }: ActionBarProps) {
  return (
    <div className="sticky bottom-3 z-30 mt-8 rounded-2xl border border-white/10 bg-[#0F172A]/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:bottom-4 sm:p-5">
      {actionError && (
        <div className="mb-3 rounded-xl border border-[#ffb4ab]/30 bg-[#93000a]/20 px-3.5 py-2.5 text-xs text-[#ffdad6]" role="alert">
          <p className="font-semibold">{actionError}</p>
          {missing.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
              {missing.map((item) => (
                <li key={item} className="first-letter:uppercase">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="px-1 text-xs text-[#94A3B8]" aria-live="polite">
          {busy === 'save'
            ? 'Saving…'
            : busy === 'submit'
              ? 'Submitting…'
              : notice
                ? notice
                : dirty
                  ? 'You have unsaved changes.'
                  : 'All changes saved.'}
        </p>
        <div className="flex gap-2 [&>button]:flex-1 sm:[&>button]:flex-none">
          <button
            type="button"
            onClick={onSave}
            disabled={busy !== null || !dirty}
            className="btn-ghost justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === 'save' ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
            {onSubmit ? 'Save draft' : 'Save changes'}
          </button>
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={busy !== null}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === 'submit' ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Read-only view of what was submitted, shown while the review is pending. */
export function SubmittedSummary({ sections }: { sections: { title: string; rows: [string, ReactNode][] }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-5">
          <h2 className="mb-3 text-sm font-bold text-[#F8FAFC]">{section.title}</h2>
          <dl className="flex flex-col gap-2.5">
            {section.rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-xs text-[#94A3B8]">{label}</dt>
                <dd className="min-w-0 break-words text-sm text-[#F8FAFC] sm:text-right">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/** Masks all but the last four digits of an account number. */
export const maskAccount = (value: string | null) => (value ? `•••••• ${value.slice(-4)}` : null);

export function DocumentLink({ url, label }: { url: string | null; label: string }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-[#38BDF8] hover:underline">
      {label}
    </a>
  );
}
