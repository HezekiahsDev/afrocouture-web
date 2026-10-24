import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Two-column frame for the account pages: form on the left, editorial image on the right. */
export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-80px)] w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="flex flex-col px-4 py-10 sm:px-10 lg:justify-center lg:px-16">
        <div className="mx-auto w-full max-w-[440px]">
          <Link
            href="/marketplace"
            className="mb-10 inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#00A3FF]"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back to discover
          </Link>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#38BDF8]">{kicker}</p>
          <h1 className="text-[30px] font-extrabold leading-[38px] text-[#F8FAFC] sm:text-[36px] sm:leading-[44px]">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-white/[0.08] pt-6 text-sm text-[#94A3B8]">{footer}</div>}
        </div>
      </section>
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/embroidery-hands-v2.webp"
          alt="An artisan's hands stitching gold embroidery into royal blue fabric"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/30 to-transparent" />
        <div className="absolute inset-x-12 bottom-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#38BDF8]">Made by hand, fitted to you</p>
          <p className="mt-3 max-w-sm text-2xl font-bold leading-snug text-[#F8FAFC]">
            Commission verified artisans and source fabric you can trust.
          </p>
        </div>
      </aside>
    </div>
  );
}

const fieldBase =
  'w-full rounded-xl border border-white/10 bg-[#0F172A]/80 px-4 py-3 text-sm text-[#F8FAFC] outline-none transition placeholder:text-[#64748B] focus:border-[#00A3FF] focus:shadow-[0_0_0_3px_rgba(0,163,255,0.15)] disabled:opacity-60';

export function AuthField({
  label,
  error,
  hint,
  action,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  action?: ReactNode;
  children: (props: { className: string; 'aria-invalid'?: boolean }) => ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
        {action}
      </span>
      {children({
        className: `${fieldBase} ${error ? 'border-[#ffb4ab]/60' : ''}`,
        'aria-invalid': error ? true : undefined,
      })}
      {error ? (
        <span className="text-xs text-[#ffb4ab]">{error}</span>
      ) : (
        hint && <span className="text-[11px] text-[#64748B]">{hint}</span>
      )}
    </label>
  );
}

export function FormAlert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-[#ffb4ab]/30 bg-[#93000a]/20 text-[#ffdad6]',
    info: 'border-[#00A3FF]/30 bg-[#00A3FF]/10 text-[#cfe5ff]',
    success: 'border-[#10B981]/30 bg-[#10B981]/10 text-[#a7f3d0]',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </div>
  );
}
