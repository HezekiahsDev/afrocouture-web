'use client';

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Portrait } from '@/components/marketplace/shared';
import { apiErrorMessage } from '@/lib/api';
import { naira } from '@/lib/catalog';
import {
  advanceMilestone,
  approveOrder,
  cancelOrder,
  declineOrder,
  disputeOrder,
  getOrder,
  isMerchantView,
  markDelivered,
  MILESTONES,
  quoteOrder,
  receiveItem,
  shipItem,
  startPayment,
} from '@/lib/orders';
import { cn } from '@/lib/utils';
import type { MerchantOrderView, Order, OrderItem, OrderMilestone } from '@/types';
import { OrderChat } from './OrderChat';
import { ReviewCard, StarPicker } from './ReviewCard';
import { markNotificationsRead } from '@/lib/notifications';
import {
  card,
  dangerButton,
  fieldClass,
  formatDate,
  ghostButton,
  InlineAlert,
  labelClass,
  MoneyRow,
  OrderTracker,
  primaryButton,
  SectionCard,
  Spinner,
  StatusPill,
  useAction,
} from './ui';

export const PAYING_ORDER_KEY = 'IPILE:paying-order';

export default function OrderDetail({ id }: { id: string }) {
  return (
    <RequireAuth>
      <OrderLoader id={id} />
    </RequireAuth>
  );
}

function OrderLoader({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | MerchantOrderView | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      setOrder(await getOrder(id));
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load this order.'));
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    void reload();
  }, [reload]);

  // Opening the order clears its notifications (quote ready, new message, …).
  const loaded = order !== null;
  useEffect(() => {
    if (loaded) markNotificationsRead({ orderId: id }).catch(() => undefined);
  }, [loaded, id]);

  if (error && !order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-16">
        <InlineAlert>{error}</InlineAlert>
        <Link href="/orders" className={ghostButton}>
          <ArrowLeft size={16} /> Back to orders
        </Link>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#6B655C]" role="status">
        <Spinner label="Loading order" />
      </div>
    );
  }
  return isMerchantView(order) ? (
    <MerchantOrder order={order} reload={reload} />
  ) : (
    <FullOrder order={order} reload={reload} onUpdate={setOrder} />
  );
}

/* ───────────────────────── Shared layout ───────────────────────── */

function OrderHeader({
  reference,
  status,
  garmentType,
  createdAt,
  estimatedDeliveryDate,
}: {
  reference: string;
  status: Order['status'];
  garmentType: string;
  createdAt: string;
  estimatedDeliveryDate?: string | null;
}) {
  return (
    <header className="flex flex-col gap-3">
      <Link href="/orders" className="back-link">
        <ArrowLeft size={16} /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-[family-name:var(--font-inter)] text-sm font-semibold tracking-wide text-[#6B655C]">
          {reference}
        </span>
        <StatusPill status={status} />
      </div>
      <h1 className="text-[28px] font-extrabold leading-9 text-[#171717] sm:text-[36px] sm:leading-[44px]">{garmentType}</h1>
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6B655C]">
        <span>Requested {formatDate(createdAt)}</span>
        {estimatedDeliveryDate && (
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" /> Ready by {formatDate(estimatedDeliveryDate)}
          </span>
        )}
      </p>
    </header>
  );
}

function Timeline({ events }: { events: Order['events'] }) {
  if (!events.length) return null;
  return (
    <SectionCard title="Timeline" kicker="History">
      <ol className="relative flex flex-col gap-4 border-l border-[#171717]/12 pl-5">
        {[...events].reverse().map((event) => (
          <li key={event.id} className="relative">
            <span
              className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#B8734E] bg-[#F5F0E8]"
              aria-hidden="true"
            />
            <p className="text-sm text-[#171717]">{event.label}</p>
            <p className="text-xs text-[#6B655C]">{formatDate(event.createdAt, true)}</p>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

function FabricLines({
  items,
  action,
}: {
  items: OrderItem[];
  action?: (item: OrderItem) => ReactNode;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#171717]/10 p-3">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FFFFFF]">
            <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#171717]">{item.fabricName}</span>
            <span className="block text-xs text-[#6B655C]">
              {item.quantity} {item.unit}
              {item.quantity === 1 ? '' : 's'} × {naira(item.unitPrice)} ={' '}
              <strong className="text-[#171717]">{naira(item.lineTotal)}</strong>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-xs">
              <FulfilmentTag item={item} />
            </span>
            {item.shippingNote && <span className="mt-1 block text-xs text-[#6B655C]">Shipping note: {item.shippingNote}</span>}
          </span>
          {action?.(item)}
        </li>
      ))}
    </ul>
  );
}

function FulfilmentTag({ item }: { item: OrderItem }) {
  if (item.fulfilment === 'received')
    return (
      <span className="flex items-center gap-1 text-[#2F6B4F]">
        <CheckCircle2 size={13} aria-hidden="true" /> Received by the artisan {formatDate(item.receivedAt)}
      </span>
    );
  if (item.fulfilment === 'shipped')
    return (
      <span className="flex items-center gap-1 text-[#8F5637]">
        <Truck size={13} aria-hidden="true" /> Shipped {formatDate(item.shippedAt)}
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[#6B655C]">
      <Package size={13} aria-hidden="true" /> Waiting to ship
    </span>
  );
}

/** Small inline form used for decline / dispute reasons. */
function ReasonForm({
  label,
  placeholder,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
  danger,
}: {
  label: string;
  placeholder: string;
  submitLabel: string;
  busy: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  const [reason, setReason] = useState('');
  const short = reason.trim().length < 5;
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!short) onSubmit(reason.trim());
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{label}</span>
        <textarea
          className={cn(fieldClass, 'min-h-24')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          maxLength={1000}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={short || busy} className={danger ? dangerButton : primaryButton}>
          {busy && <Spinner />} {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={ghostButton}>
          Keep it
        </button>
      </div>
    </form>
  );
}

/* ───────────────────────── Customer / artisan / admin view ───────────────────────── */

function FullOrder({
  order,
  reload,
  onUpdate,
}: {
  order: Order;
  reload: () => Promise<void>;
  onUpdate: (order: Order) => void;
}) {
  const { user } = useAuth();
  const role = order.viewerRole;
  const otherName =
    role === 'tailor'
      ? (order.customer.fullName ?? 'the customer')
      : (order.tailor?.displayName ?? order.tailor?.atelierName ?? 'your artisan');
  const chatClosed =
    order.status === 'declined' || order.status === 'cancelled'
      ? `This ${order.status === 'declined' ? 'request was declined' : 'request was cancelled'}, so the conversation is closed.`
      : undefined;
  const showChat = role === 'customer' || role === 'tailor';
  const paid = Boolean(order.paidAt);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-8 sm:py-12">
      <OrderHeader
        reference={order.reference}
        status={order.status}
        garmentType={order.garmentType}
        createdAt={order.createdAt}
        estimatedDeliveryDate={order.estimatedDeliveryDate}
      />

      <div className={cn(card, 'pb-4')}>
        <OrderTracker status={order.status} milestone={order.milestone} />
      </div>

      <div className={cn('grid gap-6', showChat && 'lg:grid-cols-[minmax(0,1fr)_400px]')}>
        <div className="flex min-w-0 flex-col gap-6">
          {role === 'customer' && <CustomerActions order={order} onUpdate={onUpdate} />}
          {role === 'tailor' && <TailorActions order={order} onUpdate={onUpdate} />}
          {role === 'admin' && (
            <InlineAlert tone="info">
              You are viewing this order as an admin.{' '}
              <Link href="/admin" className="font-semibold underline">
                Open the admin console
              </Link>{' '}
              to resolve disputes or retry payouts.
            </InlineAlert>
          )}

          {(order.status === 'completed' || order.status === 'refunded') && <ReviewCard order={order} onUpdate={onUpdate} />}

          <PartiesCard order={order} />

          {(order.status !== 'requested' || order.items.length > 0) && <PriceCard order={order} />}

          {paid && <EscrowCard order={order} />}

          {order.items.length > 0 && (
            <SectionCard title="Fabric" kicker="Shipped to the artisan">
              <FabricLines
                items={order.items}
                action={
                  role === 'tailor' && (order.status === 'paid' || order.status === 'in_progress')
                    ? (item) => <ReceiveButton order={order} item={item} onUpdate={onUpdate} />
                    : undefined
                }
              />
            </SectionCard>
          )}

          <BriefCard order={order} />
          <FitCard order={order} />
          <Timeline events={order.events} />
        </div>

        {showChat && user && (
          <div className="lg:sticky lg:top-[104px] lg:self-start">
            <OrderChat
              orderId={order.id}
              myId={user.id}
              otherName={otherName}
              closedReason={chatClosed}
              onOrderUpdated={() => void reload()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PartiesCard({ order }: { order: Order }) {
  const tailorName = order.tailor?.displayName ?? order.tailor?.atelierName ?? 'Artisan';
  return (
    <section className={cn(card, 'flex flex-wrap items-center gap-4')}>
      <span className="overflow-hidden rounded-full">
        <Portrait src={order.tailor?.portraitUrl ?? null} name={tailorName} size={48} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#8F5637]">{order.tailor?.atelierName}</p>
        <Link href={`/tailors/${order.tailorId}`} className="font-semibold text-[#171717] hover:text-[#8F5637]">
          {tailorName}
        </Link>
        {order.tailor?.city && (
          <p className="flex items-center gap-1 text-xs text-[#6B655C]">
            <MapPin size={12} aria-hidden="true" /> {order.tailor.city}
          </p>
        )}
      </div>
      <div className="text-right text-sm">
        <p className="text-xs text-[#6B655C]">Customer</p>
        <p className="text-[#171717]">{order.customer.fullName ?? 'Customer'}</p>
      </div>
    </section>
  );
}

function PriceCard({ order }: { order: Order }) {
  const quoted = order.workmanshipPrice !== null;
  return (
    <SectionCard title={quoted ? 'Quote' : 'Fabric so far'} kicker={quoted ? `Sent ${formatDate(order.quotedAt)}` : 'Price'}>
      {quoted && <MoneyRow label="Workmanship" amount={order.workmanshipPrice!} />}
      {quoted && <MoneyRow label="Delivery" amount={order.deliveryFee ?? 0} />}
      {order.items.map((item) => (
        <MoneyRow
          key={item.id}
          label={`${item.fabricName} (${item.quantity} ${item.unit}${item.quantity === 1 ? '' : 's'})`}
          hint={`${naira(item.unitPrice)} per ${item.unit}`}
          amount={item.lineTotal}
        />
      ))}
      {quoted && order.platformFee > 0 && <MoneyRow label="Platform fee" amount={order.platformFee} />}
      {quoted ? (
        <MoneyRow label="Total" amount={order.totalAmount} strong />
      ) : (
        <MoneyRow label="Fabric total" amount={order.fabricTotal} strong />
      )}
      {order.quoteNote && (
        <p className="mt-3 rounded-xl bg-[#FFFFFF]/60 p-3 text-sm text-[#4B453E]">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Note from the artisan</span>
          {order.quoteNote}
        </p>
      )}
      {!quoted && (
        <p className="mt-2 text-xs text-[#6B655C]">The artisan adds workmanship and delivery when they send a quote.</p>
      )}
    </SectionCard>
  );
}

function EscrowCard({ order }: { order: Order }) {
  const { held, released, refunded, balance } = order.escrow;
  // The platform fee is part of what was paid in but is never paid out, so it isn't "held" for anyone.
  const fee = refunded >= held ? 0 : order.platformFee;
  const stillHeld = Math.max(0, balance - fee);
  return (
    <SectionCard title="Payment protection" kicker="Escrow" action={<Lock size={18} className="text-[#B8734E]" aria-hidden="true" />}>
      <p className="mb-3 text-sm leading-6 text-[#6B655C]">
        Your payment is held by IPILE and released to the artisan when you approve delivery; fabric payments go to
        merchants when the artisan confirms the fabric arrived.
      </p>
      <MoneyRow label="Paid in" amount={held} />
      <MoneyRow label="Released to artisan & merchants" amount={released} />
      {refunded > 0 && <MoneyRow label="Refunded" amount={refunded} />}
      {fee > 0 && <MoneyRow label="Platform fee" amount={fee} />}
      <MoneyRow label="Still held for the artisan & merchants" amount={stillHeld} strong />
    </SectionCard>
  );
}

function BriefCard({ order }: { order: Order }) {
  return (
    <SectionCard title="The request" kicker="Brief">
      <p className="whitespace-pre-wrap text-sm leading-6 text-[#4B453E]">{order.brief}</p>
      {order.desiredDate && <p className="mt-3 text-sm text-[#6B655C]">Needed by {formatDate(order.desiredDate)}</p>}
      {order.referenceImageUrls.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {order.referenceImageUrls.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="relative block h-28 w-24 overflow-hidden rounded-lg bg-[#FFFFFF]">
                <Image src={url} alt="Reference image" fill sizes="96px" className="object-cover" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

const MEASURES: [keyof Order['fitSnapshot'], string][] = [
  ['chest', 'Chest'],
  ['shoulderWidth', 'Shoulders'],
  ['sleeveLength', 'Sleeve'],
  ['kaftanLength', 'Length'],
  ['waist', 'Waist'],
  ['neck', 'Neck'],
];
const SILHOUETTE: Record<string, string> = {
  slim_modern: 'Slim modern',
  classic_regal: 'Classic regal',
  relaxed_casual: 'Relaxed casual',
};

function FitCard({ order }: { order: Order }) {
  const fit = order.fitSnapshot;
  const address = order.deliveryAddress;
  return (
    <SectionCard title="Measurements & delivery" kicker="Saved when the request was sent">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MEASURES.map(([key, label]) => (
          <div key={key} className="rounded-xl bg-[#FFFFFF]/50 px-3 py-2">
            <dt className="text-[11px] text-[#6B655C]">{label}</dt>
            <dd className="font-[family-name:var(--font-inter)] text-sm font-semibold tabular-nums text-[#171717]">
              {fit[key] !== null ? `${fit[key]} ${fit.unit}` : '—'}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-[#6B655C]">Fit preference: {SILHOUETTE[fit.drapeSilhouette] ?? fit.drapeSilhouette}</p>
      {(fit.frontPhotoUrl || fit.sidePhotoUrl) && (
        <div className="mt-3 flex gap-2">
          {[fit.frontPhotoUrl, fit.sidePhotoUrl].filter(Boolean).map((url) => (
            <a key={url} href={url!} target="_blank" rel="noreferrer" className="relative block h-28 w-20 overflow-hidden rounded-lg bg-[#FFFFFF]">
              <Image src={url!} alt="Reference photo for measurements" fill sizes="80px" className="object-cover" />
            </a>
          ))}
        </div>
      )}
      {address && (
        <p className="mt-4 flex items-start gap-2 text-sm text-[#4B453E]">
          <MapPin size={15} className="mt-0.5 shrink-0 text-[#B8734E]" aria-hidden="true" />
          <span>
            {address.line1}, {address.city}, {address.state}
            {address.landmark && <span className="block text-xs text-[#6B655C]">Landmark: {address.landmark}</span>}
            {address.phone && <span className="block text-xs text-[#6B655C]">Phone: {address.phone}</span>}
          </span>
        </p>
      )}
    </SectionCard>
  );
}

/* ───────────────────────── Customer actions ───────────────────────── */

function NextStep({ title, children, tone = 'info' }: { title: string; children: ReactNode; tone?: 'info' | 'success' | 'warn' }) {
  return (
    <section
      className={cn(
        card,
        'flex flex-col gap-4',
        tone === 'info' && 'border-[#B8734E]/30 shadow-[0_0_20px_-6px_rgba(184,115,78,0.4)]',
        tone === 'success' && 'border-[#2F6B4F]/30',
        tone === 'warn' && 'border-[#9B2C24]/30',
      )}
    >
      <h2 className="text-lg font-bold text-[#171717]">{title}</h2>
      {children}
    </section>
  );
}

function CustomerActions({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const { busy, error, run } = useAction();
  const [mode, setMode] = useState<'idle' | 'cancel' | 'dispute'>('idle');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const artisan = order.tailor?.displayName ?? order.tailor?.atelierName ?? 'Your artisan';

  async function pay() {
    const res = await run('pay', () => startPayment(order.id));
    if (res) {
      sessionStorage.setItem(PAYING_ORDER_KEY, order.id);
      window.location.assign(res.authorizationUrl);
    }
  }
  const apply = async (name: string, fn: () => Promise<Order>) => {
    const updated = await run(name, fn);
    if (updated) {
      onUpdate(updated);
      setMode('idle');
    }
  };

  const disputeForm = (
    <ReasonForm
      label="What went wrong?"
      placeholder="Explain the problem. An IPILE admin reviews both sides and the payment stays held until it's resolved."
      submitLabel="Open a dispute"
      busy={busy === 'dispute'}
      danger
      onSubmit={(reason) => apply('dispute', () => disputeOrder(order.id, reason))}
      onCancel={() => setMode('idle')}
    />
  );

  let body: ReactNode = null;
  switch (order.status) {
    case 'requested':
      body = (
        <NextStep title={`Waiting for ${artisan}'s quote`}>
          <p className="text-sm text-[#6B655C]">
            They&apos;ll reply with a price and a delivery date. You&apos;ll get an email when it arrives. Use the messages to
            answer any questions.
          </p>
          {mode === 'cancel' ? (
            <CancelConfirm busy={busy === 'cancel'} onConfirm={() => apply('cancel', () => cancelOrder(order.id))} onBack={() => setMode('idle')} />
          ) : (
            <button type="button" className={cn(ghostButton, 'self-start')} onClick={() => setMode('cancel')}>
              Cancel request
            </button>
          )}
        </NextStep>
      );
      break;
    case 'quoted':
      body = (
        <NextStep title="Your quote is ready">
          <p className="text-sm text-[#6B655C]">
            {artisan} can have it ready by <strong className="text-[#171717]">{formatDate(order.estimatedDeliveryDate)}</strong>.
            Your payment is held by IPILE until you approve the finished piece.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryButton} onClick={pay} disabled={busy !== null}>
              {busy === 'pay' ? <Spinner /> : <Lock size={16} aria-hidden="true" />} Pay {naira(order.totalAmount)} securely
              with Paystack
            </button>
            {mode !== 'cancel' && (
              <button type="button" className={ghostButton} onClick={() => setMode('cancel')}>
                Cancel
              </button>
            )}
          </div>
          {mode === 'cancel' && (
            <CancelConfirm busy={busy === 'cancel'} onConfirm={() => apply('cancel', () => cancelOrder(order.id))} onBack={() => setMode('idle')} />
          )}
        </NextStep>
      );
      break;
    case 'paid':
    case 'in_progress':
      body = (
        <NextStep title={order.status === 'paid' ? 'Paid — your artisan can start' : 'Your piece is being made'} tone="success">
          <p className="text-sm text-[#6B655C]">
            Current stage: <strong className="text-[#171717]">{MILESTONES.find((m) => m.id === order.milestone)?.label}</strong>.
            You&apos;ll be notified at each step.
          </p>
          {mode === 'dispute' ? (
            disputeForm
          ) : (
            <button type="button" className={cn(ghostButton, 'self-start')} onClick={() => setMode('dispute')}>
              <CircleAlert size={15} aria-hidden="true" /> Report a problem
            </button>
          )}
        </NextStep>
      );
      break;
    case 'delivered':
      body = (
        <NextStep title="Your piece has been delivered">
          <p className="text-sm text-[#6B655C]">
            Happy with it? Approving releases the payment to {artisan}. If something isn&apos;t right, open a dispute instead
            — the payment stays held while an admin reviews it.
          </p>
          {mode === 'dispute' ? (
            disputeForm
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (rating) void apply('approve', () => approveOrder(order.id, rating, review.trim() || undefined));
              }}
            >
              <fieldset>
                <legend className={labelClass}>Rate your artisan</legend>
                <StarPicker value={rating} onChange={setRating} />
              </fieldset>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Review (optional)</span>
                <textarea className={cn(fieldClass, 'min-h-20')} value={review} onChange={(e) => setReview(e.target.value)} maxLength={1000} />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={primaryButton} disabled={!rating || busy !== null}>
                  {busy === 'approve' && <Spinner />} Approve & release payment
                </button>
                <button type="button" className={dangerButton} onClick={() => setMode('dispute')}>
                  Something&apos;s wrong
                </button>
              </div>
            </form>
          )}
        </NextStep>
      );
      break;
    case 'completed':
      body = (
        <NextStep title="Completed" tone="success">
          <p className="text-sm text-[#6B655C]">Payment released to {artisan}.</p>
          {order.resolutionNote && <p className="text-sm text-[#4B453E]">Admin decision: {order.resolutionNote}</p>}
        </NextStep>
      );
      break;
    case 'disputed':
      body = (
        <NextStep title="Dispute open" tone="warn">
          <p className="text-sm text-[#6B655C]">
            You raised: “{order.disputeReason}”. The payment stays held while an IPILE admin reviews the order and
            the conversation. You&apos;ll get an email with the decision.
          </p>
        </NextStep>
      );
      break;
    case 'refunded':
      body = (
        <NextStep title="Refunded" tone="warn">
          <p className="text-sm text-[#6B655C]">
            {naira(order.escrow.refunded)} was refunded to your payment method. Refunds can take a few working days to
            appear.
          </p>
          {order.resolutionNote && <p className="text-sm text-[#4B453E]">Admin decision: {order.resolutionNote}</p>}
        </NextStep>
      );
      break;
    case 'declined':
      body = (
        <NextStep title="The artisan declined this request" tone="warn">
          <p className="text-sm text-[#6B655C]">Reason: {order.declineReason}</p>
          <Link href="/tailors" className={cn(primaryButton, 'self-start')}>
            Find another artisan
          </Link>
        </NextStep>
      );
      break;
    case 'cancelled':
      body = (
        <NextStep title="You cancelled this request" tone="warn">
          <p className="text-sm text-[#6B655C]">Nothing was charged.</p>
        </NextStep>
      );
      break;
  }

  return (
    <>
      {body}
      {error && <InlineAlert>{error}</InlineAlert>}
    </>
  );
}

function CancelConfirm({ busy, onConfirm, onBack }: { busy: boolean; onConfirm: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#9B2C24]/30 bg-[#F6E3E0]/10 p-3">
      <p className="text-sm text-[#7A1F1A]">Cancel this request? The artisan will be told, and you can&apos;t undo it.</p>
      <div className="flex gap-2">
        <button type="button" className={dangerButton} onClick={onConfirm} disabled={busy}>
          {busy && <Spinner />} Yes, cancel
        </button>
        <button type="button" className={ghostButton} onClick={onBack}>
          Keep it
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Artisan actions ───────────────────────── */

function TailorActions({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const { busy, error, run } = useAction();
  const [declining, setDeclining] = useState(false);
  const [requoting, setRequoting] = useState(false);
  const [note, setNote] = useState('');
  const apply = async (name: string, fn: () => Promise<Order>) => {
    const updated = await run(name, fn);
    if (updated) {
      onUpdate(updated);
      setDeclining(false);
      setRequoting(false);
      setNote('');
    }
  };

  const milestoneIndex = MILESTONES.findIndex((m) => m.id === order.milestone);
  const next = MILESTONES[milestoneIndex + 1] as { id: Exclude<OrderMilestone, 'placed'>; label: string } | undefined;
  const pendingFabric = order.items.filter((i) => i.fulfilment !== 'received');

  let body: ReactNode = null;
  if (order.status === 'requested' || (order.status === 'quoted' && requoting)) {
    body = (
      <NextStep title={order.status === 'requested' ? 'Send a quote' : 'Update your quote'}>
        {declining ? (
          <ReasonForm
            label="Why are you declining?"
            placeholder="e.g. I'm fully booked until March, or this style isn't something I make."
            submitLabel="Decline request"
            busy={busy === 'decline'}
            danger
            onSubmit={(reason) => apply('decline', () => declineOrder(order.id, reason))}
            onCancel={() => setDeclining(false)}
          />
        ) : (
          <QuoteForm
            order={order}
            busy={busy === 'quote'}
            onSubmit={(quote) => apply('quote', () => quoteOrder(order.id, quote))}
            onDecline={() => setDeclining(true)}
            onCancel={order.status === 'quoted' ? () => setRequoting(false) : undefined}
          />
        )}
      </NextStep>
    );
  } else if (order.status === 'quoted') {
    body = (
      <NextStep title="Quote sent — waiting for payment">
        <p className="text-sm text-[#6B655C]">
          The customer pays {naira(order.totalAmount)} into escrow to confirm. You can change the quote until they pay.
        </p>
        <button type="button" className={cn(ghostButton, 'self-start')} onClick={() => setRequoting(true)}>
          Change quote
        </button>
      </NextStep>
    );
  } else if (order.status === 'paid' || order.status === 'in_progress') {
    const atDelivery = order.milestone === 'delivery';
    body = (
      <NextStep title={atDelivery ? 'Hand over the piece' : order.status === 'paid' ? 'Paid — start work' : 'Update progress'} tone="success">
        <p className="text-sm text-[#6B655C]">
          The customer&apos;s {naira(order.totalAmount)} is held in escrow. Your {naira((order.workmanshipPrice ?? 0) + (order.deliveryFee ?? 0))}{' '}
          is released when they approve delivery.
        </p>
        {pendingFabric.length > 0 && (
          <p className="text-sm text-[#8A6A1F]">
            {pendingFabric.length} fabric line{pendingFabric.length === 1 ? ' is' : 's are'} still on the way — confirm below when
            it arrives.
          </p>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Note for the customer (optional)</span>
          <input className={fieldClass} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. First fitting on Saturday at 11am" />
        </label>
        {atDelivery ? (
          <button
            type="button"
            className={cn(primaryButton, 'self-start')}
            disabled={busy !== null}
            onClick={() => apply('deliver', () => markDelivered(order.id, note.trim() || undefined))}
          >
            {busy === 'deliver' ? <Spinner /> : <Truck size={16} aria-hidden="true" />} Mark as delivered
          </button>
        ) : (
          next && (
            <button
              type="button"
              className={cn(primaryButton, 'self-start')}
              disabled={busy !== null}
              onClick={() => apply('milestone', () => advanceMilestone(order.id, next.id, note.trim() || undefined))}
            >
              {busy === 'milestone' && <Spinner />} Move to “{next.label}”
            </button>
          )
        )}
      </NextStep>
    );
  } else if (order.status === 'delivered') {
    body = (
      <NextStep title="Delivered — waiting for approval" tone="success">
        <p className="text-sm text-[#6B655C]">
          Your payment is released when the customer approves, or automatically after the review period if they don&apos;t
          respond.
        </p>
      </NextStep>
    );
  } else if (order.status === 'completed') {
    body = (
      <NextStep title="Completed" tone="success">
        <p className="text-sm text-[#6B655C]">Payment released to your payout account.</p>
      </NextStep>
    );
  } else if (order.status === 'disputed') {
    body = (
      <NextStep title="The customer opened a dispute" tone="warn">
        <p className="text-sm text-[#6B655C]">
          “{order.disputeReason}” — an IPILE admin will review the order and your messages. Reply in the chat with
          anything that helps.
        </p>
      </NextStep>
    );
  } else {
    body = (
      <NextStep title={order.status === 'declined' ? 'You declined this request' : order.status === 'cancelled' ? 'The customer cancelled' : 'Refunded'} tone="warn">
        {order.declineReason && <p className="text-sm text-[#6B655C]">Reason: {order.declineReason}</p>}
        {order.resolutionNote && <p className="text-sm text-[#6B655C]">Admin decision: {order.resolutionNote}</p>}
      </NextStep>
    );
  }

  return (
    <>
      {body}
      {error && <InlineAlert>{error}</InlineAlert>}
    </>
  );
}

function QuoteForm({
  order,
  busy,
  onSubmit,
  onDecline,
  onCancel,
}: {
  order: Order;
  busy: boolean;
  onSubmit: (quote: { workmanshipPrice: number; deliveryFee: number; estimatedDeliveryDate: string; note?: string }) => void;
  onDecline: () => void;
  onCancel?: () => void;
}) {
  const [workmanship, setWorkmanship] = useState(order.workmanshipPrice ? String(order.workmanshipPrice) : '');
  const [delivery, setDelivery] = useState(order.deliveryFee !== null ? String(order.deliveryFee) : '');
  const [date, setDate] = useState(order.estimatedDeliveryDate ?? '');
  const [note, setNote] = useState(order.quoteNote ?? '');
  const [touched, setTouched] = useState(false);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const w = Number(workmanship);
  const d = Number(delivery || 0);
  const errors = {
    workmanship: !Number.isInteger(w) || w < 1000 ? 'Enter at least ₦1,000.' : undefined,
    delivery: !Number.isInteger(d) || d < 0 ? 'Enter 0 or more.' : undefined,
    date: !date || date <= today ? 'Pick a date in the future.' : undefined,
  };
  const show = (k: keyof typeof errors) => (touched ? errors[k] : undefined);
  const subtotal = (errors.workmanship ? 0 : w) + (errors.delivery ? 0 : d) + order.fabricTotal;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (Object.values(errors).some(Boolean)) return;
        onSubmit({ workmanshipPrice: w, deliveryFee: d, estimatedDeliveryDate: date, note: note.trim() || undefined });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Workmanship (₦)</span>
          <input className={fieldClass} inputMode="numeric" value={workmanship} onChange={(e) => setWorkmanship(e.target.value.replace(/\D/g, ''))} placeholder="45000" />
          {show('workmanship') && <span className="text-xs text-[#9B2C24]">{show('workmanship')}</span>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Delivery fee (₦)</span>
          <input className={fieldClass} inputMode="numeric" value={delivery} onChange={(e) => setDelivery(e.target.value.replace(/\D/g, ''))} placeholder="0" />
          {show('delivery') && <span className="text-xs text-[#9B2C24]">{show('delivery')}</span>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Ready by</span>
          <input type="date" className={fieldClass} value={date} min={today} onChange={(e) => setDate(e.target.value)} />
          {show('date') && <span className="text-xs text-[#9B2C24]">{show('date')}</span>}
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Note (optional)</span>
        <textarea className={cn(fieldClass, 'min-h-20')} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="What the price includes, fittings, anything the customer should know." />
      </label>
      <div className="rounded-xl bg-[#FFFFFF]/50 p-3 text-sm">
        <MoneyRow label="Your workmanship + delivery" amount={(errors.workmanship ? 0 : w) + (errors.delivery ? 0 : d)} />
        {order.fabricTotal > 0 && <MoneyRow label="Fabric (paid to merchants)" amount={order.fabricTotal} />}
        <MoneyRow label="Customer pays" amount={subtotal} strong hint="plus a platform fee, if any" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={primaryButton} disabled={busy}>
          {busy && <Spinner />} Send quote
        </button>
        {onCancel ? (
          <button type="button" className={ghostButton} onClick={onCancel}>
            Keep current quote
          </button>
        ) : null}
        <button type="button" className={dangerButton} onClick={onDecline}>
          Decline
        </button>
      </div>
    </form>
  );
}

function ReceiveButton({ order, item, onUpdate }: { order: Order; item: OrderItem; onUpdate: (o: Order) => void }) {
  const { busy, error, run } = useAction();
  if (item.fulfilment !== 'shipped') return null;
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={primaryButton}
        disabled={busy !== null}
        onClick={async () => {
          const updated = await run('receive', () => receiveItem(order.id, item.id));
          if (updated) onUpdate(updated);
        }}
      >
        {busy && <Spinner />} Mark received
      </button>
      {error && <span className="text-xs text-[#9B2C24]">{error}</span>}
    </span>
  );
}

/* ───────────────────────── Merchant view ───────────────────────── */

function MerchantOrder({ order, reload }: { order: MerchantOrderView; reload: () => Promise<void> }) {
  const allReceived = order.items.every((i) => i.fulfilment === 'received');
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-8 sm:py-12">
      <OrderHeader reference={order.reference} status={order.status} garmentType={order.garmentType} createdAt={order.createdAt} />

      <NextStep title={allReceived ? 'Fabric received' : 'Ship your fabric to the artisan'} tone={allReceived ? 'success' : 'info'}>
        <p className="text-sm text-[#6B655C]">
          The customer has paid. Your {naira(order.merchantTotal)} is released to your payout account when the artisan
          confirms the fabric arrived.
        </p>
        {order.shipTo && (
          <div className="flex items-start gap-3 rounded-xl bg-[#FFFFFF]/60 p-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-[#B8734E]" aria-hidden="true" />
            <div className="text-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Ship to</p>
              <p className="font-semibold text-[#171717]">{order.shipTo.name}</p>
              <p className="text-[#4B453E]">
                {order.shipTo.address}
                {order.shipTo.city && `, ${order.shipTo.city}`}
              </p>
            </div>
          </div>
        )}
      </NextStep>

      <SectionCard title="Your fabric in this order" kicker={`${order.items.length} line${order.items.length === 1 ? '' : 's'} · ${naira(order.merchantTotal)}`}>
        <FabricLines items={order.items} action={(item) => <ShipControl order={order} item={item} onDone={reload} />} />
      </SectionCard>

      <section className={cn(card, 'flex items-start gap-3')}>
        <ShieldCheck size={20} className="shrink-0 text-[#B8734E]" aria-hidden="true" />
        <p className="text-sm text-[#6B655C]">
          You only see the fabric lines that are yours and the artisan&apos;s workshop address. The customer&apos;s
          measurements and address stay private.
        </p>
      </section>

      <Timeline events={order.events} />
    </div>
  );
}

function ShipControl({ order, item, onDone }: { order: MerchantOrderView; item: OrderItem; onDone: () => Promise<void> }) {
  const { busy, error, run } = useAction();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  if (item.fulfilment !== 'pending' || !(order.status === 'paid' || order.status === 'in_progress')) return null;
  if (!open)
    return (
      <button type="button" className={primaryButton} onClick={() => setOpen(true)}>
        <Truck size={16} aria-hidden="true" /> Mark shipped
      </button>
    );
  return (
    <form
      className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[260px]"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run('ship', () => shipItem(order.id, item.id, note.trim() || undefined));
        if (res) await onDone();
      }}
    >
      <input className={fieldClass} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Courier and tracking number (optional)" aria-label="Shipping note" />
      <div className="flex gap-2">
        <button type="submit" className={primaryButton} disabled={busy !== null}>
          {busy && <Spinner />} Confirm shipped
        </button>
        <button type="button" className={ghostButton} onClick={() => setOpen(false)}>
          Back
        </button>
      </div>
      {error && <span className="text-xs text-[#9B2C24]">{error}</span>}
    </form>
  );
}
