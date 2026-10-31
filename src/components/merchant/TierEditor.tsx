'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_PRICE_TIERS, checkTiers, tierSummary, toTiers, type TierDraft } from './tiers';

const cell = cn(
  'w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 px-3 py-2 text-sm text-[#171717] tabular-nums',
  'outline-none focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)]',
);

/** Up to five "From N units → ₦price" breaks with live validation and a preview line. */
export function TierEditor({
  tiers,
  onChange,
  basePrice,
  unit,
  serverError,
}: {
  tiers: TierDraft[];
  onChange: (tiers: TierDraft[]) => void;
  basePrice: number | null;
  unit: 'yard' | 'bundle';
  serverError?: string;
}) {
  const problem = checkTiers(tiers, basePrice);
  const plural = unit === 'bundle' ? 'bundles' : 'yards';
  const update = (index: number, patch: Partial<TierDraft>) =>
    onChange(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  function addRow() {
    const last = tiers.at(-1);
    const nextQty = last && Number(last.minQuantity) ? Math.min(Number(last.minQuantity) * 2, 200) : 6;
    onChange([...tiers, { minQuantity: String(nextQty), price: '' }]);
  }

  return (
    <fieldset className="flex flex-col gap-3 sm:col-span-2" data-field-error={problem || serverError ? 'true' : undefined}>
      <legend className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
        Wholesale price breaks <span className="normal-case tracking-normal text-[#6B655C]">(optional)</span>
      </legend>
      <p className="-mt-1 text-xs leading-relaxed text-[#6B655C]">
        Reward bigger orders: from a quantity you choose, every {unit} costs less. Each break must be cheaper than the one
        before it and below your base price.
      </p>

      {tiers.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tiers.map((tier, index) => (
            <li
              key={index}
              className={cn(
                'grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border p-2',
                problem?.row === index ? 'border-[#9B2C24]/50 bg-[#F6E3E0]/10' : 'border-[#171717]/10 bg-[#FFFFFF]/40',
              )}
            >
              <span className="pl-1 text-xs text-[#6B655C]">From</span>
              <input
                aria-label={`Price break ${index + 1}: minimum ${plural}`}
                inputMode="numeric"
                value={tier.minQuantity}
                onChange={(e) => update(index, { minQuantity: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                className={cell}
              />
              <span className="text-xs text-[#6B655C]">{plural} → ₦</span>
              <input
                aria-label={`Price break ${index + 1}: price per ${unit}`}
                inputMode="numeric"
                value={tier.price}
                placeholder="price"
                onChange={(e) => update(index, { price: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                className={cell}
              />
              <button
                type="button"
                onClick={() => onChange(tiers.filter((_, i) => i !== index))}
                aria-label={`Remove price break ${index + 1}`}
                className="rounded-lg p-2 text-[#6B655C] hover:bg-[#171717]/5 hover:text-[#9B2C24]"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {tiers.length < MAX_PRICE_TIERS && (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-[#171717]/15 px-3.5 py-2 text-xs font-semibold text-[#8F5637] hover:border-[#B8734E]/50"
        >
          <Plus size={14} aria-hidden="true" /> Add a price break
        </button>
      )}

      {problem || serverError ? (
        <p className="text-xs text-[#9B2C24]" role="alert" data-testid="tier-error">
          {problem?.message ?? serverError}
        </p>
      ) : (
        basePrice !== null &&
        tiers.length > 0 && (
          <p className="rounded-xl bg-[#B8734E]/10 px-3.5 py-2.5 text-xs text-[#5C3B29]" data-testid="tier-preview">
            {tierSummary(basePrice, toTiers(tiers), unit)}
          </p>
        )
      )}
    </fieldset>
  );
}
