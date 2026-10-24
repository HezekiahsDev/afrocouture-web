'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { apiErrorMessage } from '@/lib/api';
import { listOrders, verifyPayment } from '@/lib/orders';
import { naira } from '@/lib/catalog';
import type { Order } from '@/types';
import { PAYING_ORDER_KEY } from './OrderDetail';
import { card, ghostButton, primaryButton } from './ui';

type State =
  | { kind: 'verifying' }
  | { kind: 'paid'; order: Order }
  | { kind: 'failed'; message: string; orderId: string | null };

/** Paystack sends people back here with ?reference= (and ?trxref=). */
export default function PaymentCallback({ reference, cancelled }: { reference?: string; cancelled?: boolean }) {
  return (
    <RequireAuth>
      <Verify reference={reference} cancelled={cancelled} />
    </RequireAuth>
  );
}

/** Our references look like "AC-7F3K2Q-2": the order reference plus the attempt number. */
const orderReferenceOf = (paymentReference: string) => paymentReference.split('-').slice(0, 2).join('-');

async function findOrderId(reference: string): Promise<string | null> {
  const stored = sessionStorage.getItem(PAYING_ORDER_KEY);
  if (stored) return stored;
  const orders = await listOrders({ role: 'customer' });
  return orders.find((o) => o.reference === orderReferenceOf(reference))?.id ?? null;
}

function Verify({ reference, cancelled }: { reference?: string; cancelled?: boolean }) {
  const [state, setState] = useState<State>({ kind: 'verifying' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      if (!reference) {
        setState({ kind: 'failed', message: 'This link is missing the payment reference.', orderId: null });
        return;
      }
      let orderId: string | null = null;
      try {
        orderId = await findOrderId(reference);
        if (!orderId) throw new Error('We could not match this payment to one of your orders.');
        if (cancelled) {
          setState({ kind: 'failed', message: 'You cancelled the payment. Nothing was charged.', orderId });
          return;
        }
        // Verifying is idempotent, so refreshing this page is safe.
        const order = await verifyPayment(orderId, reference);
        sessionStorage.removeItem(PAYING_ORDER_KEY);
        setState({ kind: 'paid', order });
      } catch (err) {
        setState({
          kind: 'failed',
          message: err instanceof Error && !('isAxiosError' in err) ? err.message : apiErrorMessage(err, 'We could not confirm the payment.'),
          orderId,
        });
      }
    })();
  }, [reference, cancelled]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center py-12">
      <div className={`${card} flex w-full flex-col items-center gap-4 text-center`}>
        {state.kind === 'verifying' && (
          <>
            <LoaderCircle size={36} className="animate-spin text-[#00A3FF]" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Confirming your payment…</h1>
            <p className="text-sm text-[#94A3B8]">This takes a few seconds. Please don&apos;t close the page.</p>
          </>
        )}
        {state.kind === 'paid' && (
          <>
            <CheckCircle2 size={40} className="text-[#10B981]" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Payment received</h1>
            <p className="text-sm text-[#94A3B8]">
              {naira(state.order.totalAmount)} is held by AfroCouture until you approve the finished piece. Your artisan
              has been told to start.
            </p>
            <Link href={`/orders/${state.order.id}`} className={primaryButton}>
              View your order
            </Link>
          </>
        )}
        {state.kind === 'failed' && (
          <>
            <CircleAlert size={40} className="text-[#ffb4ab]" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Payment not confirmed</h1>
            <p className="text-sm text-[#94A3B8]">{state.message}</p>
            {state.orderId ? (
              <Link href={`/orders/${state.orderId}`} className={primaryButton}>
                Back to the order
              </Link>
            ) : (
              <Link href="/orders" className={ghostButton}>
                Your orders
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
