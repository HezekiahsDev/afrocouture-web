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
const card = 'rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-5';

export function OverviewDashboard() {
  const { result, retry } = useRemote(getOverview, []);
  return (
    <>
      <AdminHeading kicker="Admin" title="Overview" />
      {result.state === 'loading' && (
        <div className="flex justify-center py-24 text-[#6B655C]" role="status">
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
                'group flex items-center gap-4 transition-colors hover:border-[#B8734E]/40',
                urgent && value > 0 && 'border-[#9B2C24]/30',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-xl',
                  urgent && value > 0 ? 'bg-[#F6E3E0]/30 text-[#9B2C24]' : 'bg-[#B8734E]/10 text-[#7A4429]',
                )}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-2xl font-extrabold tabular-nums text-[#171717]">{value}</span>
                <span className="block text-xs text-[#6B655C]">{label}</span>
              </span>
              <ArrowRight size={16} className="text-[#6B655C] transition group-hover:translate-x-0.5 group-hover:text-[#8F5637]" aria-hidden="true" />
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
          <h2 id="status-heading" className="mb-4 text-sm font-bold uppercase tracking-wider text-[#6B655C]">
            Orders by status <span className="ml-1 font-normal normal-case tracking-normal text-[#6B655C]">· {orders.total} total</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {statusRows.map(({ status, count }) => (
              <li key={status}>
                <Link href={`/admin/orders?status=${status}`} className="grid grid-cols-[110px_minmax(0,1fr)_36px] items-center gap-3 text-xs hover:text-[#171717]">
                  <span className="text-[#4B453E]">{STATUS_LABEL[status]}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-[#171717]/5">
                    <span className="block h-full rounded-full bg-[#B8734E]" style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-[#171717]">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={card} aria-labelledby="users-heading">
          <h2 id="users-heading" className="mb-4 text-sm font-bold uppercase tracking-wider text-[#6B655C]">People</h2>
          <p className="text-3xl font-extrabold tabular-nums text-[#171717]">{users.total}</p>
          <p className="mb-4 text-xs text-[#6B655C]">
            {users.newLast7d} joined in the last 7 days · {users.suspended} suspended
          </p>
          <dl className="grid grid-cols-2 gap-3">
            {(Object.keys(ROLE_LABEL) as (keyof typeof ROLE_LABEL)[]).map((role) => (
              <Link key={role} href={`/admin/users?role=${role}`} className="rounded-xl bg-[#171717]/3 p-3 hover:bg-[#171717]/6">
                <dt className="text-xs text-[#6B655C]">{ROLE_LABEL[role]}</dt>
                <dd className="text-lg font-bold tabular-nums text-[#171717]">{users.byRole[role] ?? 0}</dd>
              </Link>
            ))}
          </dl>
          <div className="mt-4 border-t border-[#171717]/8 pt-4">
            <p className="text-xs text-[#6B655C]">Reviews</p>
            <p className="text-sm text-[#171717]">
              {reviews.count} visible · average {reviews.average?.toFixed(1) ?? '—'} · {reviews.last7d} this week
            </p>
          </div>
        </section>

        <section className={card} aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="mb-4 text-sm font-bold uppercase tracking-wider text-[#6B655C]">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-[#6B655C]">No order activity yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {data.recentActivity.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/orders/${e.orderId}`} className="block rounded-lg hover:bg-[#171717]/3">
                    <span className="block text-sm text-[#2A2622]">{e.label}</span>
                    <span className="block text-[11px] text-[#6B655C]">
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
      <p className="text-xs text-[#6B655C]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#171717]">{value}</p>
      <p className="mt-1 text-[11px] text-[#6B655C]">{hint}</p>
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
  const W = 600, H = 160, gap = 4;
  const barW = W / days.length - gap;
  const shown = hover ?? null;

  return (
    <section className={card} aria-labelledby="trend-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="trend-heading" className="text-sm font-bold uppercase tracking-wider text-[#6B655C]">
            {measure === 'gmv' ? 'Paid order value' : 'New orders'}, last 30 days
          </h2>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-[#171717]">
            {shown === null ? fmt(total) : fmt(values[shown])}
            <span className="ml-2 text-xs font-normal text-[#6B655C]">{shown === null ? '30-day total' : dayLabel(days[shown].date)}</span>
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
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label={`${measure === 'gmv' ? 'Paid order value' : 'New orders'} per day; table below`}
        onMouseLeave={() => setHover(null)}
      >
        <line x1="0" x2={W} y1={H} y2={H} stroke="rgba(255,255,255,0.1)" vectorEffect="non-scaling-stroke" />
        {days.map((d, i) => {
          const h = values[i] ? Math.max(3, (values[i] / max) * (H - 8)) : 0;
          const x = i * (barW + gap);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              {/* Hit target taller than the bar. */}
              <rect x={x} y={0} width={barW + gap} height={H} fill="transparent" />
              {h > 0 && <rect x={x} y={H - h} width={barW} height={h} rx={3} fill={hover === i ? '#8F5637' : '#B8734E'} />}
              <title>{`${dayLabel(d.date)}: ${fmt(values[i])}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-[#6B655C]">
        <span>{dayLabel(days[0]?.date ?? '')}</span>
        <span>{dayLabel(days[days.length - 1]?.date ?? '')}</span>
      </div>
      <details className="mt-3 text-xs text-[#6B655C]">
        <summary className="cursor-pointer select-none">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-[#6B655C]">
              <th className="py-1 font-semibold">Day</th>
              <th className="py-1 text-right font-semibold">Orders</th>
              <th className="py-1 text-right font-semibold">Paid value</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t border-[#171717]/6">
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
