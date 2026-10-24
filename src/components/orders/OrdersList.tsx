'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package, Scissors, ShoppingBag } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { EmptyState, ErrorState, Portrait, useRemote } from '@/components/marketplace/shared';
import { listOrders } from '@/lib/orders';
import { naira } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { OrderListItem, OrderStatus } from '@/types';
import { nextStep, rolesFor, type OrdersRole } from './needsAction';
import { formatDate, StatusPill } from './ui';

const TAB: Record<OrdersRole, { label: string; icon: typeof ShoppingBag }> = {
  customer: { label: 'My commissions', icon: ShoppingBag },
  tailor: { label: 'Commission requests', icon: Scissors },
  merchant: { label: 'Fabric to ship', icon: Package },
};

const FILTERS: { id: string; label: string; statuses?: OrderStatus[] }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Awaiting quote', statuses: ['requested', 'quoted'] },
  { id: 'active', label: 'In progress', statuses: ['paid', 'in_progress', 'delivered'] },
  { id: 'done', label: 'Completed', statuses: ['completed'] },
  { id: 'closed', label: 'Closed', statuses: ['declined', 'cancelled', 'refunded', 'disputed'] },
];

export default function OrdersList() {
  return (
    <RequireAuth>
      <Orders />
    </RequireAuth>
  );
}

function Orders() {
  const { user } = useAuth();
  const roles = rolesFor(user!.role);
  const [role, setRole] = useState<OrdersRole>(roles[0]);
  const [filter, setFilter] = useState('all');
  const statuses = FILTERS.find((f) => f.id === filter)?.statuses;
  const { result, retry } = useRemote(() => listOrders({ role, status: statuses }), [role, filter]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#38BDF8]">Orders</p>
          <h1 className="text-[30px] font-extrabold leading-[38px] text-[#F8FAFC] sm:text-[40px] sm:leading-[48px]">
            {TAB[role].label}
          </h1>
        </div>
        {role === 'customer' && (
          <Link href="/tailors" className="btn-primary">
            New commission <ArrowRight size={16} />
          </Link>
        )}
      </header>

      {roles.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label="Order views">
          {roles.map((r) => {
            const Icon = TAB[r].icon;
            return (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={role === r}
                onClick={() => setRole(r)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                  role === r
                    ? 'border-[#00A3FF] bg-[#00A3FF] text-[#090D16]'
                    : 'border-white/10 text-[#94A3B8] hover:text-[#F8FAFC]',
                )}
              >
                <Icon size={15} aria-hidden="true" /> {TAB[r].label}
              </button>
            );
          })}
        </div>
      )}

      <div className="filter-row" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            className={filter === f.id ? 'selected' : ''}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {result.state === 'error' ? (
        <ErrorState message={result.message} onRetry={retry} />
      ) : result.state === 'loading' ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="mk-skeleton h-28 rounded-2xl" />
          ))}
          <span className="sr-only" role="status">
            Loading orders
          </span>
        </div>
      ) : result.data.length ? (
        <ul className="flex flex-col gap-3">
          {result.data.map((order) => (
            <OrderCard key={order.id} order={order} role={role} />
          ))}
        </ul>
      ) : (
        <EmptyState
          title={filter === 'all' ? 'Nothing here yet' : 'No orders match this filter'}
          body={
            role === 'customer'
              ? 'Find an artisan you like and request a commission — you only pay once you accept their quote.'
              : role === 'tailor'
                ? 'Commission requests from customers appear here. Keep your artisan profile complete so customers can find you.'
                : 'When a customer buys your fabric as part of a commission, it appears here once they have paid.'
          }
          action={
            role === 'customer' ? (
              <Link href="/tailors" className="mk-state-action">
                Meet the artisans <ArrowRight size={15} />
              </Link>
            ) : role === 'merchant' ? (
              <Link href="/merchant/fabrics" className="mk-state-action">
                Manage your fabrics <ArrowRight size={15} />
              </Link>
            ) : (
              <Link href="/onboarding/tailor-kyc" className="mk-state-action">
                Your artisan profile <ArrowRight size={15} />
              </Link>
            )
          }
        />
      )}
    </div>
  );
}

function OrderCard({ order, role }: { order: OrderListItem; role: OrdersRole }) {
  const step = nextStep(order, role);
  const thumb = order.referenceImageUrls[0] ?? order.items[0]?.imageUrl ?? null;
  const counterpart =
    role === 'customer'
      ? (order.tailor?.displayName ?? order.tailor?.atelierName ?? 'Artisan')
      : role === 'tailor'
        ? (order.customer.fullName ?? 'Customer')
        : (order.tailor?.atelierName ?? order.tailor?.displayName ?? 'Artisan');
  const amount = role === 'merchant' ? order.merchantTotal : order.totalAmount;

  return (
    <li>
      <Link
        href={`/orders/${order.id}`}
        className={cn(
          'flex flex-col gap-4 rounded-2xl border bg-[#0F172A]/80 p-4 transition hover:-translate-y-0.5 hover:border-[#00A3FF]/40 sm:flex-row sm:items-center sm:p-5',
          step ? 'border-[#00A3FF]/40 shadow-[0_0_20px_-6px_rgba(0,163,255,0.45)]' : 'border-white/[0.08]',
        )}
      >
        <span className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-[#1E293B] sm:h-20 sm:w-20">
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="(max-width: 640px) 100vw, 80px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[#64748B]">
              <Scissors size={22} aria-hidden="true" />
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-inter)] text-xs font-semibold tracking-wide text-[#94A3B8]">
              {order.reference}
            </span>
            <StatusPill status={order.status} />
          </span>
          <span className="text-base font-bold text-[#F8FAFC]">
            {order.garmentType}
            {role === 'merchant' && ` · ${order.items.length} fabric line${order.items.length === 1 ? '' : 's'}`}
          </span>
          <span className="flex items-center gap-2 text-sm text-[#94A3B8]">
            {role !== 'tailor' && order.tailor && (
              <span className="overflow-hidden rounded-full">
                <Portrait src={order.tailor.portraitUrl} name={counterpart} size={22} />
              </span>
            )}
            {role === 'tailor' ? `For ${counterpart}` : counterpart} · updated {formatDate(order.updatedAt)}
          </span>
          {step && <span className="text-xs font-semibold text-[#38BDF8]">Next: {step}</span>}
        </span>
        <span className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="font-[family-name:var(--font-inter)] text-lg font-bold tabular-nums text-[#F8FAFC]">
            {amount ? naira(amount) : order.status === 'requested' ? 'Awaiting quote' : '—'}
          </span>
          <ArrowRight size={18} className="text-[#00A3FF]" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}
