'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Banknote, EyeOff, Scale } from 'lucide-react';
import { getOverview } from '@/lib/admin';
import { useRemote, ErrorState } from '@/components/marketplace/shared';
import { Spinner } from '@/components/orders/ui';
import { cn } from '@/lib/utils';
import type { AdminOverview } from '@/types/admin';
import type { OrderStatus } from '@/types';
import { AdminHeading } from './AdminShell';
import { Chips, naira } from './ui';

const STATUS_LABEL: Record<OrderStatus, string> = {
  requested: 'Requested',
  quoted: 'Quoted',
  paid: 'Paid',
  in_progress: 'In production',
  delivered: 'Delivered',
  completed: 'Completed',
  disputed: 'Disputed',
  refunded: 'Refunded',
  declined: 'Declined',
  cancelled: 'Cancelled',
};
const ROLE_LABEL = { customer: 'Customers', tailor: 'Artisans', merchant: 'Merchants', admin: 'Admins' } as const;
const card = 'rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-5';

export function OverviewDashboard() {
  const { result, retry } = useRemote(getOverview, []);
  return (
    <>
      <AdminHeading kicker="Admin" title="Overview" />
      {result.state === 'loading' && (
        <div className="flex justify-center py-24 text-[#94A3B8]" role="status">
          <Spinner label="Loading overview" />
        </div>
      )}
      {result.state === 'error' && <ErrorState message={result.message} onRetry={retry} />}
      {result.state === 'ready' && <Dashboard data={result.data} />}
    </>
  );
}

function Dashboard({ data }: { data: AdminOverview }) {
  const { money, queues, users, orders, reviews } = data;
  const queueCards = [
    { label: 'Verifications waiting', value: queues.pendingVerifications, href: '/admin/verifications', icon: BadgeCheck, urgent: false },
    { label: 'Open disputes', value: queues.openDisputes, href: '/admin/orders?status=disputed', icon: Scale, urgent: true },
    { label: 'Failed payouts', value: queues.failedPayouts, href: '/admin/payouts', icon: Banknote, urgent: true },
    { label: 'Hidden reviews', value: queues.hiddenReviews, href: '/admin/reviews', icon: EyeOff, urgent: false },
  ];
  const statusRows = (Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => ({ status: s, count: orders.byStatus[s] ?? 0 }));
  const maxStatus = Math.max(1, ...statusRows.map((r) => r.count));

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="queues-heading">
        <h2 id="queues-heading" className="sr-only">Needs attention</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {queueCards.map(({ label, value, href, icon: Icon, urgent }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                card,
                'group flex items-center gap-4 transition-colors hover:border-[#00A3FF]/40',
                urgent && value > 0 && 'border-[#ffb4ab]/30',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-xl',
                  urgent && value > 0 ? 'bg-[#93000a]/30 text-[#ffb4ab]' : 'bg-[#00A3FF]/10 text-[#38BDF8]',
                )}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-2xl font-extrabold tabular-nums text-[#F8FAFC]">{value}</span>
                <span className="block text-xs text-[#94A3B8]">{label}</span>
              </span>
              <ArrowRight size={16} className="text-[#64748B] transition group-hover:translate-x-0.5 group-hover:text-[#38BDF8]" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="money-heading" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <h2 id="money-heading" className="sr-only">Money</h2>
        <Stat label="Gross order value" value={naira(money.gmv)} hint="All paid orders" />
        <Stat label="Platform fees earned" value={naira(money.platformFees)} hint="Completed orders" />
        <Stat label="Held in escrow" value={naira(money.escrowHeld)} hint="Owed to artisans & merchants" />
        <Stat
          label="Refunded"
          value={naira(money.refunded)}
          hint={money.failedPayouts.count ? `${money.failedPayouts.count} failed payouts · ${naira(money.failedPayouts.amount)}` : 'No failed payouts'}
        />
      </section>

      <TrendChart days={orders.last30d} />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={card} aria-labelledby="status-heading">
          <h2 id="status-heading" className="mb-4 text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Orders by status <span className="ml-1 font-normal normal-case tracking-normal text-[#64748B]">· {orders.total} total</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {statusRows.map(({ status, count }) => (
              <li key={status}>
                <Link href={`/admin/orders?status=${status}`} className="grid grid-cols-[110px_minmax(0,1fr)_36px] items-center gap-3 text-xs hover:text-[#F8FAFC]">
                  <span className="text-[#CBD5E1]">{STATUS_LABEL[status]}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <span className="block h-full rounded-full bg-[#00A3FF]" style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-[#F8FAFC]">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={card} aria-labelledby="users-heading">
          <h2 id="users-heading" className="mb-4 text-sm font-bold uppercase tracking-wider text-[#94A3B8]">People</h2>
          <p className="text-3xl font-extrabold tabular-nums text-[#F8FAFC]">{users.total}</p>
          <p className="mb-4 text-xs text-[#94A3B8]">
            {users.newLast7d} joined in the last 7 days · {users.suspended} suspended
          </p>
          <dl className="grid grid-cols-2 gap-3">
            {(Object.keys(ROLE_LABEL) as (keyof typeof ROLE_LABEL)[]).map((role) => (
              <Link key={role} href={`/admin/users?role=${role}`} className="rounded-xl bg-white/[0.03] p-3 hover:bg-white/[0.06]">
                <dt className="text-xs text-[#94A3B8]">{ROLE_LABEL[role]}</dt>
                <dd className="text-lg font-bold tabular-nums text-[#F8FAFC]">{users.byRole[role] ?? 0}</dd>
              </Link>
            ))}
          </dl>
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-xs text-[#94A3B8]">Reviews</p>
            <p className="text-sm text-[#F8FAFC]">
              {reviews.count} visible · average {reviews.average?.toFixed(1) ?? '—'} · {reviews.last7d} this week
            </p>
          </div>
        </section>

        <section className={card} aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="mb-4 text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-[#64748B]">No order activity yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {data.recentActivity.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/orders/${e.orderId}`} className="block rounded-lg hover:bg-white/[0.03]">
                    <span className="block text-sm text-[#E2E8F0]">{e.label}</span>
                    <span className="block text-[11px] text-[#64748B]">
                      <span className="font-mono">{e.reference}</span> ·{' '}
                      {new Date(e.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={card}>
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#F8FAFC]">{value}</p>
      <p className="mt-1 text-[11px] text-[#64748B]">{hint}</p>
    </div>
  );
}

/** Last 30 days, one measure at a time (orders or GMV) — never two scales on one axis. */
function TrendChart({ days }: { days: AdminOverview['orders']['last30d'] }) {
  const [measure, setMeasure] = useState<'count' | 'gmv'>('gmv');
  const [hover, setHover] = useState<number | null>(null);
  const values = days.map((d) => d[measure]);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  const fmt = (v: number) => (measure === 'gmv' ? naira(v) : `${v} order${v === 1 ? '' : 's'}`);
  const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  const W = 600, H = 160, gap = 2;
  const barW = W / days.length - gap;
  const shown = hover ?? null;

  return (
    <section className={card} aria-labelledby="trend-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="trend-heading" className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            {measure === 'gmv' ? 'Paid order value' : 'New orders'}, last 30 days
          </h2>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-[#F8FAFC]">
            {shown === null ? fmt(total) : fmt(values[shown])}
            <span className="ml-2 text-xs font-normal text-[#64748B]">{shown === null ? '30-day total' : dayLabel(days[shown].date)}</span>
          </p>
        </div>
        <Chips
          label="Measure"
          value={measure}
          onChange={setMeasure}
          options={[
            { value: 'gmv', label: 'Value' },
            { value: 'count', label: 'Orders' },
          ]}
        />
      </div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="h-auto w-full" role="img" aria-label={`${measure === 'gmv' ? 'Paid order value' : 'New orders'} per day; table below`} onMouseLeave={() => setHover(null)}>
        <line x1="0" x2={W} y1={H} y2={H} stroke="rgba(255,255,255,0.1)" />
        {days.map((d, i) => {
          const h = values[i] ? Math.max(3, (values[i] / max) * (H - 8)) : 0;
          const x = i * (barW + gap);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1}>
              {/* Hit target taller than the bar. */}
              <rect x={x} y={0} width={barW + gap} height={H} fill="transparent" />
              {h > 0 && <path d={`M${x},${H} v${-(h - 4)} q0,-4 4,-4 h${barW - 8} q4,0 4,4 v${h - 4} z`} fill={hover === i ? '#38BDF8' : '#00A3FF'} />}
              <title>{`${dayLabel(d.date)}: ${fmt(values[i])}`}</title>
            </g>
          );
        })}
        <text x="0" y={H + 14} fill="#64748B" fontSize="10">{dayLabel(days[0]?.date ?? '')}</text>
        <text x={W} y={H + 14} fill="#64748B" fontSize="10" textAnchor="end">{dayLabel(days[days.length - 1]?.date ?? '')}</text>
      </svg>
      <details className="mt-3 text-xs text-[#94A3B8]">
        <summary className="cursor-pointer select-none">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-[#64748B]">
              <th className="py-1 font-semibold">Day</th>
              <th className="py-1 text-right font-semibold">Orders</th>
              <th className="py-1 text-right font-semibold">Paid value</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t border-white/[0.04]">
                <td className="py-1">{dayLabel(d.date)}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
                <td className="py-1 text-right tabular-nums">{naira(d.gmv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
