'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { AuthField, AuthShell, FormAlert } from './AuthShell';
import { CodeInput } from './CodeInput';
import { PasswordInput, passwordProblem } from './SignUpForm';
import { forgotPassword, resetPassword } from '@/lib/auth';
import { apiErrorMessage } from '@/lib/api';

type Step = 'request' | 'reset' | 'done';

export default function ForgotPasswordForm({ email: initialEmail }: { email?: string }) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter the email you signed up with.');
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setStep('reset');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('Enter the 6-digit code from the email.');
      return;
    }
    const problem = passwordProblem(password);
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email.trim(), code, password);
      setStep('done');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const signInHref = `/signin?email=${encodeURIComponent(email.trim())}`;

  if (step === 'done') {
    return (
      <AuthShell kicker="Password updated" title="You're all set.">
        <div className="flex flex-col gap-5">
          <FormAlert tone="success">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} aria-hidden="true" /> Your password has been changed. Other devices were signed out.
            </span>
          </FormAlert>
          <Link href={signInHref} className="btn-primary w-full justify-center py-3.5">
            Sign in <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      kicker="Reset your password"
      title={step === 'request' ? 'Forgot your password?' : 'Choose a new password.'}
      subtitle={
        step === 'request' ? (
          "Enter your email and we'll send you a 6-digit code to reset it."
        ) : (
          <>
            If an account exists for <strong className="text-[#171717]">{email.trim()}</strong>, a code is on its way.
            It expires in 10 minutes.
          </>
        )
      }
      footer={
        <>
          Remembered it?{' '}
          <Link href={signInHref} className="font-semibold text-[#8F5637] hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {step === 'request' ? (
        <form onSubmit={requestCode} noValidate className="flex flex-col gap-5">
          <AuthField label="Email">
            {(props) => (
              <input
                {...props}
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            )}
          </AuthField>
          {error && <FormAlert>{error}</FormAlert>}
          <button type="submit" className="btn-primary w-full justify-center py-3.5" disabled={submitting}>
            {submitting ? <LoaderCircle size={17} className="animate-spin" aria-label="Sending" /> : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form onSubmit={reset} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Reset code</span>
            <CodeInput value={code} onChange={setCode} disabled={submitting} />
          </div>
          <AuthField label="New password" hint="At least 8 characters, with a letter and a number.">
            {({ className }) => (
              <PasswordInput value={password} onChange={setPassword} className={className} autoComplete="new-password" />
            )}
          </AuthField>
          {error && <FormAlert>{error}</FormAlert>}
          <button type="submit" className="btn-primary w-full justify-center py-3.5" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('request');
              setCode('');
              setError('');
            }}
            className="text-sm font-semibold text-[#8F5637] hover:underline"
          >
            Use a different email or resend the code
          </button>
        </form>
      )}
    </AuthShell>
  );
}
