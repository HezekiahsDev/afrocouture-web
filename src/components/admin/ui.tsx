'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ExternalLink, FileText, LoaderCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const naira = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `₦${n.toLocaleString('en-NG')}`);

const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);

export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red'; children: ReactNode }) {
  const tones = {
    neutral: 'border-white/10 bg-white/5 text-[#CBD5E1]',
    blue: 'border-[#00A3FF]/30 bg-[#00A3FF]/15 text-[#38BDF8]',
    green: 'border-[#10B981]/30 bg-[#10B981]/15 text-[#34d399]',
    amber: 'border-[#FBBF24]/30 bg-[#FBBF24]/15 text-[#fbbf24]',
    red: 'border-[#ffb4ab]/30 bg-[#93000a]/30 text-[#ffb4ab]',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', tones[tone])}>
      {children}
    </span>
  );
}

export function Chips<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            value === o.value
              ? 'border-[#00A3FF] bg-[#00A3FF] text-[#090D16]'
              : 'border-white/10 text-[#94A3B8] hover:border-white/25 hover:text-[#F8FAFC]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Label/value rows; empty values show a dash. */
export function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[160px_minmax(0,1fr)]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-xs font-semibold text-[#94A3B8] sm:pt-0.5">{label}</dt>
          <dd className="mb-1 min-w-0 break-words text-[#F8FAFC] sm:mb-0">{value === null || value === undefined || value === '' ? '—' : value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Inline preview for images; a link for PDFs and anything else. */
export function DocumentPreview({ url, label }: { url: string | null | undefined; label: string }) {
  if (!url) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-[#64748B]">
        No {label.toLowerCase()} provided
      </div>
    );
  }
  if (isPdf(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1E293B] text-sm font-semibold text-[#38BDF8] hover:border-[#00A3FF]/50"
      >
        <FileText size={28} aria-hidden="true" />
        Open document <span className="sr-only">({label})</span>
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group relative block h-36 overflow-hidden rounded-xl border border-white/10 bg-[#1E293B]">
      <Image src={url} alt={label} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover transition group-hover:scale-[1.02]" />
      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-[#090D16]/80 px-2 py-1 text-[11px] font-semibold text-[#F8FAFC]">
        <ExternalLink size={12} aria-hidden="true" /> Full size
      </span>
    </a>
  );
}

export function Panel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success'; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        tone === 'error' ? 'border-[#ffb4ab]/30 bg-[#93000a]/20 text-[#ffdad6]' : 'border-[#10B981]/30 bg-[#10B981]/10 text-[#a7f3d0]',
      )}
    >
      {children}
    </p>
  );
}

export function Pager({ page, limit, total, onPage }: { page: number; limit: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;
  return (
    <nav className="flex items-center justify-between gap-3 text-sm text-[#94A3B8]" aria-label="Pages">
      <span>
        {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <span className="flex gap-2">
        <button type="button" className="btn-ghost px-3 py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button type="button" className="btn-ghost px-3 py-1.5" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </span>
    </nav>
  );
}

/** Search box that reports its value after typing pauses. */
export function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (draft === value) return;
    const t = setTimeout(() => onChange(draft.trim()), 300);
    return () => clearTimeout(t);
  }, [draft, value, onChange]);
  return (
    <label className="relative flex min-w-[220px] flex-1 items-center sm:max-w-sm">
      <span className="sr-only">{label}</span>
      <Search size={15} className="pointer-events-none absolute left-3 text-[#64748B]" aria-hidden="true" />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0F172A]/80 py-2 pl-9 pr-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#00A3FF]"
      />
    </label>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-12 text-[#94A3B8]" role="status">
      <LoaderCircle className="animate-spin" size={24} aria-label={label} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-sm text-[#94A3B8]">{children}</p>;
}
