import api from './api';
import type { Bank, PaymentMethods, PriceTier, StellarAddressCheck } from '@/types';

let banksCache: Promise<Bank[]> | null = null;
let methodsCache: Promise<PaymentMethods> | null = null;

/** Nigerian banks Paystack can pay out to (cached for the session). */
export function getBanks(): Promise<Bank[]> {
  banksCache ??= api
    .get<Bank[]>('/payments/banks')
    .then((r) => r.data)
    .catch((err) => {
      banksCache = null;
      throw err;
    });
  return banksCache;
}

/** The account holder's name as the bank has it, for the person to confirm. */
export async function resolveAccount(accountNumber: string, bankCode: string): Promise<string> {
  const { data } = await api.get<{ accountName: string }>('/payments/resolve-account', {
    params: { accountNumber, bankCode },
  });
  return data.accountName;
}

/** Mirrors IPILE-api/src/fabrics/pricing.ts so the explorer shows the price the order will charge. */
export function unitPriceFor(fabric: { price: number; priceTiers?: PriceTier[] | null }, quantity: number): number {
  let unit = fabric.price;
  for (const tier of fabric.priceTiers ?? []) {
    if (quantity >= tier.minQuantity && tier.price < unit) unit = tier.price;
  }
  return unit;
}

/** Which payment and payout methods are switched on (cached for the session). */
export function getPaymentMethods(): Promise<PaymentMethods> {
  methodsCache ??= api
    .get<PaymentMethods>('/payments/methods')
    .then((r) => r.data)
    .catch(() => {
      methodsCache = null;
      return { paystack: true, stellar: false, stellarPayouts: false, stellarNetwork: null };
    });
  return methodsCache;
}

/** Whether USDC can be paid out to this Stellar address (it exists and accepts USDC). */
export async function checkStellarAddress(address: string): Promise<StellarAddressCheck> {
  const { data } = await api.get<StellarAddressCheck>('/payments/stellar/check-address', { params: { address } });
  return data;
}
