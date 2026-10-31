'use client';

import { useState, type ReactNode } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { MILESTONES, ORDER_STATUS_LABEL } from '@/lib/orders';
import { apiErrorMessage } from '@/lib/api';
import { naira } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { OrderMilestone, OrderStatus } from '@/types';

export const card =
  'rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-5 backdrop-blur-xl sm:p-6';
export const fieldClass =
  'w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 px-4 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-[#6B655C] focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)] disabled:opacity-60';
export const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-[#6B655C]';
export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#9E5B37] px-5 py-3 text-sm font-semibold text-[#F5F0E8] shadow-[0_4px_14px_rgba(23,23,23,0.16)] transition hover:bg-[#8F5637] disabled:cursor-not-allowed disabled:opacity-60';
export const ghostButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#171717]/15 bg-[#FFFFFF]/60 px-4 py-2.5 text-sm font-semibold text-[#171717] transition hover:border-[#B8734E]/40 disabled:cursor-not-allowed disabled:opacity-60';
export const dangerButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#9B2C24]/30 px-4 py-2.5 text-sm font-semibold text-[#9B2C24] transition hover:bg-[#F6E3E0]/20 disabled:cursor-not-allowed disabled:opacity-60';

const STATUS_TONE: Record<OrderStatus, string> = {
  requested: 'border-[#B8734E]/40 bg-[#B8734E]/10 text-[#8A6A1F]',
  quoted: 'border-[#B8734E]/40 bg-[#B8734E]/10 text-[#8F5637]',
  declined: 'border-[#171717]/15 bg-[#171717]/5 text-[#6B655C]',
  cancelled: 'border-[#171717]/15 bg-[#171717]/5 text-[#6B655C]',
  paid: 'border-[#2F6B4F]/40 bg-[#2F6B4F]/10 text-[#2F6B4F]',
  in_progress: 'border-[#1F2A42]/40 bg-[#1F2A42]/10 text-[#1F2A42]',
  delivered: 'border-[#B8734E]/40 bg-[#B8734E]/10 text-[#8F5637]',
  completed: 'border-[#2F6B4F]/40 bg-[#2F6B4F]/10 text-[#2F6B4F]',
  disputed: 'border-[#9B2C24]/40 bg-[#F6E3E0]/20 text-[#9B2C24]',
  refunded: 'border-[#171717]/15 bg-[#171717]/5 text-[#6B655C]',
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]',
        STATUS_TONE[status],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export const formatDate = (value: string | null | undefined, withTime = false) => {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
};

/**
 * The four production steps (DESIGN.md "Status Pipelines"). Before payment the
 * order is still being agreed, so the tracker shows that stage instead.
 */
export function OrderTracker({ status, milestone }: { status: OrderStatus; milestone: OrderMilestone }) {
  const prePayment = status === 'requested' || status === 'quoted';
  const steps = prePayment
    ? [
        { id: 'requested', label: 'Request sent' },
        { id: 'quoted', label: 'Quote' },
        { id: 'paid', label: 'Payment' },
        { id: 'production', label: 'Production' },
      ]
    : MILESTONES;
  const currentIndex = prePayment
    ? status === 'requested'
      ? 0
      : 1
    : MILESTONES.findIndex((m) => m.id === milestone);
  const allDone = status === 'delivered' || status === 'completed';

  return (
    <ol className="relative grid grid-cols-4 gap-1" aria-label="Order progress">
      {steps.map((step, index) => {
        const done = allDone || index < currentIndex;
        const active = !allDone && index === currentIndex;
        return (
          <li key={step.id} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute right-1/2 top-[17px] h-0.5 w-full -translate-y-1/2',
                  done || active ? 'bg-[#B8734E]' : 'bg-[#171717]/10',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold',
                done && 'border-[#B8734E] bg-[#9E5B37] text-[#FFFDF8] shadow-[0_0_12px_rgba(184,115,78,0.5)]',
                active && 'border-[#B8734E] bg-[#B8734E]/20 text-[#171717] shadow-[0_0_0_3px_rgba(184,115,78,0.35)]',
                !done && !active && 'border-[#171717]/20 bg-[#FFFFFF] text-[#6B655C]',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check size={16} aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-[11px] font-semibold leading-tight sm:text-xs',
                done || active ? 'text-[#171717]' : 'text-[#6B655C]',
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SectionCard({
  title,
  kicker,
  action,
  children,
  className,
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(card, className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {kicker && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8F5637]">{kicker}</p>}
          <h2 className="text-lg font-bold text-[#171717]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MoneyRow({
  label,
  amount,
  strong,
  hint,
}: {
  label: ReactNode;
  amount: number;
  strong?: boolean;
  hint?: string;
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 py-1.5', strong && 'border-t border-[#171717]/10 pt-3')}>
      <span className={cn('text-sm', strong ? 'font-semibold text-[#171717]' : 'text-[#6B655C]')}>
        {label}
        {hint && <small className="block text-[11px] text-[#6B655C]">{hint}</small>}
      </span>
      <span
        className={cn(
          'font-[family-name:var(--font-inter)] tabular-nums',
          strong ? 'text-lg font-bold text-[#B8734E]' : 'text-sm text-[#171717]',
        )}
      >
        {naira(amount)}
      </span>
    </div>
  );
}

export function InlineAlert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-[#9B2C24]/30 bg-[#F6E3E0]/20 text-[#7A1F1A]',
    info: 'border-[#B8734E]/30 bg-[#B8734E]/10 text-[#5C3B29]',
    success: 'border-[#2F6B4F]/30 bg-[#2F6B4F]/10 text-[#2F6B4F]',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm', styles[tone])}>
      {children}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return <LoaderCircle size={16} className="animate-spin" aria-label={label} aria-hidden={label ? undefined : true} />;
}

/** Runs an order action with a busy flag and a readable error. */
export function useAction() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  async function run<T>(name: string, fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(name);
    setError('');
    try {
      return await fn();
    } catch (err) {
      setError(apiErrorMessage(err));
      return undefined;
    } finally {
      setBusy(null);
    }
  }
  return { busy, error, setError, run };
}
