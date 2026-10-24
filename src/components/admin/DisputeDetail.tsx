'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Scale } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { ORDER_STATUS_LABEL, getAdminOrder, resolveDispute } from '@/lib/orders';
import { cn } from '@/lib/utils';
import type { EscrowTransactionType, Order } from '@/types';
import { Alert, Facts, Panel, Pill, fmtDate, naira } from './ui';

const TX_LABEL: Record<EscrowTransactionType, string> = {
  hold: 'Customer payment held',
  release_tailor: 'Payout to artisan',
  release_merchant: 'Payout to merchant',
  refund: 'Refund to customer',
};

export function DisputeDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    try {
      setOrder(await getAdminOrder(id));
    } catch (err) {
      setLoadError(apiErrorMessage(err, 'Could not load this order.'));
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load();
  }, [load]);

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{loadError}</Alert>
        <button type="button" className="btn-ghost" onClick={load}>
          Try again
        </button>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex justify-center py-20 text-[#94A3B8]">
        <LoaderCircle className="animate-spin" size={26} aria-label="Loading order" />
      </div>
    );
  }

  const tailorName = order.tailor?.atelierName ?? order.tailor?.displayName ?? 'Artisan';
  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin?tab=disputes" className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#00A3FF]">
        <ArrowLeft size={15} aria-hidden="true" /> Back to disputes
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold text-[#38BDF8]">{order.reference}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#F8FAFC]">{order.garmentType}</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {order.customer.fullName ?? 'Customer'} commissioned {tailorName} · {fmtDate(order.createdAt)}
          </p>
        </div>
        <Pill tone={order.status === 'disputed' ? 'red' : order.status === 'completed' ? 'green' : 'neutral'}>
          {ORDER_STATUS_LABEL[order.status]}
        </Pill>
      </div>

      {order.disputeReason && (
        <div className="rounded-2xl border border-[#ffb4ab]/30 bg-[#93000a]/15 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#ffb4ab]">Customer’s dispute · {fmtDate(order.disputedAt)}</p>
          <p className="mt-1.5 text-sm text-[#F8FAFC]">{order.disputeReason}</p>
        </div>
      )}
      {order.resolutionNote && order.status !== 'disputed' && (
        <Alert tone="success">Resolved: {order.resolutionNote}</Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="The commission">
            <Facts
              rows={[
                ['Brief', <span key="b" className="whitespace-pre-line">{order.brief}</span>],
                ['Artisan quote', `${naira(order.workmanshipPrice)} workmanship + ${naira(order.deliveryFee)} delivery`],
                ['Fabrics', naira(order.fabricTotal)],
                ['Platform fee', naira(order.platformFee)],
                ['Total paid', <strong key="t">{naira(order.totalAmount)}</strong>],
                ['Estimated delivery', order.estimatedDeliveryDate],
                ['Delivered', fmtDate(order.deliveredAt)],
                ['Deliver to', `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}`],
              ]}
            />
            {order.referenceImageUrls.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {order.referenceImageUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-20 overflow-hidden rounded-lg bg-[#1E293B]">
                    <Image src={url} alt="Reference" fill sizes="80px" className="object-cover" />
                  </a>
                ))}
              </div>
            )}
          </Panel>

          {order.items.length > 0 && (
            <Panel title="Fabrics">
              <ul className="divide-y divide-white/[0.06]">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#1E293B]">
                      <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[#F8FAFC]">{item.fabricName}</span>
                      <span className="block text-xs text-[#94A3B8]">
                        {item.quantity} {item.unit}s × {naira(item.unitPrice)} · {item.fulfilment}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">{naira(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Timeline">
            <ol className="relative space-y-3 border-l border-white/10 pl-4">
              {order.events.map((event) => (
                <li key={event.id} className="text-sm">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[#00A3FF]" aria-hidden="true" />
                  <span className="block text-[#F8FAFC]">{event.label}</span>
                  <span className="block text-xs text-[#64748B]">{fmtDate(event.createdAt)}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Escrow">
            <div className="grid grid-cols-2 gap-3 text-sm" data-testid="escrow-summary">
              {(
                [
                  ['Held', order.escrow.held],
                  ['Released', order.escrow.released],
                  ['Refunded', order.escrow.refunded],
                  ['Balance', order.escrow.balance],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#090D16]/60 p-3">
                  <p className="text-xs text-[#94A3B8]">{label}</p>
                  <p className={cn('mt-0.5 font-bold tabular-nums', label === 'Balance' ? 'text-[#38BDF8]' : 'text-[#F8FAFC]')}>{naira(value)}</p>
                </div>
              ))}
            </div>
            {order.escrowTransactions && order.escrowTransactions.length > 0 && (
              <ul className="mt-4 divide-y divide-white/[0.06] text-xs">
                {order.escrowTransactions.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="min-w-0">
                      <span className="block text-[#F8FAFC]">{TX_LABEL[tx.type]}</span>
                      <span className="block text-[#64748B]">{fmtDate(tx.createdAt)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums text-[#F8FAFC]">{naira(tx.amount)}</span>
                      <Pill tone={tx.status === 'success' ? 'green' : tx.status === 'failed' ? 'red' : 'amber'}>{tx.status}</Pill>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {order.status === 'disputed' && <ResolveForm order={order} onResolved={setOrder} />}
        </div>
      </div>
    </div>
  );
}

function ResolveForm({ order, onResolved }: { order: Order; onResolved: (order: Order) => void }) {
  const balance = order.escrow.balance;
  const [outcome, setOutcome] = useState<'release' | 'refund'>('refund');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refund = amount ? Number(amount) : balance;
  const amountError =
    outcome === 'refund' && amount && (!/^\d+$/.test(amount) || refund < 1 || refund > balance)
      ? `Enter an amount from ₦1 to ${naira(balance)}.`
      : '';
  const noteError = note.trim().length < 5 ? 'Explain the decision (at least 5 characters) — both parties see it.' : '';

  function review(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (amountError || noteError) {
      setError(amountError || noteError);
      return;
    }
    setConfirming(true);
  }

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      onResolved(
        await resolveDispute(order.id, {
          outcome,
          refundAmount: outcome === 'refund' && amount ? refund : undefined,
          note: note.trim(),
        }),
      );
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not resolve the dispute.'));
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  const summary =
    outcome === 'release'
      ? `Release the remaining ${naira(balance)} to the people who did the work (artisan, and any merchant not yet paid). The order is marked completed.`
      : `Refund ${naira(refund)} to the customer${refund < balance ? `; the remaining ${naira(balance - refund)} is released to the artisan and merchants` : ''}. The order is marked refunded.`;

  return (
    <Panel title="Resolve dispute">
      <form onSubmit={review} className="flex flex-col gap-4" noValidate>
        <fieldset className="grid gap-2">
          <legend className="sr-only">Outcome</legend>
          {(
            [
              ['refund', 'Refund the customer', 'Full or partial refund from what’s left in escrow.'],
              ['release', 'Release to the artisan', 'The work stands; pay out what’s left in escrow.'],
            ] as const
          ).map(([value, title, desc]) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-3',
                outcome === value ? 'border-[#00A3FF] bg-[#00A3FF]/10' : 'border-white/10',
              )}
            >
              <input
                type="radio"
                name="outcome"
                value={value}
                checked={outcome === value}
                onChange={() => {
                  setOutcome(value);
                  setConfirming(false);
                }}
                className="mt-0.5 accent-[#00A3FF]"
              />
              <span>
                <span className="block text-sm font-semibold text-[#F8FAFC]">{title}</span>
                <span className="block text-xs text-[#94A3B8]">{desc}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {outcome === 'refund' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Refund amount (₦)</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/\D/g, '').slice(0, 9));
                setConfirming(false);
              }}
              placeholder={`Full balance: ${balance.toLocaleString('en-NG')}`}
              aria-invalid={amountError ? true : undefined}
              className="rounded-xl border border-white/10 bg-[#090D16] px-3.5 py-2.5 text-sm tabular-nums text-[#F8FAFC] outline-none focus:border-[#00A3FF]"
            />
            <span className="text-[11px] text-[#64748B]">Leave blank to refund everything still in escrow.</span>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Decision note (sent to both parties)</span>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setConfirming(false);
            }}
            rows={3}
            maxLength={1000}
            className="rounded-xl border border-white/10 bg-[#090D16] px-3.5 py-2.5 text-sm text-[#F8FAFC] outline-none focus:border-[#00A3FF]"
          />
        </label>

        {error && <Alert>{error}</Alert>}

        {confirming ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-3">
            <p className="text-sm text-[#fde68a]" data-testid="resolve-summary">
              <Scale size={15} className="mr-1.5 inline" aria-hidden="true" />
              {summary} This moves money and can’t be undone.
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => setConfirming(false)} disabled={busy}>
                Back
              </button>
              <button type="button" className="btn-primary flex-1 justify-center" onClick={confirm} disabled={busy}>
                {busy ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : null}
                Confirm decision
              </button>
            </div>
          </div>
        ) : (
          <button type="submit" className="btn-primary justify-center">
            Review decision
          </button>
        )}
      </form>
    </Panel>
  );
}
