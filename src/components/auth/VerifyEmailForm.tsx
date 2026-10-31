'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle, MailCheck } from 'lucide-react';
import { AuthShell, FormAlert } from './AuthShell';
import { CodeInput } from './CodeInput';
import { useAuth } from './AuthProvider';
import { resendVerification, ROLE_HOME, verifyEmail } from '@/lib/auth';
import { landingAfterAuth } from '@/lib/access';
import { apiErrorMessage } from '@/lib/api';
import type { SelfServiceRole } from '@/types';

const RESEND_SECONDS = 60;

export default function VerifyEmailForm({ email, next }: { email?: string; next?: string }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) {
    return (
      <AuthShell kicker="Verify your email" title="Which email should we check?">
        <FormAlert tone="info">
          This link is missing an email address. <Link href="/signup" className="font-semibold underline">Sign up</Link>{' '}
          or <Link href="/signin" className="font-semibold underline">sign in</Link> to get a new code.
        </FormAlert>
      </AuthShell>
    );
  }

  async function submit(value: string) {
    if (!/^\d{6}$/.test(value) || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const session = await verifyEmail(email!, value);
      await signIn(session);
      router.replace(landingAfterAuth(session.user, next, ROLE_HOME[session.user.role as SelfServiceRole]));
    } catch (err) {
      setError(apiErrorMessage(err, 'That code did not work. Check it and try again.'));
      setCode('');
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (code.length < 6) {
      setError('Enter all 6 digits from the email.');
      return;
    }
    void submit(code);
  }

  async function resend() {
    setError('');
    setNotice('');
    try {
      await resendVerification(email!);
      setNotice(`We sent a new code to ${email}.`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <AuthShell
      kicker="Verify your email"
      title="Check your inbox."
      subtitle={
        <>
          We sent a 6-digit code to <strong className="text-[#171717]">{email}</strong>. It expires in 10 minutes.
        </>
      }
      footer={
        <>
          Wrong email?{' '}
          <Link href="/signup" className="font-semibold text-[#8F5637] hover:underline">
            Start again
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <CodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (error) setError('');
            if (value.length === 6) void submit(value);
          }}
          disabled={submitting}
          invalid={Boolean(error)}
        />

        {error && <FormAlert>{error}</FormAlert>}
        {notice && !error && <FormAlert tone="success">{notice}</FormAlert>}

        <button type="submit" className="btn-primary w-full justify-center py-3.5" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Verifying…
            </>
          ) : (
            <>
              Verify email <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-2 text-sm text-[#6B655C]">
          <MailCheck size={16} aria-hidden="true" />
          Didn&apos;t get it? Check spam, or{' '}
          {cooldown > 0 ? (
            <span className="tabular-nums text-[#6B655C]">resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={resend} className="font-semibold text-[#8F5637] hover:underline">
              send a new code
            </button>
          )}
        </p>
      </form>
    </AuthShell>
  );
}
