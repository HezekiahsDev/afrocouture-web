'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { AuthField, AuthShell, FormAlert } from './AuthShell';
import { PasswordInput } from './SignUpForm';
import { useAuth } from './AuthProvider';
import { login, resendVerification } from '@/lib/auth';
import { apiErrorCode, apiErrorMessage } from '@/lib/api';
import { landingAfterAuth } from '@/lib/access';

export default function SignInForm({ next, email: initialEmail, reason }: { next?: string; email?: string; reason?: string }) {
  const router = useRouter();
  const { signIn, status, user, signedOutReason } = useAuth();
  const suspended = reason === 'suspended' || signedOutReason === 'suspended';
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && user && !submitting) {
      router.replace(landingAfterAuth(user, next));
    }
  }, [status, user, next, router, submitting]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await login(email.trim(), password);
      await signIn(session);
      router.replace(landingAfterAuth(session.user, next));
    } catch (err) {
      if (apiErrorCode(err) === 'EMAIL_NOT_VERIFIED') {
        // Send a fresh code (ignore the "wait a minute" throttle — a recent code still works).
        await resendVerification(email.trim()).catch(() => undefined);
        const params = new URLSearchParams({ email: email.trim().toLowerCase() });
        if (next) params.set('next', next);
        router.push(`/verify-email?${params}`);
        return;
      }
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  }

  const query = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <AuthShell
      kicker="Welcome back"
      title={
        <>
          Sign in to <span className="text-[#00A3FF]">AfroCouture.</span>
        </>
      }
      subtitle="Pick up where you left off — your fit profile, saved artisans and fabric selection."
      footer={
        <>
          New here?{' '}
          <Link href={`/signup${query}`} className="font-semibold text-[#38BDF8] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
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

        <AuthField
          label="Password"
          action={
            <Link
              href={`/forgot-password${email ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
              className="normal-case tracking-normal text-[#38BDF8] hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          {({ className }) => (
            <PasswordInput value={password} onChange={setPassword} className={className} autoComplete="current-password" />
          )}
        </AuthField>

        {suspended && !error && (
          <FormAlert>Your account has been suspended. If you think this is a mistake, contact AfroCouture support.</FormAlert>
        )}
        {error && <FormAlert>{error}</FormAlert>}

        <button type="submit" className="btn-primary w-full justify-center py-3.5" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
