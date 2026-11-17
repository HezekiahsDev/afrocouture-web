'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Info, Lock, MapPin, Scissors } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { EmptyState, ErrorState, Portrait, useRemote } from '@/components/marketplace/shared';
import { apiErrorMessage } from '@/lib/api';
import { getFabrics, getMyFitProfile, getMyTailorProfile, getSaved, getTailors, naira } from '@/lib/catalog';
import { createFabricCheckout, getCheckoutConfig, MAX_CHECKOUT_FABRICS, startPayment } from '@/lib/orders';
import { unitPriceFor } from '@/lib/payments';
import { cn } from '@/lib/utils';
import type { DeliveryAddress, Fabric, FabricDestination, FitProfile, Tailor, TailorProfile } from '@/types';
import { PAYING_ORDER_KEY } from './OrderDetail';
import { card, fieldClass, InlineAlert, labelClass, MoneyRow, primaryButton, Spinner } from './ui';

interface Line {
  fabric: Fabric;
  quantity: number;
}

/** Anyone buying at this checkout: a customer, or a verified artisan buying for their own workshop. */
type Buyer = 'customer' | 'tailor';

interface CheckoutData {
  lines: Line[];
  /** Saved fabrics that can't be bought (sample listings). */
  skipped: number;
  /** Artisans fabric can be delivered to right now. */
  tailors: Tailor[];
  /** Verified artisans still missing workshop contact details. */
  hiddenArtisans: number;
  savedTailorIds: Set<string>;
  fitProfile: FitProfile | null;
  myTailorProfile: TailorProfile | null;
  buyer: Buyer;
  feePercent: number;
}

async function loadCheckout(buyer: Buyer): Promise<CheckoutData> {
  const [saved, fabrics, tailors, fitProfile, myTailorProfile, config] = await Promise.all([
    getSaved(),
    getFabrics(),
    getTailors(),
    // Only customers have a fit profile; only artisans have a tailor profile — asking for the other is a 403.
    buyer === 'customer' ? getMyFitProfile() : Promise.resolve(null),
    buyer === 'tailor' ? getMyTailorProfile() : Promise.resolve(null),
    getCheckoutConfig(),
  ]);
  const savedFabrics = saved
    .filter((item) => item.itemType === 'fabric')
    .flatMap((item) => {
      const fabric = fabrics.find((f) => f.id === item.itemId);
      return fabric ? [{ fabric, quantity: item.quantity ?? 1 }] : [];
    });
  const lines = savedFabrics.filter((line) => !line.fabric.isSample);
  const real = tailors.filter((t) => !t.isSample);
  return {
    lines,
    skipped: savedFabrics.length - lines.length,
    tailors: real.filter((t) => t.canReceiveFabric),
    hiddenArtisans: real.filter((t) => t.verified && !t.canReceiveFabric).length,
    savedTailorIds: new Set(saved.filter((item) => item.itemType === 'tailor').map((item) => item.itemId)),
    fitProfile,
    myTailorProfile,
    buyer,
    feePercent: config.platformFeePercent,
  };
}

export default function FabricCheckout() {
  return (
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  );
}

function Checkout() {
  const { user } = useAuth();
  // Merchants sell fabric here; they don't buy it, so they get an explanation instead of a dead end.
  const buyer: Buyer | null = user!.role === 'tailor' ? 'tailor' : user!.role === 'merchant' ? null : 'customer';
  // Nothing is loaded for a merchant: the early return below never reads the result.
  const { result, retry } = useRemote<CheckoutData | null>(
    () => (buyer ? loadCheckout(buyer) : Promise.resolve(null)),
    [buyer],
  );

  if (!buyer) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 py-16">
        <Link href="/marketplace" className="back-link">
          <ArrowLeft size={16} /> Back to discover
        </Link>
        <div className={cn(card, 'flex flex-col gap-3')}>
          <h1 className="text-2xl font-extrabold text-[#171717]">This checkout is for buyers</h1>
          <p className="text-sm leading-6 text-[#6B655C]">
            Customers and verified artisans buy fabric here. As a merchant you sell it — your fabric orders and the
            addresses to ship to are waiting under Orders.
          </p>
          <Link href="/orders?role=merchant" className={cn(primaryButton, 'self-start')}>
            Your fabric orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-8 sm:py-12">
      <Link href="/saved" className="back-link">
        <ArrowLeft size={16} /> Back to your selection
      </Link>
      <header>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8F5637]">Fabric checkout</p>
        <h1 className="text-[30px] font-extrabold leading-[38px] text-[#171717] sm:text-[40px] sm:leading-[48px]">
          {buyer === 'tailor' ? 'Buy fabric for your workshop' : 'Pay for your fabric'}
        </h1>
      </header>
      {result.state === 'error' ? (
        <ErrorState message={result.message} onRetry={retry} />
      ) : result.state === 'loading' ? (
        <div className="flex min-h-[40vh] items-center justify-center text-[#6B655C]" role="status">
          <Spinner label="Loading checkout" />
        </div>
      ) : result.data && result.data.lines.length ? (
        <CheckoutForm data={result.data} />
      ) : result.data ? (
        <EmptyState
          title="No fabric to check out"
          body={
            result.data.skipped
              ? 'The fabrics in your selection are sample listings, which are not for sale.'
              : 'Add fabrics to your selection, then come back to pay for them.'
          }
          action={
            <Link href="/fabric-explorer" className="mk-state-action">
              Explore fabrics <ArrowRight size={15} />
            </Link>
          }
        />
      ) : null}
    </div>
  );
}

const PHONE = /^\+?[0-9 ]{7,16}$/;

function addressProblem(a: DeliveryAddress): string | null {
  if (a.line1.trim().length < 4) return 'Enter your street address.';
  if (a.city.trim().length < 2) return 'Enter your city.';
  if (a.state.trim().length < 2) return 'Enter your state.';
  if (!PHONE.test((a.phone ?? '').trim())) return 'Enter a valid phone number for the courier.';
  return null;
}

function CheckoutForm({ data }: { data: CheckoutData }) {
  const router = useRouter();
  const artisan = data.buyer === 'tailor';
  const saved = data.fitProfile?.deliveryAddress;
  const [destination, setDestination] = useState<FabricDestination>('customer');
  const [address, setAddress] = useState<DeliveryAddress>(() =>
    artisan
      ? {
          // An artisan buying for themselves checks out to their own workshop.
          line1: data.myTailorProfile?.workshopAddress ?? '',
          city: data.myTailorProfile?.city ?? '',
          state: '',
          landmark: '',
          phone: data.myTailorProfile?.contactPhone ?? data.myTailorProfile?.whatsappNumber ?? '',
        }
      : {
          line1: saved?.line1 ?? '',
          city: saved?.city ?? '',
          state: saved?.state ?? '',
          landmark: saved?.landmark ?? '',
          phone: saved?.phone ?? '',
        },
  );
  const [tailorId, setTailorId] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const tailors = [...data.tailors]
    // An artisan can't send fabric to their own workshop.
    .filter((t) => !(artisan && t.id === data.myTailorProfile?.id))
    .sort((a, b) => Number(data.savedTailorIds.has(b.id)) - Number(data.savedTailorIds.has(a.id)));
  const chosen = tailors.find((t) => t.id === tailorId) ?? null;
  const subtotal = data.lines.reduce((sum, { fabric, quantity }) => sum + unitPriceFor(fabric, quantity) * quantity, 0);
  const fee = Math.round((subtotal * data.feePercent) / 100);
  const total = subtotal + fee;

  const tooMany = data.lines.length > MAX_CHECKOUT_FABRICS;
  const destinationProblem = destination === 'customer' ? addressProblem(address) : tailorId ? null : 'Choose an artisan.';
  const blocker = tooMany
    ? `You can check out ${MAX_CHECKOUT_FABRICS} fabrics at a time. Remove some from your selection.`
    : destinationProblem;

  const setField = (key: keyof DeliveryAddress) => (value: string) => setAddress((prev) => ({ ...prev, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    setError('');
    if (blocker) return;
    setSubmitting(true);

    let orderId: string;
    try {
      const order = await createFabricCheckout({
        fabrics: data.lines.map(({ fabric, quantity }) => ({ fabricId: fabric.id, quantity })),
        destination,
        ...(destination === 'tailor'
          ? { tailorId }
          : {
              deliveryAddress: {
                line1: address.line1.trim(),
                city: address.city.trim(),
                state: address.state.trim(),
                phone: address.phone?.trim(),
                ...(address.landmark?.trim() ? { landmark: address.landmark.trim() } : {}),
              },
            }),
      });
      orderId = order.id;
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
      return;
    }

    try {
      const { authorizationUrl } = await startPayment(orderId);
      sessionStorage.setItem(PAYING_ORDER_KEY, orderId);
      window.location.assign(authorizationUrl);
    } catch {
      // The order exists now; its page has a pay button to try again.
      router.push(`/orders/${orderId}`);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className={card} aria-labelledby="checkout-items">
          <h2 id="checkout-items" className="mb-4 text-lg font-bold text-[#171717]">
            1. Your fabric
          </h2>
          <ul className="flex flex-col gap-2">
            {data.lines.map(({ fabric, quantity }) => {
              const unit = unitPriceFor(fabric, quantity);
              return (
                <li key={fabric.id} className="flex items-center gap-3 rounded-xl border border-[#171717]/12 p-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FFFFFF]">
                    <Image src={fabric.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#171717]">{fabric.name}</span>
                    <span className="block text-xs text-[#6B655C]">
                      {quantity} {fabric.unit}
                      {quantity === 1 ? '' : 's'} × {naira(unit)} · {fabric.merchant.businessName}
                    </span>
                  </span>
                  <strong className="text-sm tabular-nums text-[#171717]">{naira(unit * quantity)}</strong>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-[#6B655C]">
            {data.skipped > 0 && `${data.skipped} sample listing${data.skipped === 1 ? ' was' : 's were'} left out. `}
            <Link href="/saved" className="mk-inline-link">
              Change your selection
            </Link>
          </p>
        </section>

        <section className={cn(card, 'flex flex-col gap-4')} aria-labelledby="checkout-destination">
          <h2 id="checkout-destination" className="text-lg font-bold text-[#171717]">
            2. Where should it go?
          </h2>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby="checkout-destination">
            <DestinationOption
              selected={destination === 'customer'}
              onSelect={() => setDestination('customer')}
              icon={<MapPin size={18} aria-hidden="true" />}
              title={artisan ? 'Deliver to my workshop' : 'Deliver to me'}
              body={artisan ? 'The merchant ships it to your workshop.' : 'The merchant ships it to your address.'}
            />
            <DestinationOption
              selected={destination === 'tailor'}
              onSelect={() => setDestination('tailor')}
              icon={<Scissors size={18} aria-hidden="true" />}
              title="Send to an artisan"
              body="The merchant ships it to their workshop, using their contact number."
            />
          </div>

          {destination === 'customer' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {artisan && (
                <p className="text-xs leading-5 text-[#6B655C] sm:col-span-2">
                  Prefilled from your artisan profile — edit anything that has changed. The merchant gets this address and
                  your phone number so the courier can reach you.
                </p>
              )}
              <TextField label="Street address" className="sm:col-span-2" value={address.line1} onChange={setField('line1')} maxLength={200} autoComplete="street-address" />
              <TextField label="City" value={address.city} onChange={setField('city')} maxLength={60} autoComplete="address-level2" />
              <TextField label="State" value={address.state} onChange={setField('state')} maxLength={60} autoComplete="address-level1" />
              <TextField label="Landmark (optional)" value={address.landmark ?? ''} onChange={setField('landmark')} maxLength={120} />
              <TextField label="Phone" type="tel" value={address.phone ?? ''} onChange={setField('phone')} maxLength={17} placeholder="+234 801 234 5678" autoComplete="tel" />
            </div>
          ) : tailors.length ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Choose an artisan">
                {tailors.map((t) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={tailorId === t.id}
                    key={t.id}
                    onClick={() => setTailorId(t.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition',
                      tailorId === t.id ? 'border-[#B8734E] bg-[#B8734E]/10' : 'border-[#171717]/12 bg-[#FFFFFF]/60 hover:border-[#B8734E]/40',
                    )}
                  >
                    <span className="overflow-hidden rounded-full">
                      <Portrait src={t.portraitUrl} name={t.displayName} size={40} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#171717]">{t.displayName ?? t.atelierName}</span>
                      <span className="block truncate text-xs text-[#6B655C]">
                        {t.city ?? t.craft}
                        {data.savedTailorIds.has(t.id) && ' · Saved'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {chosen && (
                <p className="flex items-start gap-2 rounded-xl border border-[#B8734E]/25 bg-[#B8734E]/5 p-3 text-xs leading-5 text-[#5C3B29]">
                  <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    The merchant ships to <strong className="text-[#171717]">{chosen.atelierName ?? chosen.displayName}</strong>
                    {chosen.city && ` in ${chosen.city}`}. They receive the workshop address, phone and WhatsApp number —
                    never your own address. {chosen.displayName ?? 'The artisan'} confirms when it arrives.
                  </span>
                </p>
              )}
              {data.hiddenArtisans > 0 && (
                <p className="text-xs leading-5 text-[#6B655C]">
                  {data.hiddenArtisans} verified artisan{data.hiddenArtisans === 1 ? '' : 's'} can’t receive fabric yet —
                  they haven’t added a workshop phone and WhatsApp number.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#6B655C]">No artisans can receive fabric yet. Choose delivery to your address instead.</p>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-[104px] lg:self-start">
        <div className={cn(card, 'flex flex-col gap-3')}>
          <h2 className="text-lg font-bold text-[#171717]">Summary</h2>
          <div>
            <MoneyRow label="Fabric" amount={subtotal} />
            {fee > 0 && <MoneyRow label="Platform fee" amount={fee} />}
            <MoneyRow label="Total" amount={total} strong />
          </div>
          <p className="text-xs leading-5 text-[#6B655C]">
            IPILE holds your payment until the fabric arrives. Fabrics from different merchants ship separately.
          </p>
          {error && <InlineAlert>{error}</InlineAlert>}
          {touched && blocker && <p className="text-xs leading-5 text-[#9B2C24]">{blocker}</p>}
          <button type="submit" className={primaryButton} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner /> Starting payment…
              </>
            ) : (
              <>
                <Lock size={16} aria-hidden="true" /> Pay {naira(total)}
              </>
            )}
          </button>
        </div>
      </aside>
    </form>
  );
}

function DestinationOption({
  selected,
  onSelect,
  icon,
  title,
  body,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 text-left transition',
        selected ? 'border-[#B8734E] bg-[#B8734E]/10' : 'border-[#171717]/12 bg-[#FFFFFF]/60 hover:border-[#B8734E]/40',
      )}
    >
      <span className="mt-0.5 text-[#8F5637]">{selected ? <Check size={18} aria-hidden="true" /> : icon}</span>
      <span>
        <span className="block text-sm font-semibold text-[#171717]">{title}</span>
        <span className="block text-xs text-[#6B655C]">{body}</span>
      </span>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  className,
  ...input
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className={labelClass}>{label}</span>
      <input className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} {...input} />
    </label>
  );
}