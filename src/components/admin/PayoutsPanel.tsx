'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleAlert, CircleCheck, LoaderCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { getEscrowQueue, retryPayout } from '@/lib/orders';
import type { EscrowQueueItem, EscrowTransactionType } from '@/types';
import { useAdminQueues } from './AdminShell';
import { Alert, Chips, Pill, fmtDate, naira } from './ui';

const TYPE_LABEL: Record<EscrowTransactionType, string> = {
  hold: 'Customer payment',
  release_tailor: 'Artisan payout',
  release_merchant: 'Merchant payout',
  refund: 'Refund to customer',
};

export function PayoutsPanel() {
  const { refreshQueues } = useAdminQueues();
  const [status, setStatus] = useState<'failed' | 'pending'>('failed');
  const [items, setItems] = useState<EscrowQueueItem[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    setError('');
    try {
      setItems(await getEscrowQueue(status));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load payouts.'));
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when the filter changes
    void load();
  }, [load]);

  async function retry(tx: EscrowQueueItem) {
    setBusyId(tx.id);
    setError('');
    setNotice('');
    try {
      await retryPayout(tx.id);
      refreshQueues();
      setNotice(`Retried ${TYPE_LABEL[tx.type].toLowerCase()} of ${naira(tx.amount)} to ${tx.payee.name ?? 'the payee'}.`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'The retry failed.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Chips
          label="Payout status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'failed', label: 'Failed' },
            { value: 'pending', label: 'In progress' },
          ]}
        />
        <button type="button" onClick={load} className="btn-ghost px-3 py-2" aria-label="Refresh payouts">
          <RefreshCw size={14} aria-hidden="true" /> Refresh
        </button>
      </div>
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}
      {!items && !error && (
        <div className="flex justify-center py-12 text-[#6B655C]">
          <LoaderCircle className="animate-spin" size={24} aria-label="Loading payouts" />
        </div>
      )}
      {items?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#171717]/15 py-12 text-center text-sm text-[#6B655C]">
          {status === 'failed' ? 'No failed payouts.' : 'No payouts in progress.'}
        </p>
      )}
      {items && items.length > 0 && (
        <ul className="grid gap-3">
          {items.map((tx) => (
            <li
              key={tx.id}
              data-testid="payout-row"
              className="grid gap-3 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold tabular-nums text-[#171717]">{naira(tx.amount)}</span>
                  <Pill tone={tx.status === 'failed' ? 'red' : 'amber'}>{tx.status}</Pill>
                  <span className="text-xs text-[#6B655C]">{TYPE_LABEL[tx.type]}</span>
                </div>
                <p className="mt-1 text-xs text-[#6B655C]">
                  {tx.order ? (
                    <Link href={`/admin/orders/${tx.order.id}`} className="font-mono text-[#8F5637] hover:underline">
                      {tx.order.reference}
                    </Link>
                  ) : (
                    'Unknown order'
                  )}{' '}
                  · {fmtDate(tx.updatedAt)}
                </p>
                {tx.failureReason && <p className="mt-1.5 text-xs text-[#9B2C24]">{tx.failureReason}</p>}
              </div>
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-[#171717]">{tx.payee.name ?? '—'}</p>
                <p className="truncate text-xs text-[#6B655C]">
                  {tx.payee.bankName ?? 'No bank'} · {tx.payee.accountNumber ?? 'no account'}
                  {tx.payee.accountName && ` · ${tx.payee.accountName}`}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs">
                  {tx.payee.payoutReady ? (
                    <>
                      <CircleCheck size={13} className="text-[#2F6B4F]" aria-hidden="true" /> Payout details complete
                    </>
                  ) : (
                    <>
                      <CircleAlert size={13} className="text-[#B8734E]" aria-hidden="true" /> Payee must add a bank account first
                    </>
                  )}
                </p>
              </div>
              {tx.status === 'failed' && tx.type !== 'hold' && (
                <button
                  type="button"
                  onClick={() => retry(tx)}
                  disabled={busyId === tx.id || !tx.payee.payoutReady}
                  className="btn-primary justify-center"
                >
                  {busyId === tx.id ? (
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw size={15} aria-hidden="true" />
                  )}
                  Retry payout
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
