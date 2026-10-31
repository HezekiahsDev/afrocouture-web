import type { PriceTier } from '@/types';

export const MAX_PRICE_TIERS = 5;

/** Editable tier row — strings until the merchant finishes typing. */
export interface TierDraft {
  minQuantity: string;
  price: string;
}

/**
 * Mirrors IPILE-api/src/fabrics/price-tiers.ts plus the DTO bounds, so the
 * merchant sees the same message before saving. Returns a message per row (or a
 * general one at index -1), or null when the tiers are valid.
 */
export function checkTiers(drafts: TierDraft[], basePrice: number | null): { row: number; message: string } | null {
  if (drafts.length > MAX_PRICE_TIERS) return { row: -1, message: `Add at most ${MAX_PRICE_TIERS} price breaks.` };
  const parsed = drafts.map((d, row) => ({ row, minQuantity: Number(d.minQuantity), price: Number(d.price), raw: d }));

  for (const t of parsed) {
    if (!t.raw.minQuantity.trim() || !t.raw.price.trim()) {
      return { row: t.row, message: 'Fill in both the quantity and the price, or remove this row.' };
    }
    if (!Number.isInteger(t.minQuantity) || t.minQuantity < 2 || t.minQuantity > 200) {
      return { row: t.row, message: 'Quantities must be whole numbers from 2 to 200.' };
    }
    if (!Number.isInteger(t.price) || t.price < 100) {
      return { row: t.row, message: 'Enter a price of at least ₦100.' };
    }
  }

  const sorted = [...parsed].sort((a, b) => a.minQuantity - b.minQuantity);
  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const prev = sorted[i - 1];
    if (basePrice !== null && tier.price >= basePrice) {
      return {
        row: tier.row,
        message: `The price for ${tier.minQuantity}+ must be lower than the base price of ₦${basePrice.toLocaleString('en-NG')}.`,
      };
    }
    if (prev && tier.minQuantity === prev.minQuantity) {
      return { row: tier.row, message: `There are two price breaks for ${tier.minQuantity}+. Keep one.` };
    }
    if (prev && tier.price >= prev.price) {
      return {
        row: tier.row,
        message: `Larger quantities should cost less: ${tier.minQuantity}+ must be cheaper than ${prev.minQuantity}+.`,
      };
    }
  }
  return null;
}

export function toTiers(drafts: TierDraft[]): PriceTier[] {
  return drafts
    .map((d) => ({ minQuantity: Number(d.minQuantity), price: Number(d.price) }))
    .sort((a, b) => a.minQuantity - b.minQuantity);
}

/** "1–5 yards ₦8,500 · 6–11 ₦8,000 · 12+ ₦7,500" */
export function tierSummary(basePrice: number, tiers: PriceTier[], unit: 'yard' | 'bundle'): string {
  const plural = unit === 'bundle' ? 'bundles' : 'yards';
  const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  const fmt = (n: number) => `₦${n.toLocaleString('en-NG')}`;
  if (!sorted.length) return `${fmt(basePrice)} per ${unit}`;
  const parts = [`1–${sorted[0].minQuantity - 1} ${plural} ${fmt(basePrice)}`];
  sorted.forEach((tier, i) => {
    const next = sorted[i + 1];
    const range = next ? `${tier.minQuantity}–${next.minQuantity - 1}` : `${tier.minQuantity}+`;
    parts.push(`${range} ${fmt(tier.price)}`);
  });
  return parts.join(' · ');
}
