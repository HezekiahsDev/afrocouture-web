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
            className="mb-10 inline-flex items-center gap-2 text-xs font-bold text-[#6B655C] hover:text-[#B8734E]"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back to discover
          </Link>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8F5637]">{kicker}</p>
          <h1 className="text-[30px] font-extrabold leading-[38px] text-[#171717] sm:text-[36px] sm:leading-[44px]">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-sm leading-6 text-[#6B655C]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-[#171717]/10 pt-6 text-sm text-[#6B655C]">{footer}</div>}
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/55 to-transparent" />
        <div className="absolute inset-x-12 bottom-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#E3B394]">Made by hand, fitted to you</p>
          <p className="mt-3 max-w-sm text-2xl font-medium leading-snug text-[#FFFDF8]">
            Commission verified artisans and source fabric you can trust.
          </p>
        </div>
      </aside>
    </div>
  );
}

const fieldBase =
  'w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 px-4 py-3 text-sm text-[#171717] outline-none transition placeholder:text-[#6B655C] focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)] disabled:opacity-60';

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
      <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
        {label}
        {action}
      </span>
      {children({
        className: `${fieldBase} ${error ? 'border-[#9B2C24]/60' : ''}`,
        'aria-invalid': error ? true : undefined,
      })}
      {error ? (
        <span className="text-xs text-[#9B2C24]">{error}</span>
      ) : (
        hint && <span className="text-[11px] text-[#6B655C]">{hint}</span>
      )}
    </label>
  );
}

export function FormAlert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-[#9B2C24]/30 bg-[#F6E3E0]/20 text-[#7A1F1A]',
    info: 'border-[#B8734E]/30 bg-[#B8734E]/10 text-[#5C3B29]',
    success: 'border-[#2F6B4F]/30 bg-[#2F6B4F]/10 text-[#2F6B4F]',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </div>
  );
}
