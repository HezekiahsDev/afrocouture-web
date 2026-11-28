'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Link2, RefreshCw, Undo2, X } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { attachDeposit, dismissDeposit, getStellarTreasury, getUnmatchedDeposits, refundDeposit } from '@/lib/orders';
import type { StellarTreasury, StellarUnmatchedDeposit, StellarUnmatchedStatus } from '@/types';
import { Alert, Chips, Empty, Facts, Loading, Panel, Pill, fmtDate } from './ui';

const REASON: Record<StellarUnmatchedDeposit['reason'], string> = {
  no_memo: 'No memo',
  unknown_memo: 'Memo matches no checkout',
  wrong_asset: 'Not Circle USDC',
};
const STATUS_TONE: Record<StellarUnmatchedStatus, 'neutral' | 'blue' | 'green' | 'amber' | 'red'> = {
  open: 'amber',
  attached: 'green',
  refund_pending: 'blue',
  refunded: 'green',
  refund_failed: 'red',
  dismissed: 'neutral',
};
const explorer = (network: string, hash: string) => `https://stellar.expert/explorer/${network}/tx/${hash}`;
const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-6)}`;

function TreasuryCard({ treasury }: { treasury: StellarTreasury | null }) {
  if (!treasury) return <Loading label="Loading treasury" />;
  if (!treasury.configured) {
    return <Empty>Stellar is not configured. Set STELLAR_OPERATING_PUBLIC and STELLAR_USDC_ISSUER on the API.</Empty>;
  }
  return (
    <div className="flex flex-col gap-3">
      {treasury.warnings.map((w) => (
        <Alert key={w}>{w}</Alert>
      ))}
      <Facts
        rows={[
          ['Network', treasury.network === 'public' ? 'Mainnet' : 'Testnet'],
          ['Checkout', treasury.checkoutEnabled ? 'On' : 'Off'],
          ['Payouts', treasury.payoutsEnabled ? 'On' : 'Off'],
          ['Signing key', treasury.canSign ? 'Loaded' : 'Missing (refunds and payouts fail)'],
          ['Operating account', treasury.operatingAddress ? <span className="break-all font-mono text-xs">{treasury.operatingAddress}</span> : '—'],
          ['USDC balance', treasury.usdc ?? '—'],
          ['XLM (fees)', `${treasury.xlm ?? '—'} (alert below ${treasury.minXlm})`],
          ['Owed to pending payouts', `${treasury.pendingPayoutsUsdc} USDC`],
          ['Float limit', treasury.floatMaxUsdc ? `${treasury.floatMaxUsdc} USDC` : 'Not set'],
        ]}
      />
    </div>
  );
}

function DepositRow({ deposit, network, onDone }: { deposit: StellarUnmatchedDeposit; network: string; onDone: (message: string) => void }) {
  const [mode, setMode] = useState<'idle' | 'attach' | 'refund' | 'dismiss'>('idle');
  const [reference, setReference] = useState('');
  const [address, setAddress] = useState(deposit.fromAddress);
  const [memo, setMemo] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const usdc = deposit.assetCode === 'USDC' && deposit.reason !== 'wrong_asset';
  const actionable = deposit.status === 'open' || deposit.status === 'refund_failed';

  async function run(fn: () => Promise<string>) {
    setBusy(true);
    setError('');
    try {
      onDone(await fn());
      setMode('idle');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-bold tabular-nums text-[#171717]">
          {Number(deposit.amount)} {deposit.assetCode ?? 'XLM'}
        </span>
        <Pill tone={STATUS_TONE[deposit.status]}>{deposit.status.replace('_', ' ')}</Pill>
        <span className="text-xs text-[#6B655C]">{REASON[deposit.reason]}</span>
        <span className="text-xs text-[#6B655C]">· {fmtDate(deposit.receivedAt)}</span>
      </div>
      <p className="text-xs text-[#6B655C]">
        From <span className="font-mono">{short(deposit.fromAddress)}</span>
        {deposit.memo && (
          <>
            {' '}
            · memo <span className="font-mono">{deposit.memo}</span>
          </>
        )}{' '}
        ·{' '}
        <a href={explorer(network, deposit.txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#8F5637] hover:underline">
          transaction <ExternalLink size={11} aria-hidden="true" />
        </a>
        {deposit.refundTxHash && (
          <>
            {' '}
            ·{' '}
            <a href={explorer(network, deposit.refundTxHash)} target="_blank" rel="noreferrer" className="text-[#8F5637] hover:underline">
              refund
            </a>
          </>
        )}
      </p>
      {deposit.note && <p className="text-xs text-[#6B655C]">{deposit.note}</p>}

      {actionable && mode === 'idle' && (
        <div className="flex flex-wrap gap-2">
          {usdc && deposit.status === 'open' && (
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => setMode('attach')}>
              <Link2 size={14} aria-hidden="true" /> Attach to order
            </button>
          )}
          {usdc && (
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => setMode('refund')}>
              <Undo2 size={14} aria-hidden="true" /> Refund
            </button>
          )}
          <button type="button" className="btn-ghost px-3 py-2" onClick={() => setMode('dismiss')}>
            <X size={14} aria-hidden="true" /> Dismiss
          </button>
        </div>
      )}

      {mode === 'attach' && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              const { outcome } = await attachDeposit(deposit.id, reference);
              return outcome === 'paid'
                ? `Attached to ${reference.toUpperCase()}: the order is paid.`
                : outcome === 'refunded'
                  ? `It didn't cover ${reference.toUpperCase()}, so a refund to the sender has started.`
                  : 'That payment was already applied.';
            });
          }}
        >
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#6B655C]">
            Order reference
            <input className="rounded-xl border border-[#171717]/15 px-3 py-2 font-mono text-sm" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="AC-7F3K2Q" required />
          </label>
          <button type="submit" className="btn-primary" disabled={busy}>
            Attach
          </button>
          <button type="button" className="btn-ghost px-3 py-2" onClick={() => setMode('idle')}>
            Cancel
          </button>
        </form>
      )}

      {mode === 'refund' && (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              const result = await refundDeposit(deposit.id, address.trim(), memo.trim());
              return result.status === 'refunded'
                ? `Refunded ${Number(deposit.amount)} USDC.`
                : result.status === 'refund_pending'
                  ? 'Refund sent; waiting for the network to confirm it.'
                  : `Refund failed: ${result.note ?? 'unknown reason'}`;
            });
          }}
        >
          <p className="text-xs text-[#9B2C24]">
            If the sender is an exchange, refunding to its address without the customer&apos;s deposit memo loses the money. Ask the customer
            for their deposit address and memo first.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-[#6B655C]">
              Refund to address
              <input className="rounded-xl border border-[#171717]/15 px-3 py-2 font-mono text-xs" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#6B655C]">
              Memo
              <input className="w-40 rounded-xl border border-[#171717]/15 px-3 py-2 text-sm" value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={28} />
            </label>
            <button type="submit" className="btn-primary" disabled={busy}>
              Send refund
            </button>
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => setMode('idle')}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'dismiss' && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await dismissDeposit(deposit.id, note);
              return 'Dismissed.';
            });
          }}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-[#6B655C]">
            Why (e.g. returned by hand, tx hash)
            <input className="rounded-xl border border-[#171717]/15 px-3 py-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} minLength={5} required />
          </label>
          <button type="submit" className="btn-primary" disabled={busy}>
            Dismiss
          </button>
          <button type="button" className="btn-ghost px-3 py-2" onClick={() => setMode('idle')}>
            Cancel
          </button>
        </form>
      )}
      {error && <Alert>{error}</Alert>}
    </li>
  );
}

/** Admin: Stellar treasury health and payments that didn't match a checkout. */
export function StellarPanel() {
  const [treasury, setTreasury] = useState<StellarTreasury | null>(null);
  const [status, setStatus] = useState<'open' | 'refund_failed' | 'all'>('open');
  const [deposits, setDeposits] = useState<StellarUnmatchedDeposit[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    setDeposits(null);
    try {
      const [t, d] = await Promise.all([getStellarTreasury(), getUnmatchedDeposits(status)]);
      setTreasury(t);
      setDeposits(d);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load Stellar data.'));
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when the filter changes
    void load();
  }, [load]);

  const network = treasury?.configured ? treasury.network : 'testnet';
  return (
    <div className="flex flex-col gap-6">
      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      <Panel
        title="Treasury"
        actions={
          <button type="button" onClick={load} className="btn-ghost px-3 py-2" aria-label="Refresh Stellar data">
            <RefreshCw size={14} aria-hidden="true" /> Refresh
          </button>
        }
      >
        <TreasuryCard treasury={treasury} />
      </Panel>
      <Panel title="Unmatched deposits">
        <div className="mb-4">
          <Chips
            label="Deposit status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'refund_failed', label: 'Refund failed' },
              { value: 'all', label: 'All' },
            ]}
          />
        </div>
        {!deposits && !error && <Loading label="Loading deposits" />}
        {deposits?.length === 0 && <Empty>Nothing to sort out.</Empty>}
        {deposits && deposits.length > 0 && (
          <ul className="grid gap-3">
            {deposits.map((d) => (
              <DepositRow
                key={d.id}
                deposit={d}
                network={network}
                onDone={(message) => {
                  setNotice(message);
                  void load();
                }}
              />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
