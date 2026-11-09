'use client';

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  LocateFixed,
  Lock,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
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
import {
  LOGISTICS_PROGRESS,
  LOGISTICS_STATUS_LABEL,
  bookOrderDelivery,
  cancelOrderDelivery,
  getOrderDelivery,
  isDeliveryActive,
  quoteOrderDelivery,
} from '@/lib/logistics';
import { getMyTailorProfile } from '@/lib/catalog';
import type {
  DaliQuote,
  LogisticsDelivery,
  LogisticsStatus,
  MerchantOrderView,
  Order,
  OrderItem,
  OrderMilestone,
} from '@/types';
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

          {(order.status === 'paid' ||
            order.status === 'in_progress' ||
            order.status === 'delivered' ||
            order.status === 'completed' ||
            order.status === 'disputed') && <DeliveryCard order={order} reload={reload} />}

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

/* ───────────────────────── Rider delivery (Dali) ───────────────────────── */

interface StopValues {
  label: string;
  address: string;
  contactName: string;
  contactPhone: string;
  lat: string;
  lng: string;
}

function stopFromAddress(order: Order): StopValues {
  const a = order.deliveryAddress;
  return {
    label: 'Customer',
    address: [a.line1, a.city, a.state].filter(Boolean).join(', '),
    contactName: order.customer.fullName ?? '',
    contactPhone: a.phone ?? '',
    lat: a.lat != null ? String(a.lat) : '',
    lng: a.lng != null ? String(a.lng) : '',
  };
}

const roundedCoord = (value: string) => Math.round(Number(value) * 1e6) / 1e6;

function coordsError(stop: StopValues): string | null {
  if (!stop.lat.trim() || !stop.lng.trim()) return 'Pin this stop on the map (or enter its coordinates).';
  const lat = Number(stop.lat);
  const lng = Number(stop.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Enter valid coordinates.';
  if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90.';
  if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180.';
  return null;
}

function stopError(stop: StopValues): string | null {
  if (stop.address.trim().length < 4) return 'Enter the full address.';
  if (stop.contactName.trim().length < 2) return 'Who should the rider ask for?';
  if (!/^\+?[0-9 ()-]{7,20}$/.test(stop.contactPhone.trim())) return 'Enter a valid phone number.';
  return coordsError(stop);
}

function toStop(stop: StopValues) {
  return {
    lat: roundedCoord(stop.lat),
    lng: roundedCoord(stop.lng),
    ...(stop.label.trim() ? { label: stop.label.trim() } : {}),
    address: stop.address.trim(),
    contactName: stop.contactName.trim(),
    contactPhone: stop.contactPhone.trim(),
  };
}

const deliveryTone = (status: LogisticsStatus) =>
  status === 'delivered' || status === 'completed'
    ? 'border-[#2F6B4F]/30 bg-[#2F6B4F]/5'
    : status === 'cancelled' || status === 'failed' || status === 'disputed'
      ? 'border-[#9B2C24]/30 bg-[#F6E3E0]/10'
      : 'border-[#B8734E]/30 bg-[#B8734E]/5';

function deliveryStamp(delivery: LogisticsDelivery, status: LogisticsStatus): string | null {
  const map: Partial<Record<LogisticsStatus, string | null>> = {
    assigned: delivery.timestamps.assignedAt,
    picked_up: delivery.timestamps.pickedUpAt,
    delivered: delivery.timestamps.deliveredAt,
    completed: delivery.timestamps.completedAt,
    cancelled: delivery.timestamps.cancelledAt,
    failed: delivery.timestamps.failedAt,
  };
  return map[status] ?? null;
}

/** Rider section on the order. The customer follows the job; the artisan books and cancels it. */
function DeliveryCard({ order, reload }: { order: Order; reload: () => Promise<void> }) {
  const [delivery, setDelivery] = useState<LogisticsDelivery | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [rebooking, setRebooking] = useState(false);

  const load = useCallback(async () => {
    try {
      setDelivery(await getOrderDelivery(order.id));
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load rider delivery.'));
    }
  }, [order.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    void load();
  }, [load]);

  const canManage = order.viewerRole === 'tailor' || order.viewerRole === 'admin';
  const atHandover =
    canManage && (order.status === 'paid' || order.status === 'in_progress') && order.milestone === 'delivery';

  if (delivery === undefined) {
    return error ? <InlineAlert>{error}</InlineAlert> : null;
  }

  if (!delivery || rebooking) {
    if (!atHandover) return null;
    return (
      <SectionCard title="Book a rider" kicker="Dali Logistics">
        <DeliveryBookingForm
          order={order}
          onBooked={async (booked) => {
            setDelivery(booked);
            setRebooking(false);
            await reload();
          }}
          onCancel={delivery ? () => setRebooking(false) : undefined}
        />
        {error && <InlineAlert>{error}</InlineAlert>}
      </SectionCard>
    );
  }

  const active = isDeliveryActive(delivery.status);
  const healthyTerminal = delivery.status === 'delivered' || delivery.status === 'completed';
  const canRebook = atHandover && !active && !healthyTerminal;
  const stepIndex = LOGISTICS_PROGRESS.indexOf(delivery.status);
  const runner = delivery.runner;

  return (
    <SectionCard
      title="Rider delivery"
      kicker="Dali Logistics"
      action={
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]',
            deliveryTone(delivery.status),
          )}
        >
          {LOGISTICS_STATUS_LABEL[delivery.status]}
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        {active && (
          <ol className="grid gap-2 sm:grid-cols-3" aria-label="Delivery progress">
            {LOGISTICS_PROGRESS.map((status, index) => {
              const done = stepIndex >= index;
              return (
                <li
                  key={status}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
                    done ? 'border-[#B8734E]/35 bg-[#B8734E]/10 text-[#171717]' : 'border-[#171717]/10 text-[#6B655C]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]',
                      done ? 'border-[#B8734E] bg-[#B8734E] text-[#F5F0E8]' : 'border-[#171717]/20',
                    )}
                  >
                    {done ? <CheckCircle2 size={12} aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{LOGISTICS_STATUS_LABEL[status]}</span>
                    {deliveryStamp(delivery, status) && (
                      <span className="block text-[10px] text-[#6B655C]">{formatDate(deliveryStamp(delivery, status), true)}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {!active && (
          <p className={cn('rounded-xl border p-3 text-sm', deliveryTone(delivery.status))}>
            {healthyTerminal
              ? 'Dali has completed this handover. The order is now with the customer for approval.'
              : delivery.status === 'cancelled'
                ? `This rider booking was cancelled${delivery.cancelReason ? `: ${delivery.cancelReason}` : '.'}`
                : delivery.status === 'failed'
                  ? 'Dali could not complete this delivery. Their support team has the details — book another rider or hand over in person.'
                  : 'Dali is reviewing this delivery. IPILE support can see the job.'}
          </p>
        )}

        {runner && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#171717]/10 bg-[#FFFFFF]/60 p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B8734E]/15 text-[#8F5637]">
              <Truck size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#171717]">{runner.name}</p>
              <p className="text-xs capitalize text-[#6B655C]">
                {runner.vehicle}
                {runner.rating != null && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Star size={11} className="fill-[#B8734E] text-[#B8734E]" aria-hidden="true" /> {runner.rating}
                  </span>
                )}
              </p>
            </div>
            <a href={`tel:${runner.phone.replace(/\s+/g, '')}`} className={ghostButton}>
              <Phone size={14} aria-hidden="true" /> Call rider
            </a>
          </div>
        )}

        {delivery.deliveryPin && (
          <div className="flex flex-wrap items-start gap-3 rounded-xl border border-[#B8734E]/35 bg-[#B8734E]/10 p-3">
            <KeyRound size={20} className="mt-0.5 shrink-0 text-[#8F5637]" aria-hidden="true" />
            <div>
              <p className={labelClass}>Handover PIN</p>
              <p className="font-[family-name:var(--font-inter)] text-2xl font-extrabold tracking-[0.2em] text-[#171717]">
                {delivery.deliveryPin}
              </p>
              <p className="mt-1 text-xs text-[#6B655C]">
                Only share this with the rider when they hand you the finished piece. Without it, they can&apos;t complete
                the handover.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#FFFFFF]/60 p-3 text-sm">
            <p className={labelClass}>Pickup</p>
            <p className="mt-1 text-[#171717]">{delivery.pickup.address}</p>
            <p className="text-xs text-[#6B655C]">
              {delivery.pickup.contact_name} · {delivery.pickup.contact_phone}
            </p>
          </div>
          <div className="rounded-xl bg-[#FFFFFF]/60 p-3 text-sm">
            <p className={labelClass}>Drop-off</p>
            <p className="mt-1 text-[#171717]">{delivery.dropoff.address}</p>
            <p className="text-xs text-[#6B655C]">
              {delivery.dropoff.contact_name} · {delivery.dropoff.contact_phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#6B655C]">
          <span>
            Rider fee <strong className="text-[#171717]">{naira(delivery.fee)}</strong> paid from IPILE&apos;s Dali balance
          </span>
          {delivery.distanceM != null && <span>{(delivery.distanceM / 1000).toFixed(1)} km route</span>}
          <span>Job {delivery.externalReference}</span>
        </div>

        {canRebook && (
          <button type="button" className={cn(ghostButton, 'self-start')} onClick={() => setRebooking(true)}>
            <Truck size={15} aria-hidden="true" /> Book another rider
          </button>
        )}

        {delivery.canCancel && (
          <CancelDelivery
            orderId={order.id}
            onCancelled={async (updated) => {
              setDelivery(updated);
              await reload();
            }}
          />
        )}
      </div>
    </SectionCard>
  );
}

function CancelDelivery({
  orderId,
  onCancelled,
}: {
  orderId: string;
  onCancelled: (delivery: LogisticsDelivery) => Promise<void>;
}) {
  const { busy, error, run } = useAction();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <button type="button" className={cn(dangerButton, 'self-start')} onClick={() => setOpen(true)}>
        Cancel rider booking
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#9B2C24]/25 bg-[#F6E3E0]/10 p-3">
      <p className="text-sm text-[#7A1F1A]">Cancel this Dali booking? The fee is refunded to the prepaid balance.</p>
      <input
        className={fieldClass}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        maxLength={500}
        aria-label="Cancellation reason"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={dangerButton}
          disabled={busy !== null}
          onClick={async () => {
            const updated = await run('cancel', () => cancelOrderDelivery(orderId, reason.trim() || undefined));
            if (updated) await onCancelled(updated);
          }}
        >
          {busy && <Spinner />} Yes, cancel rider
        </button>
        <button type="button" className={ghostButton} onClick={() => setOpen(false)}>
          Keep booking
        </button>
      </div>
      {error && <p className="text-xs text-[#9B2C24]">{error}</p>}
    </div>
  );
}

function DeliveryBookingForm({
  order,
  onBooked,
  onCancel,
}: {
  order: Order;
  onBooked: (delivery: LogisticsDelivery) => Promise<void>;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const { busy, error, run } = useAction();
  const [touched, setTouched] = useState(false);
  const [quote, setQuote] = useState<DaliQuote | null>(null);
  const [notes, setNotes] = useState('');
  const [pickup, setPickup] = useState<StopValues>(() => ({
    label: 'Atelier',
    address: '',
    contactName: user?.fullName ?? '',
    contactPhone: user?.phone ?? '',
    lat: '',
    lng: '',
  }));
  const [dropoff, setDropoff] = useState<StopValues>(() => stopFromAddress(order));

  // Prefill the workshop address and atelier name for the artisan.
  useEffect(() => {
    if (order.viewerRole !== 'tailor') return;
    let cancelled = false;
    getMyTailorProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setPickup((prev) => ({
          ...prev,
          label: prev.label || profile.atelierName || 'Atelier',
          address: prev.address || profile.workshopAddress || '',
          contactName: prev.contactName || profile.displayName || profile.atelierName || '',
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [order.viewerRole]);

  const pickupCoordsError = coordsError(pickup);
  const dropoffCoordsError = coordsError(dropoff);
  const pickupProblem = stopError(pickup);
  const dropoffProblem = stopError(dropoff);
  const coordinatesReady = !pickupCoordsError && !dropoffCoordsError;
  const missingDropoffPin = order.deliveryAddress.lat == null || order.deliveryAddress.lng == null;

  function changePickup(patch: Partial<StopValues>) {
    setPickup((prev) => ({ ...prev, ...patch }));
    setQuote(null);
  }
  function changeDropoff(patch: Partial<StopValues>) {
    setDropoff((prev) => ({ ...prev, ...patch }));
    setQuote(null);
  }

  async function priceIt() {
    setTouched(true);
    if (!coordinatesReady) return;
    const result = await run('quote', () =>
      quoteOrderDelivery(order.id, { pickup: toStop(pickup), dropoff: toStop(dropoff) }),
    );
    if (result) setQuote(result);
  }

  async function book() {
    setTouched(true);
    if (pickupProblem || dropoffProblem) return;
    const booked = await run('book', () =>
      bookOrderDelivery(order.id, {
        pickup: toStop(pickup),
        dropoff: toStop(dropoff),
        notes: notes.trim() || undefined,
      }),
    );
    if (booked) await onBooked(booked);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-[#6B655C]">
        Dali assigns a rider to collect the finished piece from your workshop and deliver it to the customer. The fee is
        paid from IPILE&apos;s prepaid Dali balance — it is not charged to the customer again. The customer gets a
        handover PIN; the rider can&apos;t complete the delivery without it.
      </p>

      {missingDropoffPin && (
        <InlineAlert tone="info">
          The customer hasn&apos;t pinned their address, so Dali has no drop-off coordinates. Ask them to pin it in their
          fit profile, or enter the coordinates below.
        </InlineAlert>
      )}

      <StopFields
        title="Pickup — your workshop"
        hint="Where the rider collects the piece."
        value={pickup}
        onChange={changePickup}
        error={touched ? pickupProblem : pickupCoordsError}
        showLocate
      />
      <StopFields
        title="Drop-off — the customer"
        hint="Prefilled from the customer's saved delivery address."
        value={dropoff}
        onChange={changeDropoff}
        error={touched ? dropoffProblem : dropoffCoordsError}
      />

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Note for the rider (optional)</span>
        <input
          className={fieldClass}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          placeholder="e.g. Call on arrival; the gate is on the left"
        />
      </label>

      {quote && (
        <div className="rounded-xl border border-[#B8734E]/30 bg-[#B8734E]/5 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-[#171717]">Dali quote</span>
            <span className="font-[family-name:var(--font-inter)] text-lg font-extrabold text-[#171717]">
              {naira(quote.fee)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6B655C]">
            {(quote.distanceM / 1000).toFixed(1)} km
            {quote.zoneName ? ` · ${quote.zoneName}` : ''} · valid until {formatDate(quote.expiresAt, true)}
          </p>
          <p className="mt-1 text-[11px] text-[#6B655C]">Dali re-quotes when the rider is booked, so the final fee may differ slightly.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={ghostButton} onClick={priceIt} disabled={busy !== null || !coordinatesReady}>
          {busy === 'quote' && <Spinner />} Get a quote
        </button>
        <button
          type="button"
          className={primaryButton}
          onClick={book}
          disabled={busy !== null}
        >
          {busy === 'book' ? <Spinner /> : <Truck size={16} aria-hidden="true" />} Book Dali rider
        </button>
        {onCancel && (
          <button type="button" className={ghostButton} onClick={onCancel}>
            Back
          </button>
        )}
      </div>

      {touched && (pickupProblem || dropoffProblem) && (
        <InlineAlert>Fill in both stops — address, contact and a valid phone number — before booking.</InlineAlert>
      )}
      {error && <InlineAlert>{error}</InlineAlert>}
    </div>
  );
}

function StopFields({
  title,
  hint,
  value,
  onChange,
  error,
  showLocate,
}: {
  title: string;
  hint: string;
  value: StopValues;
  onChange: (patch: Partial<StopValues>) => void;
  error: string | null;
  showLocate?: boolean;
}) {
  return (
    <fieldset className="rounded-xl border border-[#171717]/10 bg-[#FFFFFF]/40 p-3">
      <legend className={labelClass}>{title}</legend>
      <p className="mb-3 text-xs text-[#6B655C]">{hint}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelClass}>Address</span>
          <input
            className={fieldClass}
            value={value.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Street, area, city, state"
            maxLength={250}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Contact name</span>
          <input
            className={fieldClass}
            value={value.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="Who should the rider ask for?"
            maxLength={80}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Contact phone</span>
          <input
            className={fieldClass}
            type="tel"
            value={value.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="+234 801 234 5678"
            maxLength={20}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Latitude</span>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={value.lat}
            onChange={(e) => onChange({ lat: e.target.value })}
            placeholder="12.002180"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Longitude</span>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={value.lng}
            onChange={(e) => onChange({ lng: e.target.value })}
            placeholder="8.591956"
          />
        </label>
      </div>
      {showLocate && (
        <LocateButton onLocate={(lat, lng) => onChange({ lat: lat.toFixed(6), lng: lng.toFixed(6) })} />
      )}
      {error && <p className="mt-2 text-xs text-[#9B2C24]">{error}</p>}
    </fieldset>
  );
}

function LocateButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  function locate() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('This browser can’t share your location. Enter the coordinates instead.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Allow it in your browser, or enter the coordinates.'
            : 'Could not get your location. Try again, or enter the coordinates.',
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }

  return (
    <div className="mt-2">
      <button type="button" className={ghostButton} onClick={locate} disabled={locating}>
        {locating ? <Spinner /> : <LocateFixed size={14} aria-hidden="true" />} Use my current location
      </button>
      {error && <p className="mt-1 text-xs text-[#9B2C24]">{error}</p>}
    </div>
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
