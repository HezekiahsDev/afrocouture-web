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
    neutral: 'border-[#171717]/12 bg-[#171717]/5 text-[#4B453E]',
    blue: 'border-[#B8734E]/30 bg-[#B8734E]/15 text-[#7A4429]',
    green: 'border-[#2F6B4F]/30 bg-[#2F6B4F]/15 text-[#2F6B4F]',
    amber: 'border-[#B8734E]/30 bg-[#B8734E]/15 text-[#7A4429]',
    red: 'border-[#9B2C24]/30 bg-[#F6E3E0]/30 text-[#9B2C24]',
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
              ? 'border-[#B8734E] bg-[#9E5B37] text-[#FFFDF8]'
              : 'border-[#171717]/12 text-[#6B655C] hover:border-[#B8734E]/50 hover:text-[#171717]',
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
          <dt className="text-xs font-semibold text-[#6B655C] sm:pt-0.5">{label}</dt>
          <dd className="mb-1 min-w-0 break-words text-[#171717] sm:mb-0">{value === null || value === undefined || value === '' ? '—' : value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Inline preview for images; a link for PDFs and anything else. */
export function DocumentPreview({ url, label }: { url: string | null | undefined; label: string }) {
  if (!url) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-[#171717]/12 text-xs text-[#6B655C]">
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
        className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-[#171717]/12 bg-[#FFFFFF] text-sm font-semibold text-[#8F5637] hover:border-[#B8734E]/50"
      >
        <FileText size={28} aria-hidden="true" />
        Open document <span className="sr-only">({label})</span>
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group relative block h-36 overflow-hidden rounded-xl border border-[#171717]/12 bg-[#FFFFFF]">
      <Image src={url} alt={label} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover transition group-hover:scale-[1.02]" />
      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-[#F5F0E8]/80 px-2 py-1 text-[11px] font-semibold text-[#171717]">
        <ExternalLink size={12} aria-hidden="true" /> Full size
      </span>
    </a>
  );
}

export function Panel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#6B655C]">{title}</h2>
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
        tone === 'error' ? 'border-[#9B2C24]/30 bg-[#F6E3E0]/20 text-[#7A1F1A]' : 'border-[#2F6B4F]/30 bg-[#2F6B4F]/10 text-[#2F6B4F]',
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
    <nav className="flex items-center justify-between gap-3 text-sm text-[#6B655C]" aria-label="Pages">
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
      <Search size={15} className="pointer-events-none absolute left-3 text-[#6B655C]" aria-hidden="true" />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 py-2 pl-9 pr-3 text-sm text-[#171717] outline-none placeholder:text-[#6B655C] focus:border-[#B8734E]"
      />
    </label>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-12 text-[#6B655C]" role="status">
      <LoaderCircle className="animate-spin" size={24} aria-label={label} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-[#171717]/15 py-12 text-center text-sm text-[#6B655C]">{children}</p>;
}
