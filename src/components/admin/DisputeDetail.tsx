'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Scale } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { ORDER_STATUS_LABEL, getAdminOrder, resolveDispute } from '@/lib/orders';
import { cn } from '@/lib/utils';
import type { EscrowTransactionType, Order } from '@/types';
import { Alert, Facts, Panel, Pill, fmtDate, naira } from './ui';
import { useAdminQueues } from './AdminShell';
import { getOrderMessages, setReviewHidden } from '@/lib/admin';
import { Stars } from '@/components/orders/ReviewCard';
import type { ChatMessage } from '@/types';

const TX_LABEL: Record<EscrowTransactionType, string> = {
  hold: 'Customer payment held',
  release_tailor: 'Payout to artisan',
  release_merchant: 'Payout to merchant',
  refund: 'Refund to customer',
};

/** Everything about one order for an admin: money, people, timeline, conversation, review and dispute resolution. */
export function DisputeDetail({ id }: { id: string }) {
  const { refreshQueues } = useAdminQueues();
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
      <div className="flex justify-center py-20 text-[#6B655C]">
        <LoaderCircle className="animate-spin" size={26} aria-label="Loading order" />
      </div>
    );
  }

  const tailorName = order.tailor?.atelierName ?? order.tailor?.displayName ?? 'Artisan';
  return (
    <div className="flex flex-col gap-5">
      <Link
        href={order.status === 'disputed' ? '/admin/orders?status=disputed' : '/admin/orders'}
        className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#6B655C] hover:text-[#B8734E]"
      >
        <ArrowLeft size={15} aria-hidden="true" /> {order.status === 'disputed' ? 'Back to disputes' : 'All orders'}
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold text-[#8F5637]">{order.reference}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#171717]">{order.garmentType}</h1>
          <p className="mt-1 text-sm text-[#6B655C]">
            <Link href={`/admin/users/${order.customerId}`} className="text-[#4B453E] hover:text-[#8F5637]">
              {order.customer.fullName ?? 'Customer'}
            </Link>{' '}
            commissioned{' '}
            <Link href={`/admin/users/${order.tailorUserId}`} className="text-[#4B453E] hover:text-[#8F5637]">
              {tailorName}
            </Link>{' '}
            · {fmtDate(order.createdAt)}
          </p>
        </div>
        <Pill tone={order.status === 'disputed' ? 'red' : order.status === 'completed' ? 'green' : 'neutral'}>
          {ORDER_STATUS_LABEL[order.status]}
        </Pill>
      </div>

      {order.disputeReason && (
        <div className="rounded-2xl border border-[#9B2C24]/30 bg-[#F6E3E0]/15 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9B2C24]">Customer’s dispute · {fmtDate(order.disputedAt)}</p>
          <p className="mt-1.5 text-sm text-[#171717]">{order.disputeReason}</p>
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
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-20 overflow-hidden rounded-lg bg-[#FFFFFF]">
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
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#FFFFFF]">
                      <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[#171717]">{item.fabricName}</span>
                      <span className="block text-xs text-[#6B655C]">
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
            <ol className="relative space-y-3 border-l border-[#171717]/12 pl-4">
              {order.events.map((event) => (
                <li key={event.id} className="text-sm">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[#B8734E]" aria-hidden="true" />
                  <span className="block text-[#171717]">{event.label}</span>
                  <span className="block text-xs text-[#6B655C]">{fmtDate(event.createdAt)}</span>
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
                <div key={label} className="rounded-xl bg-[#F5F0E8]/60 p-3">
                  <p className="text-xs text-[#6B655C]">{label}</p>
                  <p className={cn('mt-0.5 font-bold tabular-nums', label === 'Balance' ? 'text-[#8F5637]' : 'text-[#171717]')}>{naira(value)}</p>
                </div>
              ))}
            </div>
            {order.escrowTransactions && order.escrowTransactions.length > 0 && (
              <ul className="mt-4 divide-y divide-white/[0.06] text-xs">
                {order.escrowTransactions.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="min-w-0">
                      <span className="block text-[#171717]">{TX_LABEL[tx.type]}</span>
                      <span className="block text-[#6B655C]">{fmtDate(tx.createdAt)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums text-[#171717]">{naira(tx.amount)}</span>
                      <Pill tone={tx.status === 'success' ? 'green' : tx.status === 'failed' ? 'red' : 'amber'}>{tx.status}</Pill>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {order.status === 'disputed' && (
            <ResolveForm
              order={order}
              onResolved={(updated) => {
                setOrder(updated);
                refreshQueues();
              }}
            />
          )}
          {order.rating !== null && <ReviewModeration order={order} onChange={load} />}
          <Conversation order={order} />
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
                outcome === value ? 'border-[#B8734E] bg-[#B8734E]/10' : 'border-[#171717]/12',
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
                className="mt-0.5 accent-[#B8734E]"
              />
              <span>
                <span className="block text-sm font-semibold text-[#171717]">{title}</span>
                <span className="block text-xs text-[#6B655C]">{desc}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {outcome === 'refund' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Refund amount (₦)</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/\D/g, '').slice(0, 9));
                setConfirming(false);
              }}
              placeholder={`Full balance: ${balance.toLocaleString('en-NG')}`}
              aria-invalid={amountError ? true : undefined}
              className="rounded-xl border border-[#171717]/12 bg-[#F5F0E8] px-3.5 py-2.5 text-sm tabular-nums text-[#171717] outline-none focus:border-[#B8734E]"
            />
            <span className="text-[11px] text-[#6B655C]">Leave blank to refund everything still in escrow.</span>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Decision note (sent to both parties)</span>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setConfirming(false);
            }}
            rows={3}
            maxLength={1000}
            className="rounded-xl border border-[#171717]/12 bg-[#F5F0E8] px-3.5 py-2.5 text-sm text-[#171717] outline-none focus:border-[#B8734E]"
          />
        </label>

        {error && <Alert>{error}</Alert>}

        {confirming ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[#B8734E]/30 bg-[#B8734E]/10 p-3">
            <p className="text-sm text-[#8A6A1F]" data-testid="resolve-summary">
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

function ReviewModeration({ order, onChange }: { order: Order; onChange: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hidden = Boolean(order.reviewHiddenAt);
  async function toggle() {
    setBusy(true);
    setError('');
    try {
      await setReviewHidden(order.id, !hidden);
      await onChange();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel title="Customer review" actions={hidden ? <Pill tone="amber">Hidden</Pill> : undefined}>
      <div className="flex flex-col gap-2 text-sm">
        <Stars rating={order.rating ?? 0} />
        <p className="text-[#4B453E]">{order.review ? `“${order.review}”` : 'No written review.'}</p>
        {order.reviewReply && <p className="text-xs text-[#6B655C]">Artisan replied: “{order.reviewReply}”</p>}
        {error && <Alert>{error}</Alert>}
        <button type="button" className="btn-ghost mt-1 self-start px-3 py-1.5" onClick={toggle} disabled={busy}>
          {hidden ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
          {busy ? 'Saving…' : hidden ? 'Show on profile' : 'Hide from profile'}
        </button>
      </div>
    </Panel>
  );
}

/** Read-only copy of the order chat, for settling disputes. */
function Conversation({ order }: { order: Order }) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    getOrderMessages(order.id)
      .then(setMessages)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load the conversation.')));
  }, [order.id]);

  const who = (m: ChatMessage) =>
    m.senderId === null ? 'IPILE' : m.senderId === order.customerId ? (order.customer.fullName ?? 'Customer') : (order.tailor?.displayName ?? 'Artisan');

  return (
    <Panel title="Conversation" actions={<span className="text-[11px] text-[#6B655C]">Read only</span>}>
      {error && <Alert>{error}</Alert>}
      {!messages && !error && (
        <div className="flex justify-center py-6 text-[#6B655C]">
          <LoaderCircle className="animate-spin" size={20} aria-label="Loading conversation" />
        </div>
      )}
      {messages && messages.length === 0 && <p className="text-sm text-[#6B655C]">No messages.</p>}
      {messages && messages.length > 0 && (
        <ol className="flex max-h-[480px] flex-col gap-3 overflow-y-auto pr-1" data-testid="admin-chat">
          {messages.map((m) => (
            <li key={m.id} className={cn('text-sm', m.senderId === null && 'text-center')}>
              {m.senderId === null ? (
                <span className="inline-block rounded-full bg-[#171717]/4 px-3 py-1 text-xs text-[#6B655C]">{m.content}</span>
              ) : (
                <div className={cn('rounded-xl p-3', m.senderId === order.customerId ? 'bg-[#FFFFFF]' : 'bg-[#B8734E]/10')}>
                  <p className="mb-1 text-[11px] font-semibold text-[#6B655C]">
                    {who(m)} · {fmtDate(m.createdAt)}
                  </p>
                  {m.content && <p className="whitespace-pre-line text-[#2A2622]">{m.content}</p>}
                  {m.attachmentUrl && (
                    <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="relative mt-2 block h-32 w-32 overflow-hidden rounded-lg">
                      <Image src={m.attachmentUrl} alt="Attachment" fill sizes="128px" className="object-cover" />
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
