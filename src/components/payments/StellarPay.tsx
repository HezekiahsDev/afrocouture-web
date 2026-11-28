'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw, TriangleAlert, Wallet } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { naira } from '@/lib/catalog';
import { getOrder, getStellarIntent, startStellarPayment } from '@/lib/orders';
import { getPaymentMethods } from '@/lib/payments';
import { cn } from '@/lib/utils';
import type { Order, PaymentMethods, StellarIntent } from '@/types';
import { InlineAlert, Spinner, fieldClass, ghostButton, labelClass, primaryButton } from '@/components/orders/ui';

const POLL_MS = 5_000;
const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;

/** Trims Horizon's trailing zeros: "40.1500000" → "40.15". */
const usdc = (amount: string) => amount.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');

function CopyField({ label, value, mono = true, emphasis = false }: { label: string; value: string; mono?: boolean; emphasis?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context): the value is still selectable.
    }
  }
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className={labelClass}>{label}</span>
      <div
        className={cn(
          'flex min-w-0 items-center gap-2 rounded-xl border bg-[#FFFFFF] px-3 py-2',
          emphasis ? 'border-[#B8734E]/60' : 'border-[#171717]/12',
        )}
      >
        <span className={cn('min-w-0 flex-1 select-all break-all text-sm text-[#171717]', mono && 'font-mono', emphasis && 'font-bold')}>
          {value}
        </span>
        <button type="button" onClick={copy} className="shrink-0 rounded-lg p-1.5 text-[#6B655C] hover:bg-[#171717]/5" aria-label={`Copy ${label.toLowerCase()}`}>
          {copied ? <Check size={15} className="text-[#2F6B4F]" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

function useCountdown(until: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [until]);
  if (!until) return { expired: false, label: '' };
  const left = Math.max(0, new Date(until).getTime() - now);
  const minutes = Math.floor(left / 60_000);
  const seconds = Math.floor((left % 60_000) / 1000);
  return { expired: left === 0, label: `${minutes}:${String(seconds).padStart(2, '0')}` };
}

/**
 * Pay a quoted order in USDC on Stellar. Shows the exact amount, address and memo, a link
 * that opens a Stellar wallet with everything filled in, and waits for the payment to land.
 */
export function StellarPay({ orderId, onPaid, onCancel }: { orderId: string; onPaid: () => void; onCancel?: () => void }) {
  const [intent, setIntent] = useState<StellarIntent | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromExchange, setFromExchange] = useState(false);
  const [refundAddress, setRefundAddress] = useState('');
  const [refundMemo, setRefundMemo] = useState('');
  const [refundSaved, setRefundSaved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const paidRef = useRef(false);
  const { expired, label: timeLeft } = useCountdown(intent?.status === 'awaiting' ? intent.expiresAt : undefined);

  const start = useCallback(
    async (options: { refundAddress?: string; refundMemo?: string } = {}) => {
      setLoading(true);
      setError('');
      try {
        const next = await startStellarPayment(orderId, options);
        setIntent(next);
        return next;
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not start the USDC payment. Please try again.'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch the quote when the panel opens
    void start();
  }, [start]);

  // Wait for the watcher to confirm the payment on the API.
  const intentId = intent?.id;
  useEffect(() => {
    if (!intentId) return;
    const timer = setInterval(async () => {
      try {
        const { orderStatus, intent: latest } = await getStellarIntent(orderId);
        if (latest && latest.id === intentId) setIntent(latest);
        if (latest?.status === 'rejected') setRejected(true);
        if (orderStatus !== 'quoted' && !paidRef.current) {
          paidRef.current = true;
          onPaid();
        }
      } catch {
        // Transient: try again on the next tick.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [intentId, orderId, onPaid]);

  async function saveRefund() {
    const address = refundAddress.trim().toUpperCase();
    if (!STELLAR_ADDRESS.test(address)) {
      setError('Enter the exchange’s Stellar deposit address (starts with G, 56 characters).');
      return;
    }
    const saved = await start({ refundAddress: address, refundMemo: refundMemo.trim() || undefined });
    if (saved) setRefundSaved(true);
  }

  if (!intent) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/60 p-4">
        {loading && (
          <p className="inline-flex items-center gap-2 text-sm text-[#6B655C]">
            <Spinner /> Getting your USDC quote…
          </p>
        )}
        {error && <InlineAlert>{error}</InlineAlert>}
        <div className="flex flex-wrap gap-2">
          {error && (
            <button type="button" className={ghostButton} onClick={() => start()}>
              <RefreshCw size={15} aria-hidden="true" /> Try again
            </button>
          )}
          {onCancel && (
            <button type="button" className={ghostButton} onClick={onCancel}>
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const waiting = intent.status === 'awaiting' && !expired;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/60 p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-[#6B655C]">
          Send exactly <strong className="text-lg text-[#171717]">{usdc(intent.amount)} USDC</strong> on Stellar
          <span className="block text-xs">
            for {naira(intent.nairaAmount)}
            {intent.network === 'testnet' && ' · Test network: use testnet USDC only'}
          </span>
        </p>
        {waiting && (
          <span className="text-xs font-semibold tabular-nums text-[#8F5637]" aria-label={`Quote valid for ${timeLeft}`}>
            Rate held for {timeLeft}
          </span>
        )}
      </div>

      <a href={intent.sep7Uri} className={cn(primaryButton, 'self-start')}>
        <Wallet size={16} aria-hidden="true" /> Open in Stellar wallet
      </a>
      <p className="-mt-2 text-xs text-[#6B655C]">Works with LOBSTR, Freighter and other Stellar wallets. Or copy the details below.</p>

      <div className="grid gap-3">
        <CopyField label="Amount (USDC)" value={usdc(intent.amount)} />
        <CopyField label="Send to address" value={intent.destination} />
        <CopyField label="Memo (required)" value={intent.memo} emphasis />
      </div>

      <div className="flex gap-2 rounded-xl border border-[#B8734E]/40 bg-[#B8734E]/10 p-3 text-xs text-[#6B4A2A]">
        <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Include the memo <strong className="font-mono">{intent.memo}</strong> exactly, and send USDC issued by Circle. Without the memo
          we can&apos;t match your payment to this order automatically.
        </p>
      </div>

      {!refundSaved && !intent.refundAddress && (
        <label className="flex items-start gap-2 text-sm text-[#171717]">
          <input type="checkbox" className="mt-1" checked={fromExchange} onChange={(e) => setFromExchange(e.target.checked)} />
          <span>
            I&apos;m paying from an exchange (Binance, Coinbase…)
            <span className="block text-xs text-[#6B655C]">Tell us where to send a refund, if one is ever needed.</span>
          </span>
        </label>
      )}
      {fromExchange && !refundSaved && !intent.refundAddress && (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end">
          <label className="flex min-w-0 flex-col gap-1">
            <span className={labelClass}>Your exchange deposit address</span>
            <input className={fieldClass} value={refundAddress} onChange={(e) => setRefundAddress(e.target.value)} placeholder="G…" autoComplete="off" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Deposit memo</span>
            <input className={fieldClass} value={refundMemo} onChange={(e) => setRefundMemo(e.target.value)} maxLength={28} autoComplete="off" />
          </label>
          <button type="button" className={ghostButton} onClick={saveRefund} disabled={loading}>
            {loading ? <Spinner /> : null} Save
          </button>
        </div>
      )}
      {(refundSaved || intent.refundAddress) && (
        <p className="text-xs text-[#2F6B4F]">Refunds, if any, go to your exchange address{intent.refundMemo ? ' with your memo' : ''}.</p>
      )}

      {waiting && (
        <p className="inline-flex items-center gap-2 text-sm text-[#6B655C]">
          <Spinner /> Waiting for your payment. This page updates on its own, usually within a few seconds of sending.
        </p>
      )}
      {intent.status === 'paid' && (
        <InlineAlert tone="success">
          Payment received.{' '}
          {intent.explorerUrl && (
            <a href={intent.explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              View transaction <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}
        </InlineAlert>
      )}
      {rejected && (
        <InlineAlert>
          Your payment didn&apos;t match this quote (too little, or the quote had changed), so we&apos;re sending the USDC back. Get a new
          quote and pay again.
        </InlineAlert>
      )}
      {(expired || intent.status === 'expired' || rejected) && (
        <div className="flex flex-col gap-2">
          {!rejected && (
            <p className="text-sm text-[#6B655C]">
              This rate has run out. If you already sent the payment, wait: it is still matched to your order. Otherwise get a new quote.
            </p>
          )}
          <button type="button" className={cn(ghostButton, 'self-start')} onClick={() => start()} disabled={loading}>
            {loading ? <Spinner /> : <RefreshCw size={15} aria-hidden="true" />} Get a new quote
          </button>
        </div>
      )}
      {error && <InlineAlert>{error}</InlineAlert>}
      {onCancel && intent.status !== 'paid' && (
        <button type="button" className="self-start text-xs font-semibold text-[#6B655C] underline" onClick={onCancel}>
          Pay another way
        </button>
      )}
    </div>
  );
}

/** Payment methods the API has switched on, loaded once per session. */
export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethods | null>(null);
  useEffect(() => {
    let live = true;
    void getPaymentMethods().then((m) => live && setMethods(m));
    return () => {
      live = false;
    };
  }, []);
  return methods;
}

/**
 * "Pay with USDC" button that opens the Stellar payment panel in place. Opens on its own
 * when the page URL has ?pay=stellar (checkout sends people here after creating the order).
 */
export function PayWithStellar({ order, onUpdate, disabled }: { order: Order; onUpdate: (o: Order) => void; disabled?: boolean }) {
  const methods = usePaymentMethods();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('pay') === 'stellar') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the query once after mount
      setOpen(true);
    }
  }, []);

  const refresh = useCallback(async () => {
    const latest = await getOrder(order.id);
    onUpdate(latest as Order);
  }, [order.id, onUpdate]);

  if (!methods?.stellar) return null;
  if (!open) {
    return (
      <button type="button" className={ghostButton} onClick={() => setOpen(true)} disabled={disabled}>
        <Wallet size={16} aria-hidden="true" /> Pay with USDC (Stellar)
      </button>
    );
  }
  return (
    <div className="basis-full">
      <StellarPay orderId={order.id} onPaid={refresh} onCancel={() => setOpen(false)} />
    </div>
  );
}
