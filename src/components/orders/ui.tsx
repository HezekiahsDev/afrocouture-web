'use client';

import { useState, type ReactNode } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { MILESTONES, ORDER_STATUS_LABEL } from '@/lib/orders';
import { apiErrorMessage } from '@/lib/api';
import { naira } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { OrderMilestone, OrderStatus } from '@/types';

export const card =
  'rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-5 backdrop-blur-xl sm:p-6';
export const fieldClass =
  'w-full rounded-xl border border-white/10 bg-[#0F172A]/80 px-4 py-2.5 text-sm text-[#F8FAFC] outline-none transition placeholder:text-[#64748B] focus:border-[#00A3FF] focus:shadow-[0_0_0_3px_rgba(0,163,255,0.15)] disabled:opacity-60';
export const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]';
export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-5 py-3 text-sm font-semibold text-[#090D16] shadow-[0_4px_14px_rgba(0,163,255,0.4)] transition hover:bg-[#38BDF8] disabled:cursor-not-allowed disabled:opacity-60';
export const ghostButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-[#0F172A]/60 px-4 py-2.5 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#00A3FF]/40 disabled:cursor-not-allowed disabled:opacity-60';
export const dangerButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#ffb4ab]/30 px-4 py-2.5 text-sm font-semibold text-[#ffb4ab] transition hover:bg-[#93000a]/20 disabled:cursor-not-allowed disabled:opacity-60';

const STATUS_TONE: Record<OrderStatus, string> = {
  requested: 'border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#fcd34d]',
  quoted: 'border-[#00A3FF]/40 bg-[#00A3FF]/10 text-[#38BDF8]',
  declined: 'border-white/15 bg-white/5 text-[#94A3B8]',
  cancelled: 'border-white/15 bg-white/5 text-[#94A3B8]',
  paid: 'border-[#10B981]/40 bg-[#10B981]/10 text-[#34d399]',
  in_progress: 'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#22D3EE]',
  delivered: 'border-[#00A3FF]/40 bg-[#00A3FF]/10 text-[#38BDF8]',
  completed: 'border-[#10B981]/40 bg-[#10B981]/10 text-[#34d399]',
  disputed: 'border-[#ffb4ab]/40 bg-[#93000a]/20 text-[#ffb4ab]',
  refunded: 'border-white/15 bg-white/5 text-[#94A3B8]',
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
                  done || active ? 'bg-[#00A3FF]' : 'bg-white/10',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold',
                done && 'border-[#00A3FF] bg-[#00A3FF] text-[#090D16] shadow-[0_0_12px_rgba(0,163,255,0.5)]',
                active && 'border-[#00A3FF] bg-[#00A3FF]/20 text-[#F8FAFC] shadow-[0_0_0_3px_rgba(34,211,238,0.35)]',
                !done && !active && 'border-white/20 bg-[#0F172A] text-[#64748B]',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check size={16} aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-[11px] font-semibold leading-tight sm:text-xs',
                done || active ? 'text-[#F8FAFC]' : 'text-[#64748B]',
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
          {kicker && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#38BDF8]">{kicker}</p>}
          <h2 className="text-lg font-bold text-[#F8FAFC]">{title}</h2>
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
    <div className={cn('flex items-baseline justify-between gap-3 py-1.5', strong && 'border-t border-white/[0.08] pt-3')}>
      <span className={cn('text-sm', strong ? 'font-semibold text-[#F8FAFC]' : 'text-[#94A3B8]')}>
        {label}
        {hint && <small className="block text-[11px] text-[#64748B]">{hint}</small>}
      </span>
      <span
        className={cn(
          'font-[family-name:var(--font-inter)] tabular-nums',
          strong ? 'text-lg font-bold text-[#00A3FF]' : 'text-sm text-[#F8FAFC]',
        )}
      >
        {naira(amount)}
      </span>
    </div>
  );
}

export function InlineAlert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-[#ffb4ab]/30 bg-[#93000a]/20 text-[#ffdad6]',
    info: 'border-[#00A3FF]/30 bg-[#00A3FF]/10 text-[#cfe5ff]',
    success: 'border-[#10B981]/30 bg-[#10B981]/10 text-[#a7f3d0]',
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
