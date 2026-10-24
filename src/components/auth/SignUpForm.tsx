'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { AuthField, AuthShell, FormAlert } from './AuthShell';
import { useAuth } from './AuthProvider';
import { register, ROLE_HOME, safeNext } from '@/lib/auth';
import { landingAfterAuth } from '@/lib/access';
import { apiErrorCode, apiErrorMessage } from '@/lib/api';
import { rememberAccount } from '@/lib/session-client';
import type { SelfServiceRole } from '@/types';

/** What they'll set up after creating the account, when they came from a "join as…" button. */
const NEXT_STEP: Record<SelfServiceRole, string> = {
  customer: 'Next, you can add your measurements — or skip and start exploring.',
  tailor: 'Next, you’ll set up your artisan profile. Customers see it once our team has verified it.',
  merchant: 'Next, you’ll add your business details. Your fabrics go live once our team has verified you.',
};
const isRole = (value: string | undefined): value is SelfServiceRole =>
  value === 'customer' || value === 'tailor' || value === 'merchant';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function passwordProblem(password: string): string | undefined {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (password.length > 72) return 'Use at most 72 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Include at least one letter and one number.';
  return undefined;
}

export function PasswordInput({
  value,
  onChange,
  className,
  autoComplete,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  className: string;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${className} pr-12`}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        required
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#64748B] hover:text-[#F8FAFC]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </span>
  );
}

export default function SignUpForm({ initialRole, next }: { initialRole?: string; next?: string }) {
  const router = useRouter();
  const { status, user } = useAuth();
  // Optional intent from a "join as…" link; otherwise they choose a path after verifying.
  const intent = isRole(initialRole) ? initialRole : undefined;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState('');

  // Already signed in: there is nothing to sign up for.
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.replace(landingAfterAuth(user, next, ROLE_HOME[user.role as SelfServiceRole]));
    }
  }, [status, user, next, router]);

  const errors = {
    fullName: fullName.trim().length < 2 ? 'Enter your full name.' : undefined,
    email: !EMAIL_RE.test(email.trim()) ? 'Enter a valid email address.' : undefined,
    password: passwordProblem(password),
  };
  const show = (field: keyof typeof errors) => (touched ? errors[field] : undefined);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    setError('');
    setExisting('');
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const { email: registered } = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: intent,
      });
      rememberAccount();
      const params = new URLSearchParams({ email: registered, next: safeNext(next, intent ? ROLE_HOME[intent] : '/onboarding') });
      router.push(`/verify-email?${params}`);
    } catch (err) {
      if (apiErrorCode(err) === 'ACCOUNT_EXISTS') {
        rememberAccount();
        setExisting(email.trim().toLowerCase());
      } else {
        setError(apiErrorMessage(err));
      }
      setSubmitting(false);
    }
  }

  const signInQuery = (withEmail?: string) => {
    const params = new URLSearchParams();
    if (next) params.set('next', next);
    if (withEmail) params.set('email', withEmail);
    const qs = params.toString();
    return `/signin${qs ? `?${qs}` : ''}`;
  };
  const signInHref = signInQuery();

  return (
    <AuthShell
      kicker="Create your account"
      title={
        <>
          Join the <span className="text-[#00A3FF]">atelier.</span>
        </>
      }
      subtitle={
        intent
          ? `Just your account first. ${NEXT_STEP[intent]}`
          : 'Just your account first. We’ll email you a 6-digit code, then you choose how you’ll use AfroCouture.'
      }
      footer={
        <>
          Already have an account?{' '}
          <Link href={signInHref} className="font-semibold text-[#38BDF8] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <AuthField label="Full name" error={show('fullName')}>
          {(props) => (
            <input
              {...props}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              required
            />
          )}
        </AuthField>

        <AuthField label="Email" error={show('email')}>
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

        <AuthField label="Password" error={show('password')} hint="At least 8 characters, with a letter and a number.">
          {({ className, ...rest }) => (
            <PasswordInput
              value={password}
              onChange={setPassword}
              className={className}
              autoComplete="new-password"
              invalid={rest['aria-invalid']}
            />
          )}
        </AuthField>

        {existing && (
          <FormAlert tone="info">
            <p className="font-semibold text-[#F8FAFC]">You already have an account with this email.</p>
            <p className="mt-1">Sign in to pick up where you left off — your progress is saved.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={signInQuery(existing)} className="btn-primary px-4 py-2">
                Sign in <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link href={`/forgot-password?${new URLSearchParams({ email: existing })}`} className="btn-ghost px-4 py-2">
                Forgot password?
              </Link>
            </div>
          </FormAlert>
        )}
        {error && <FormAlert>{error}</FormAlert>}

        <button type="submit" className="btn-primary w-full justify-center py-3.5" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Creating your account…
            </>
          ) : (
            <>
              Create account <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-center text-xs leading-5 text-[#64748B]">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-[#94A3B8] underline underline-offset-2 hover:text-[#38BDF8]">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#94A3B8] underline underline-offset-2 hover:text-[#38BDF8]">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
