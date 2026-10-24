'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LoaderCircle, Scissors, ShoppingBag, Sparkles } from 'lucide-react';
import { AuthField, AuthShell, FormAlert } from './AuthShell';
import { useAuth } from './AuthProvider';
import { register, ROLE_HOME, safeNext } from '@/lib/auth';
import { landingFor } from '@/lib/access';
import { apiErrorMessage } from '@/lib/api';
import type { SelfServiceRole } from '@/types';

const ROLES: { id: SelfServiceRole; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'customer', label: 'Customer', icon: ShoppingBag },
  { id: 'tailor', label: 'Artisan', icon: Scissors },
  { id: 'merchant', label: 'Merchant', icon: Sparkles },
];

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
  const [role, setRole] = useState<SelfServiceRole>(
    ROLES.some((r) => r.id === initialRole) ? (initialRole as SelfServiceRole) : 'customer',
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already signed in: there is nothing to sign up for.
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.replace(landingFor(user.role, next, ROLE_HOME[user.role as SelfServiceRole]));
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
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const { email: registered } = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
      });
      const params = new URLSearchParams({ email: registered, next: safeNext(next, ROLE_HOME[role]) });
      router.push(`/verify-email?${params}`);
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  }

  const signInHref = `/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  return (
    <AuthShell
      kicker="Create your account"
      title={
        <>
          Join the <span className="text-[#00A3FF]">atelier.</span>
        </>
      }
      subtitle="We'll email you a 6-digit code to confirm it's really you."
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
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">I am joining as</legend>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                aria-pressed={role === id}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                  role === id
                    ? 'border-[#00A3FF] bg-[#00A3FF]/10 text-[#F8FAFC] shadow-[0_0_20px_-6px_rgba(0,163,255,0.5)]'
                    : 'border-white/10 bg-[#0F172A]/60 text-[#94A3B8] hover:border-white/20'
                }`}
              >
                <Icon size={18} className={role === id ? 'text-[#00A3FF]' : ''} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

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
