'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiErrorMessage } from '@/lib/api';
import { listAudit } from '@/lib/admin';
import type { AuditEntry } from '@/types/admin';
import { AdminHeading } from './AdminShell';
import { Alert, Chips, Empty, Loading, fmtDate } from './ui';

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'verification.approve', label: 'Approvals' },
  { value: 'verification.reject', label: 'Rejections' },
  { value: 'dispute.resolve', label: 'Disputes' },
  { value: 'payout.retry', label: 'Payout retries' },
  { value: 'user.suspend', label: 'Suspensions' },
  { value: 'user.reactivate', label: 'Reactivations' },
  { value: 'review.hide', label: 'Hidden reviews' },
  { value: 'fabric.unpublish', label: 'Unpublished fabrics' },
  { value: 'survey.export', label: 'Survey exports' },
];

/** Where an audited target can be opened in the dashboard. */
function targetHref(e: AuditEntry): string | null {
  switch (e.targetType) {
    case 'user':
      return `/admin/users/${e.targetId}`;
    case 'order':
    case 'review':
      return `/admin/orders/${e.targetId}`;
    case 'fabric':
      return `/admin/fabrics?q=${encodeURIComponent(String(e.details?.name ?? ''))}`;
    case 'escrow_transaction':
      return '/admin/payouts';
    case 'survey':
      return `/admin/surveys/${e.targetId}`;
    default:
      return null;
  }
}

export function AuditPanel() {
  const [action, setAction] = useState('');
  return (
    <>
      <AdminHeading kicker="Account" title="Audit log" />
      <p className="-mt-3 mb-5 max-w-2xl text-sm text-[#6B655C]">
        Every admin decision is recorded here: who did it, when, and why. Entries can&apos;t be edited or deleted.
      </p>
      <div className="mb-4">
        <Chips label="Action" value={action} onChange={setAction} options={ACTIONS} />
      </div>
      <AuditList key={action} filter={{ action: action || undefined }} />
    </>
  );
}

export function AuditList({
  filter,
  compact = false,
}: {
  filter: { action?: string; targetType?: string; targetId?: string };
  compact?: boolean;
}) {
  const [items, setItems] = useState<AuditEntry[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const { action, targetType, targetId } = filter;

  const load = useCallback(
    async (before?: string) => {
      const page = await listAudit({ action, targetType, targetId, before, limit: compact ? 10 : 30 });
      setItems((prev) => (before && prev ? [...prev, ...page.items] : page.items));
      setHasMore(page.hasMore);
    },
    [action, targetType, targetId, compact],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch for this filter
    load().catch((err) => setError(apiErrorMessage(err, 'Could not load the audit log.')));
  }, [load]);

  if (error) return <Alert>{error}</Alert>;
  if (!items) return <Loading label="Loading audit log" />;
  if (items.length === 0) return compact ? <p className="text-sm text-[#6B655C]">No admin actions yet.</p> : <Empty>No admin actions recorded yet.</Empty>;

  return (
    <div className="flex flex-col gap-3">
      <ol className={compact ? 'flex flex-col gap-3' : 'divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/60'}>
        {items.map((e) => {
          const href = targetHref(e);
          return (
            <li key={e.id} className={compact ? '' : 'px-4 py-3'} data-testid="audit-row">
              <p className="text-sm text-[#171717]">{href ? <Link href={href} className="hover:text-[#8F5637]">{e.summary}</Link> : e.summary}</p>
              <p className="text-xs text-[#6B655C]">
                {e.admin?.fullName ?? e.admin?.email ?? 'Admin'} · {fmtDate(e.createdAt)} · <span className="font-mono">{e.action}</span>
              </p>
              {typeof e.details?.note === 'string' || typeof e.details?.reason === 'string' ? (
                <p className="mt-1 text-xs italic text-[#6B655C]">“{String(e.details?.note ?? e.details?.reason)}”</p>
              ) : null}
            </li>
          );
        })}
      </ol>
      {hasMore && (
        <button
          type="button"
          className="btn-ghost self-center px-3 py-1.5"
          disabled={loadingMore}
          onClick={async () => {
            setLoadingMore(true);
            try {
              await load(items[items.length - 1].createdAt);
            } catch (err) {
              setError(apiErrorMessage(err));
            } finally {
              setLoadingMore(false);
            }
          }}
        >
          {loadingMore ? 'Loading…' : 'Older entries'}
        </button>
      )}
    </div>
  );
}
