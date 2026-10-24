'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { searchOrders } from '@/lib/admin';
import { useRemote, ErrorState } from '@/components/marketplace/shared';
import { StatusPill } from '@/components/orders/ui';
import type { OrderStatus } from '@/types';
import { AdminHeading } from './AdminShell';
import { Chips, Empty, Loading, Pager, SearchBox, fmtDate, naira } from './ui';
import { useUrlFilters } from './useUrlFilters';

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'requested,quoted', label: 'Awaiting quote / payment' },
  { value: 'paid,in_progress', label: 'In production' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'declined,cancelled', label: 'Closed' },
];
const LIMIT = 25;

export function OrdersPanel() {
  const [f, set] = useUrlFilters(['q', 'status', 'page'] as const);
  const page = Number(f.page) || 1;
  const statuses = f.status ? (f.status.split(',') as OrderStatus[]) : undefined;
  const { result, retry } = useRemote(() => searchOrders({ q: f.q || undefined, status: statuses, page, limit: LIMIT }), [f.q, f.status, page]);
  const disputesOnly = f.status === 'disputed';
  // A status reached from elsewhere (e.g. overview "Paid") still shows as a chip.
  const options = STATUSES.some((s) => s.value === f.status) ? STATUSES : [...STATUSES, { value: f.status, label: f.status.replace('_', ' ') }];

  return (
    <>
      <AdminHeading kicker="Operations" title={disputesOnly ? 'Disputes' : 'Orders'} />
      <div className="mb-4 flex flex-col gap-3">
        <SearchBox label="Search orders" placeholder="Reference, customer or artisan" value={f.q} onChange={(q) => set({ q })} />
        <Chips label="Status" value={f.status} onChange={(status) => set({ status })} options={options} />
      </div>

      {result.state === 'loading' && <Loading label="Loading orders" />}
      {result.state === 'error' && <ErrorState message={result.message} onRetry={retry} />}
      {result.state === 'ready' && result.data.items.length === 0 && (
        <Empty>{disputesOnly ? 'No open disputes.' : 'No orders match these filters.'}</Empty>
      )}
      {result.state === 'ready' && result.data.items.length > 0 && (
        <div className="flex flex-col gap-4">
          <ul className="grid gap-3">
            {result.data.items.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  data-testid="order-row"
                  className="grid gap-3 rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-4 transition-colors hover:border-[#00A3FF]/40 md:grid-cols-[150px_minmax(0,1fr)_120px_130px_20px] md:items-center"
                >
                  <span>
                    <span className="block font-mono text-sm font-bold text-[#F8FAFC]">{o.reference}</span>
                    <span className="block text-xs text-[#94A3B8]">{o.garmentType}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-[#F8FAFC]">
                      {o.customer.fullName ?? 'Customer'} → {o.tailor?.atelierName ?? o.tailor?.displayName ?? 'Artisan'}
                    </span>
                    <span className="block truncate text-xs text-[#94A3B8]">
                      {o.status === 'disputed' && o.disputeReason ? `“${o.disputeReason}”` : (o.resolutionNote ?? o.brief)}
                    </span>
                  </span>
                  <span>
                    <StatusPill status={o.status} />
                  </span>
                  <span className="text-sm md:text-right">
                    <span className="block font-semibold tabular-nums text-[#F8FAFC]">{o.totalAmount ? naira(o.totalAmount) : '—'}</span>
                    <span className="block text-xs text-[#94A3B8]">{fmtDate(o.disputedAt ?? o.createdAt)}</span>
                  </span>
                  <ChevronRight size={16} className="hidden text-[#64748B] md:block" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Pager page={page} limit={LIMIT} total={result.data.total} onPage={(p) => set({ page: String(p) })} />
        </div>
      )}
    </>
  );
}
