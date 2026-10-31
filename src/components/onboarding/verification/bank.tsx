'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { BadgeCheck, ChevronDown, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { getBanks, resolveAccount } from '@/lib/payments';
import { cn } from '@/lib/utils';
import type { Bank } from '@/types';
import { FieldShell, TextInput } from './fields';

export interface PayoutAccountValue {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

type PayoutField = keyof PayoutAccountValue;

interface BankFieldsProps {
  value: PayoutAccountValue;
  onChange: (patch: Partial<PayoutAccountValue>) => void;
  errors: Partial<Record<PayoutField, string>>;
  accountNameHint: string;
  disabled?: boolean;
}

const inputClass = cn(
  'w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 px-3.5 py-2.5 text-sm text-[#171717]',
  'placeholder:text-[#6B655C] outline-none transition-[border-color,box-shadow]',
  'focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)]',
  'disabled:cursor-not-allowed disabled:opacity-60',
);

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Searchable list of the banks Paystack can pay out to. */
function BankCombobox({
  banks,
  loading,
  loadError,
  onRetry,
  bankName,
  bankCode,
  onSelect,
  error,
  disabled,
}: {
  banks: Bank[];
  loading: boolean;
  loadError: string;
  onRetry: () => void;
  bankName: string;
  bankCode: string;
  onSelect: (bank: Bank) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = normalise(query);
    return q ? banks.filter((b) => normalise(b.name).includes(q)) : banks;
  }, [banks, query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function choose(bank: Bank) {
    onSelect(bank);
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && open && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // A name saved before bank codes existed has no code — ask for a pick from the list.
  const needsPick = Boolean(bankName && !bankCode);
  const shownError = error ?? (needsPick && !loading ? 'Choose your bank from the list so we can pay you.' : undefined);

  return (
    <FieldShell id={id} label="Bank" required error={shownError || loadError || undefined}>
      <div ref={wrapper} className="relative">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B655C]" aria-hidden="true" />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={shownError ? true : undefined}
          autoComplete="off"
          disabled={disabled || loading || Boolean(loadError)}
          value={open ? query : bankName}
          placeholder={loading ? 'Loading banks…' : 'Search for your bank'}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(inputClass, 'pl-9 pr-9', shownError && 'border-[#9B2C24]/60')}
        />
        {loading ? (
          <LoaderCircle size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#6B655C]" aria-hidden="true" />
        ) : (
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B655C]" aria-hidden="true" />
        )}
        {open && !loading && !loadError && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-[#171717]/12 bg-[#FFFFFF] p-1 shadow-[0_12px_32px_-4px_rgba(23,23,23,0.14)]"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[#6B655C]">No bank matches “{query}”.</li>
            ) : (
              matches.map((bank, index) => (
                <li
                  key={bank.code}
                  role="option"
                  aria-selected={bank.code === bankCode}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(bank)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    'cursor-pointer rounded-lg px-3 py-2 text-sm',
                    index === active ? 'bg-[#B8734E]/15 text-[#171717]' : 'text-[#4B453E]',
                    bank.code === bankCode && 'font-semibold text-[#8F5637]',
                  )}
                >
                  {bank.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {loadError && (
        <button type="button" onClick={onRetry} className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#8F5637] hover:underline">
          <RefreshCw size={12} aria-hidden="true" /> Try loading banks again
        </button>
      )}
    </FieldShell>
  );
}

type ResolveState = { status: 'idle' | 'resolving' | 'resolved' | 'error'; message?: string };

/**
 * Bank (from Paystack's list), account number, and the account name as the bank
 * reports it — looked up automatically so payouts go to the right person.
 */
export function BankFields({ value, onChange, errors, accountNameHint, disabled }: BankFieldsProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState('');
  const [banksAttempt, setBanksAttempt] = useState(0);
  const [resolveAttempt, setResolveAttempt] = useState(0);
  const key = value.bankCode && /^\d{10}$/.test(value.accountNumber) ? `${value.bankCode}:${value.accountNumber}` : '';
  // A saved account name for the saved key counts as already confirmed — no lookup on load.
  const confirmedKey = useRef(value.accountName ? key : '');
  const [resolve, setResolve] = useState<ResolveState>({ status: value.accountName && key ? 'resolved' : 'idle' });
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let cancelled = false;
    getBanks()
      .then((list) => {
        if (cancelled) return;
        setBanks(list);
        setBanksError('');
      })
      .catch((err) => {
        if (!cancelled) setBanksError(apiErrorMessage(err, 'Could not load the bank list.'));
      })
      .finally(() => {
        if (!cancelled) setBanksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [banksAttempt]);

  // Profiles saved before bank codes existed: match the stored name to Paystack's list.
  useEffect(() => {
    if (!banks.length || value.bankCode || !value.bankName) return;
    const match = banks.find((b) => normalise(b.name) === normalise(value.bankName));
    if (match) onChangeRef.current({ bankName: match.name, bankCode: match.code });
  }, [banks, value.bankCode, value.bankName]);

  useEffect(() => {
    if (!key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when the inputs become incomplete
      setResolve({ status: 'idle' });
      return;
    }
    if (key === confirmedKey.current) return;
    let cancelled = false;
    setResolve({ status: 'resolving' });
    const timer = setTimeout(() => {
      resolveAccount(value.accountNumber, value.bankCode)
        .then((name) => {
          if (cancelled) return;
          confirmedKey.current = key;
          setResolve({ status: 'resolved' });
          onChangeRef.current({ accountName: name });
        })
        .catch((err) => {
          if (!cancelled) setResolve({ status: 'error', message: apiErrorMessage(err, 'We could not check that account.') });
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, value.accountNumber, value.bankCode, resolveAttempt]);

  const accountError = errors.accountNumber ?? (resolve.status === 'error' ? resolve.message : undefined);

  return (
    <>
      <BankCombobox
        banks={banks}
        loading={banksLoading}
        loadError={banksError}
        onRetry={() => {
          setBanksLoading(true);
          setBanksAttempt((n) => n + 1);
        }}
        bankName={value.bankName}
        bankCode={value.bankCode}
        error={errors.bankCode ?? errors.bankName}
        disabled={disabled}
        onSelect={(bank) => {
          if (bank.code === value.bankCode) return;
          onChange({ bankName: bank.name, bankCode: bank.code, accountName: '' });
        }}
      />
      <TextInput
        label="Account number (NUBAN)"
        value={value.accountNumber}
        onChange={(next) => {
          const digits = next.replace(/\D/g, '').slice(0, 10);
          if (digits !== value.accountNumber) onChange({ accountNumber: digits, accountName: '' });
        }}
        inputMode="numeric"
        maxLength={10}
        placeholder="10-digit account number"
        required
        disabled={disabled}
        error={accountError}
        autoComplete="off"
      />
      <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2" data-field-error={errors.accountName ? 'true' : undefined}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
          Account name<span className="text-[#B8734E]"> *</span>
        </span>
        <div
          className={cn(
            'flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm',
            resolve.status === 'resolved' && value.accountName
              ? 'border-[#2F6B4F]/30 bg-[#2F6B4F]/10 text-[#171717]'
              : 'border-[#171717]/12 bg-[#FFFFFF]/50 text-[#6B655C]',
          )}
          aria-live="polite"
          data-testid="account-name"
        >
          {resolve.status === 'resolving' ? (
            <>
              <LoaderCircle size={15} className="animate-spin text-[#B8734E]" aria-hidden="true" /> Checking the account…
            </>
          ) : resolve.status === 'resolved' && value.accountName ? (
            <>
              <BadgeCheck size={16} className="shrink-0 text-[#2F6B4F]" aria-hidden="true" />
              <span className="min-w-0 truncate font-semibold">{value.accountName}</span>
            </>
          ) : resolve.status === 'error' ? (
            <span className="flex flex-wrap items-center gap-2">
              Not confirmed yet.
              <button
                type="button"
                onClick={() => setResolveAttempt((n) => n + 1)}
                className="inline-flex items-center gap-1 font-semibold text-[#8F5637] hover:underline"
              >
                <RefreshCw size={12} aria-hidden="true" /> Check again
              </button>
            </span>
          ) : (
            'Choose your bank and enter the account number — we’ll look up the name.'
          )}
        </div>
        {errors.accountName ? (
          <p className="text-xs text-[#9B2C24]" role="alert">
            {errors.accountName}
          </p>
        ) : (
          <p className="text-[11px] leading-relaxed text-[#6B655C]">
            {resolve.status === 'resolved' && value.accountName ? 'Not you? Check the account number and bank. ' : ''}
            {accountNameHint}
          </p>
        )}
      </div>
    </>
  );
}
