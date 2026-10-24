'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { listReviews, setReviewHidden } from '@/lib/admin';
import { apiErrorMessage } from '@/lib/api';
import { Stars } from '@/components/orders/ReviewCard';
import type { AdminReview } from '@/types/admin';
import { AdminHeading, useAdminQueues } from './AdminShell';
import { Alert, Empty, Loading, Pill, fmtDate } from './ui';

export function ReviewsPanel() {
  const { refreshQueues } = useAdminQueues();
  const [items, setItems] = useState<AdminReview[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (before?: string) => {
    const page = await listReviews({ before, limit: 30 });
    setItems((prev) => (before && prev ? [...prev, ...page.items] : page.items));
    setHasMore(page.hasMore);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    load().catch((err) => setError(apiErrorMessage(err, 'Could not load reviews.')));
  }, [load]);

  async function toggle(r: AdminReview) {
    setBusy(r.id);
    setError('');
    try {
      const { reviewHiddenAt } = await setReviewHidden(r.id, !r.reviewHiddenAt);
      setItems((prev) => prev?.map((x) => (x.id === r.id ? { ...x, reviewHiddenAt } : x)) ?? prev);
      refreshQueues();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <AdminHeading kicker="Community" title="Reviews" />
      <p className="-mt-3 mb-5 max-w-2xl text-sm text-[#94A3B8]">
        Hide reviews that are abusive, off-topic or share private details. Hidden reviews leave the artisan&apos;s profile and
        average; the customer can see that theirs was hidden.
      </p>
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {!items && !error && <Loading label="Loading reviews" />}
      {items?.length === 0 && <Empty>No reviews yet.</Empty>}
      {items && items.length > 0 && (
        <ul className="grid gap-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-4" data-testid="review-row">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating} size={14} />
                    {r.reviewHiddenAt && <Pill tone="amber">Hidden</Pill>}
                  </div>
                  <p className="mt-2 text-sm text-[#E2E8F0]">{r.review ? `“${r.review}”` : 'No written review.'}</p>
                  {r.reviewReply && <p className="mt-1 text-xs text-[#94A3B8]">Reply: “{r.reviewReply}”</p>}
                  <p className="mt-2 text-xs text-[#64748B]">
                    <Link href={`/admin/users/${r.customer.id}`} className="hover:text-[#38BDF8]">
                      {r.customer.fullName ?? 'Customer'}
                    </Link>{' '}
                    → {r.tailor?.atelierName ?? r.tailor?.displayName ?? 'Artisan'} · {r.garmentType} ·{' '}
                    <Link href={`/admin/orders/${r.id}`} className="font-mono hover:text-[#38BDF8]">
                      {r.reference}
                    </Link>{' '}
                    · {fmtDate(r.reviewedAt)}
                  </p>
                </div>
                <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => toggle(r)} disabled={busy === r.id}>
                  {r.reviewHiddenAt ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
                  {busy === r.id ? 'Saving…' : r.reviewHiddenAt ? 'Show' : 'Hide'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore && items && (
        <button type="button" className="btn-ghost mx-auto mt-4 px-3 py-1.5" onClick={() => load(items[items.length - 1].reviewedAt).catch((err) => setError(apiErrorMessage(err)))}>
          Older reviews
        </button>
      )}
    </>
  );
}
