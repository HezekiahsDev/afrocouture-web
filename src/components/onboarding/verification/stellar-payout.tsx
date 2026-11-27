'use client';

import { useId, useState } from 'react';
import { BadgeCheck, CircleAlert, LoaderCircle } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { checkStellarAddress } from '@/lib/payments';
import { cn } from '@/lib/utils';
import type { PayoutMethod } from '@/types';
import { usePaymentMethods } from '@/components/payments/StellarPay';

export interface StellarPayoutValue {
  payoutMethod: PayoutMethod;
  stellarAddress: string;
  stellarMemo: string;
}

const inputClass = cn(
  'w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 px-3.5 py-2.5 text-sm text-[#171717]',
  'placeholder:text-[#6B655C] outline-none transition-[border-color,box-shadow]',
  'focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)]',
  'disabled:cursor-not-allowed disabled:opacity-60',
);
const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;

type Check = { status: 'idle' } | { status: 'checking' } | { status: 'ok' } | { status: 'error'; message: string };

/**
 * Lets an artisan or merchant take payouts in USDC on Stellar instead of naira to their bank.
 * Hidden unless Stellar payouts are switched on (or already chosen). The bank account above
 * stays required as a fallback.
 */
export function StellarPayoutFields({
  value,
  onChange,
  disabled,
}: {
  value: StellarPayoutValue;
  onChange: (patch: Partial<StellarPayoutValue>) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const methods = usePaymentMethods();
  const [check, setCheck] = useState<Check>({ status: 'idle' });

  if (!methods?.stellarPayouts && value.payoutMethod !== 'stellar') return null;

  async function verify() {
    const address = value.stellarAddress.trim().toUpperCase();
    if (!STELLAR_ADDRESS.test(address)) {
      setCheck({ status: 'error', message: 'That is not a Stellar address (it starts with G and has 56 characters).' });
      return;
    }
    setCheck({ status: 'checking' });
    try {
      const result = await checkStellarAddress(address);
      setCheck(result.ok ? { status: 'ok' } : { status: 'error', message: result.message });
    } catch (err) {
      setCheck({ status: 'error', message: apiErrorMessage(err, 'Could not check the address. Try again.') });
    }
  }

  const stellar = value.payoutMethod === 'stellar';
  return (
    <fieldset className="flex flex-col gap-3 sm:col-span-2" disabled={disabled}>
      <legend className="mb-1 text-sm font-semibold text-[#171717]">How do you want to be paid?</legend>
      <div className="flex flex-wrap gap-4">
        {(
          [
            ['bank', 'Naira to my bank account'],
            ['stellar', 'USDC on Stellar'],
          ] as const
        ).map(([method, label]) => (
          <label key={method} className="flex items-center gap-2 text-sm text-[#171717]">
            <input
              type="radio"
              name={`${id}-method`}
              checked={value.payoutMethod === method}
              onChange={() => onChange({ payoutMethod: method })}
              disabled={method === 'stellar' && !methods?.stellarPayouts}
            />
            {label}
          </label>
        ))}
      </div>
      {stellar && (
        <>
          <p className="text-xs leading-5 text-[#6B655C]">
            We convert what you&apos;re owed in naira to USDC at the rate on the day we pay you. Your Stellar account must accept USDC
            (add the Circle USDC asset in LOBSTR or Freighter). Keep your bank details above as a fallback.
          </p>
          <label className="flex min-w-0 flex-col gap-1.5" htmlFor={`${id}-address`}>
            <span className="text-sm font-medium text-[#171717]">Stellar address</span>
            <div className="flex gap-2">
              <input
                id={`${id}-address`}
                className={cn(inputClass, 'font-mono')}
                value={value.stellarAddress}
                placeholder="G…"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  onChange({ stellarAddress: e.target.value.trim().toUpperCase() });
                  setCheck({ status: 'idle' });
                }}
              />
              <button
                type="button"
                onClick={verify}
                className="shrink-0 rounded-xl border border-[#171717]/15 px-3 text-sm font-semibold text-[#171717] hover:border-[#B8734E]/40"
              >
                {check.status === 'checking' ? <LoaderCircle size={15} className="animate-spin" aria-label="Checking" /> : 'Check'}
              </button>
            </div>
          </label>
          {check.status === 'ok' && (
            <p className="inline-flex items-center gap-1.5 text-xs text-[#2F6B4F]">
              <BadgeCheck size={14} aria-hidden="true" /> This account can receive USDC.
            </p>
          )}
          {check.status === 'error' && (
            <p className="inline-flex items-center gap-1.5 text-xs text-[#9B2C24]" role="alert">
              <CircleAlert size={14} aria-hidden="true" /> {check.message}
            </p>
          )}
          <label className="flex min-w-0 flex-col gap-1.5" htmlFor={`${id}-memo`}>
            <span className="text-sm font-medium text-[#171717]">Memo (only if your exchange gave you one)</span>
            <input
              id={`${id}-memo`}
              className={inputClass}
              value={value.stellarMemo}
              maxLength={28}
              autoComplete="off"
              onChange={(e) => onChange({ stellarMemo: e.target.value })}
            />
          </label>
        </>
      )}
    </fieldset>
  );
}
