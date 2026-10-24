'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Ruler, Sparkles, Trash2, X } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { FileUpload } from '@/components/ui/FileUpload';
import { Portrait, VerifiedBadge } from '@/components/marketplace/shared';
import { getFabrics, getMyFitProfile, getSaved, getTailors, naira, saveItem } from '@/lib/catalog';
import { getDesign } from '@/lib/ai';
import { createOrder } from '@/lib/orders';
import { unitPriceFor } from '@/lib/payments';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AiDesign, Fabric, FitProfile, SavedItem, Tailor } from '@/types';
import { card, fieldClass, ghostButton, InlineAlert, labelClass, primaryButton, Spinner } from './ui';

const GARMENTS = ['Agbada', 'Kaftan', 'Senator wear', 'Aso Ebi gown', 'Boubou', 'Suit', 'Two-piece set', 'Dress'];
const MAX_REFERENCES = 6;
const MAX_FABRICS = 5;

interface Loaded {
  tailors: Tailor[];
  fabrics: Fabric[];
  fitProfile: FitProfile | null;
  design: AiDesign | null;
  savedFabrics: SavedItem[];
}

const fitProfileReady = (profile: FitProfile | null) =>
  Boolean(
    profile &&
      profile.deliveryAddress &&
      [profile.chest, profile.shoulderWidth, profile.sleeveLength, profile.kaftanLength, profile.waist, profile.neck].some(
        (v) => v !== null,
      ),
  );

export default function NewOrderForm(props: {
  tailorId?: string;
  aiDesignId?: string;
  styleId?: string;
  useSaved?: boolean;
  brief?: string;
}) {
  return (
    <RequireAuth role="customer">
      <NewOrder {...props} />
    </RequireAuth>
  );
}

function NewOrder({
  tailorId: initialTailorId,
  aiDesignId,
  styleId,
  useSaved,
  brief: initialBrief,
}: {
  tailorId?: string;
  aiDesignId?: string;
  styleId?: string;
  useSaved?: boolean;
  /** An idea carried over from the Discover page. */
  brief?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const [tailorId, setTailorId] = useState(initialTailorId ?? '');
  const [garmentType, setGarmentType] = useState('');
  const [customGarment, setCustomGarment] = useState('');
  const [brief, setBrief] = useState(() => initialBrief?.trim().slice(0, 2000) ?? '');
  const [desiredDate, setDesiredDate] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  /** fabricId → quantity for fabrics included in the order. */
  const [chosen, setChosen] = useState<Map<string, number> | null>(null);
  const [touched, setTouched] = useState(false);
  // The earliest date someone can ask for; computed once, not on every render.
  const [tomorrow] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTailors(),
      getFabrics(),
      getMyFitProfile(),
      aiDesignId ? getDesign(aiDesignId).catch(() => null) : Promise.resolve(null),
      getSaved(),
    ])
      .then(([tailors, fabrics, fitProfile, design, saved]) => {
        if (cancelled) return;
        const savedFabrics = saved.filter((item) => item.itemType === 'fabric');
        setData({ tailors, fabrics, fitProfile, design, savedFabrics });
        setLoadError('');
        // Start with the saved fabrics (and their quantities) when asked to.
        const initial = new Map<string, number>();
        if (useSaved) {
          for (const item of savedFabrics) {
            const fabric = fabrics.find((f) => f.id === item.itemId);
            if (fabric && !fabric.isSample && initial.size < MAX_FABRICS) initial.set(item.itemId, item.quantity ?? 1);
          }
        }
        setChosen((prev) => prev ?? initial);
        if (design && !brief) {
          setBrief(`Based on my AI Studio design: ${design.prompt}`);
          if (design.options.garmentType) setGarmentType(design.options.garmentType);
        }
      })
      .catch((err) => !cancelled && setLoadError(apiErrorMessage(err)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiDesignId, attempt]);

  const orderable = useMemo(() => (data ? data.tailors.filter((t) => !t.isSample) : []), [data]);
  const tailor = data?.tailors.find((t) => t.id === tailorId) ?? null;
  const selectedFabrics = useMemo(
    () =>
      data && chosen
        ? [...chosen.entries()]
            .map(([id, quantity]) => ({ fabric: data.fabrics.find((f) => f.id === id), quantity }))
            .filter((x): x is { fabric: Fabric; quantity: number } => Boolean(x.fabric))
        : [],
    [data, chosen],
  );
  const fabricTotal = selectedFabrics.reduce((sum, { fabric, quantity }) => sum + unitPriceFor(fabric, quantity) * quantity, 0);

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <InlineAlert>
          {loadError}{' '}
          <button type="button" className="font-semibold underline" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </InlineAlert>
      </div>
    );
  }
  if (!data || !chosen) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#94A3B8]" role="status">
        <Spinner label="Loading" />
      </div>
    );
  }

  const garment = garmentType === 'Other' ? customGarment.trim() : garmentType;
  const errors = {
    tailor: !tailor ? 'Choose an artisan.' : tailor.isSample ? 'Sample profiles cannot take commissions.' : undefined,
    garment: garment.length < 2 ? 'Choose what you would like made.' : undefined,
    brief:
      brief.trim().length < 20
        ? 'Describe what you want in at least 20 characters.'
        : brief.trim().length > 2000
          ? 'Keep the description under 2,000 characters.'
          : undefined,
    date: desiredDate && desiredDate < tomorrow ? 'Pick a date in the future.' : undefined,
  };
  const fitReady = fitProfileReady(data.fitProfile);
  // Say why the request can't be sent yet, in the order the form asks for things.
  const blocker = errors.tailor ?? errors.garment ?? errors.brief ?? errors.date ?? (!fitReady ? 'Complete your fit profile to send the request.' : null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    setError('');
    if (Object.values(errors).some(Boolean) || !fitReady) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        tailorId,
        garmentType: garment,
        brief: brief.trim(),
        styleId,
        aiDesignId: data?.design ? aiDesignId : undefined,
        referenceImageUrls: references.length ? references : undefined,
        desiredDate: desiredDate || undefined,
        fabrics: selectedFabrics.map(({ fabric, quantity }) => ({ fabricId: fabric.id, quantity })),
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  }

  const show = (key: keyof typeof errors) => (touched ? errors[key] : undefined);
  const setQuantity = (id: string, quantity: number) => {
    const next = Math.min(200, Math.max(1, quantity));
    setChosen((prev) => new Map(prev).set(id, next));
    // Keep the saved selection in step, so the same quantity shows on /saved.
    if (data.savedFabrics.some((item) => item.itemId === id))
      saveItem('fabric', id, next)
        .then((saved) =>
          setData((prev) =>
            prev && { ...prev, savedFabrics: prev.savedFabrics.map((item) => (item.itemId === id ? saved : item)) },
          ),
        )
        .catch((err) => setError(apiErrorMessage(err, 'Could not update that quantity.')));
  };
  const toggleFabric = (id: string) =>
    setChosen((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_FABRICS)
        next.set(id, data?.savedFabrics.find((item) => item.itemId === id)?.quantity ?? 1);
      return next;
    });

  const savedFabrics = data.savedFabrics
    .map((item) => data.fabrics.find((f) => f.id === item.itemId))
    .filter((f): f is Fabric => Boolean(f));

  return (
    <form onSubmit={submit} noValidate className="mx-auto flex max-w-5xl flex-col gap-6 py-8 sm:py-12">
      <Link href={useSaved ? '/saved' : '/tailors'} className="back-link">
        <ArrowLeft size={16} /> {useSaved ? 'Back to your selection' : 'Back to artisans'}
      </Link>
      <header>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#38BDF8]">New commission</p>
        <h1 className="text-[30px] font-extrabold leading-[38px] text-[#F8FAFC] sm:text-[40px] sm:leading-[48px]">
          Request a piece
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
          Tell the artisan what you want. They&apos;ll reply with a price and a delivery date — you only pay once
          you accept their quote.
        </p>
      </header>

      <ol className="grid gap-2 text-xs sm:grid-cols-4" aria-label="Steps to send your request">
        {[
          { label: 'Choose an artisan', done: Boolean(tailor && !tailor.isSample) },
          { label: 'Describe the piece', done: !errors.garment && !errors.brief },
          { label: 'Add fabric (optional)', done: selectedFabrics.length > 0 },
          { label: 'Send the request', done: false },
        ].map((step, index) => (
          <li
            key={step.label}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2',
              step.done ? 'border-[#34d399]/40 text-[#34d399]' : 'border-white/10 text-[#94A3B8]',
            )}
          >
            {step.done ? <Check size={14} aria-hidden="true" /> : <span className="font-bold">{index + 1}</span>}
            {step.label}
          </li>
        ))}
      </ol>

      {!fitReady && (
        <InlineAlert tone="info">
          <span className="flex flex-wrap items-center gap-2">
            <Ruler size={16} aria-hidden="true" />
            Your artisan needs your measurements and a delivery address.
            <Link
              href={`/onboarding/fit-profile?next=${encodeURIComponent(
                typeof window === 'undefined' ? '/orders/new' : window.location.pathname + window.location.search,
              )}`}
              className="font-semibold underline"
            >
              Complete your fit profile
            </Link>
            — you&apos;ll come straight back here.
          </span>
        </InlineAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Artisan */}
          <section className={card} aria-labelledby="artisan-heading">
            <h2 id="artisan-heading" className="mb-4 text-lg font-bold text-[#F8FAFC]">
              1. Your artisan
            </h2>
            {tailor && !tailor.isSample ? (
              <div className="flex items-center gap-3">
                <span className="overflow-hidden rounded-full">
                  <Portrait src={tailor.portraitUrl} name={tailor.displayName} size={52} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#38BDF8]">{tailor.atelierName}</p>
                  <p className="font-semibold text-[#F8FAFC]">{tailor.displayName ?? tailor.atelierName}</p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                    {tailor.city}
                    {tailor.startingPrice !== null && <span>· From {naira(tailor.startingPrice)}</span>}
                    {tailor.verified && <VerifiedBadge label="Verified artisan" />}
                  </p>
                </div>
                {orderable.length > 1 && (
                  <button type="button" className={ghostButton} onClick={() => setTailorId('')}>
                    Change
                  </button>
                )}
              </div>
            ) : (
              <>
                {tailor?.isSample && (
                  <div className="mb-3">
                    <InlineAlert tone="info">
                      {tailor.displayName ?? 'This artisan'} is a sample profile and can&apos;t take commissions. Choose
                      a verified artisan below.
                    </InlineAlert>
                  </div>
                )}
                {orderable.length ? (
                  <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Choose an artisan">
                    {orderable.map((t) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={tailorId === t.id}
                        key={t.id}
                        onClick={() => setTailorId(t.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3 text-left transition',
                          tailorId === t.id
                            ? 'border-[#00A3FF] bg-[#00A3FF]/10'
                            : 'border-white/10 bg-[#0F172A]/60 hover:border-white/20',
                        )}
                      >
                        <span className="overflow-hidden rounded-full">
                          <Portrait src={t.portraitUrl} name={t.displayName} size={40} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[#F8FAFC]">
                            {t.displayName ?? t.atelierName}
                          </span>
                          <span className="block truncate text-xs text-[#94A3B8]">
                            {t.craft ?? t.city}
                            {t.startingPrice !== null && ` · from ${naira(t.startingPrice)}`}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8]">
                    No verified artisans are taking commissions yet. Sample profiles on the marketplace are
                    illustrative only. Check back soon.
                  </p>
                )}
                {show('tailor') && !tailor && <p className="mt-2 text-xs text-[#ffb4ab]">{show('tailor')}</p>}
              </>
            )}
          </section>

          {/* The piece */}
          <section className={cn(card, 'flex flex-col gap-5')} aria-labelledby="piece-heading">
            <h2 id="piece-heading" className="text-lg font-bold text-[#F8FAFC]">
              2. The piece
            </h2>
            <fieldset className="flex flex-col gap-2">
              <legend className={cn(labelClass, 'mb-2')}>What should they make?</legend>
              <div className="flex flex-wrap gap-2">
                {[...GARMENTS, 'Other'].map((g) => (
                  <button
                    type="button"
                    key={g}
                    aria-pressed={garmentType === g}
                    onClick={() => setGarmentType(g)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
                      garmentType === g
                        ? 'border-[#00A3FF] bg-[#00A3FF] text-[#090D16]'
                        : 'border-white/10 text-[#94A3B8] hover:border-white/25 hover:text-[#F8FAFC]',
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {garmentType === 'Other' && (
                <input
                  className={fieldClass}
                  value={customGarment}
                  onChange={(e) => setCustomGarment(e.target.value)}
                  placeholder="e.g. Wrapper and blouse"
                  maxLength={60}
                  aria-label="Describe the garment type"
                />
              )}
              {show('garment') && <p className="text-xs text-[#ffb4ab]">{show('garment')}</p>}
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Describe it</span>
              <textarea
                className={cn(fieldClass, 'min-h-[140px] resize-y leading-6')}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                maxLength={2000}
                placeholder="The occasion, the fit you like, colours, embroidery, sleeve and neckline details, anything you don't want…"
                aria-invalid={Boolean(show('brief'))}
              />
              <span className="flex justify-between text-[11px] text-[#64748B]">
                <span className={show('brief') ? 'text-[#ffb4ab]' : ''}>
                  {show('brief') ?? 'The more detail, the more accurate the quote.'}
                </span>
                <span>{brief.trim().length}/2000</span>
              </span>
            </label>

            <label className="flex flex-col gap-1.5 sm:max-w-xs">
              <span className={labelClass}>Needed by (optional)</span>
              <input
                type="date"
                className={fieldClass}
                value={desiredDate}
                min={tomorrow}
                onChange={(e) => setDesiredDate(e.target.value)}
              />
              {show('date') && <span className="text-xs text-[#ffb4ab]">{show('date')}</span>}
            </label>

            <div className="flex flex-col gap-2">
              <span className={labelClass}>Reference images (optional)</span>
              {data.design && (
                <div className="flex items-center gap-3 rounded-xl border border-[#00A3FF]/25 bg-[#00A3FF]/5 p-3">
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#1E293B]">
                    <Image
                      src={data.design.imageUrls[data.design.selectedIndex] ?? data.design.imageUrls[0]}
                      alt="Your AI Studio design"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <span className="text-sm text-[#cfe5ff]">
                    <Sparkles size={14} className="mr-1 inline text-[#22D3EE]" aria-hidden="true" />
                    Your AI Studio design is attached for the artisan.
                  </span>
                </div>
              )}
              {references.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {references.map((url) => (
                    <li key={url} className="relative h-20 w-20 overflow-hidden rounded-lg bg-[#1E293B]">
                      <Image src={url} alt="Reference" fill sizes="80px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setReferences((prev) => prev.filter((u) => u !== url))}
                        className="absolute right-1 top-1 rounded-full bg-[#090D16]/80 p-1 text-[#F8FAFC]"
                        aria-label="Remove reference image"
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {references.length < MAX_REFERENCES && (
                <FileUpload
                  key={references.length}
                  label={references.length ? 'Add another image' : 'Add an image'}
                  hint="Photos of styles you like or details you want. Up to 6."
                  purpose="chat"
                  value={null}
                  onChange={(url) => url && setReferences((prev) => [...prev, url])}
                />
              )}
            </div>
          </section>

          {/* Fabrics */}
          <section className={card} aria-labelledby="fabric-heading">
            <h2 id="fabric-heading" className="text-lg font-bold text-[#F8FAFC]">
              3. Fabric
            </h2>
            <p className="mb-4 mt-1 text-sm text-[#94A3B8]">
              Buy fabric from your selection with this order (up to {MAX_FABRICS} fabrics) — the merchant ships it to your
              artisan. Or skip this and agree fabric with the artisan.
            </p>
            {savedFabrics.length ? (
              <ul className="flex flex-col gap-2">
                {savedFabrics.map((fabric) => {
                  const included = chosen.has(fabric.id);
                  const quantity = chosen.get(fabric.id) ?? 1;
                  const unit = unitPriceFor(fabric, quantity);
                  const blocked = fabric.isSample;
                  return (
                    <li
                      key={fabric.id}
                      className={cn(
                        'flex flex-wrap items-center gap-3 rounded-xl border p-3',
                        included ? 'border-[#00A3FF]/50 bg-[#00A3FF]/5' : 'border-white/10',
                      )}
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#1E293B]">
                        <Image src={fabric.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#F8FAFC]">{fabric.name}</span>
                        <span className="block text-xs text-[#94A3B8]">
                          {blocked
                            ? 'Sample listing — not for sale'
                            : `${naira(unit)} / ${fabric.unit}${unit < fabric.price ? ' · bulk price' : ''} · ${fabric.merchant.businessName}`}
                        </span>
                      </span>
                      {included && (
                        <span className="stepper" aria-label={`${fabric.name} quantity`}>
                          <button type="button" aria-label="Less" disabled={quantity <= 1} onClick={() => setQuantity(fabric.id, quantity - 1)}>
                            <Minus size={15} />
                          </button>
                          <strong>{quantity}</strong>
                          <button type="button" aria-label="More" disabled={quantity >= 200} onClick={() => setQuantity(fabric.id, quantity + 1)}>
                            <Plus size={15} />
                          </button>
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={blocked || (!included && chosen.size >= MAX_FABRICS)}
                        onClick={() => toggleFabric(fabric.id)}
                        aria-pressed={included}
                        className={included ? ghostButton : cn(ghostButton, 'border-[#00A3FF]/40')}
                      >
                        {included ? (
                          <>
                            <Trash2 size={14} /> Remove
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Include
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[#94A3B8]">
                You haven&apos;t saved any fabrics.{' '}
                <Link href="/fabric-explorer" className="mk-inline-link">
                  Explore fabrics
                </Link>{' '}
                and add them to your selection, or continue without fabric.
              </p>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[104px] lg:self-start">
          <div className={cn(card, 'flex flex-col gap-4')}>
            <h2 className="text-lg font-bold text-[#F8FAFC]">Summary</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#94A3B8]">Artisan</dt>
                <dd className="text-right text-[#F8FAFC]">{tailor && !tailor.isSample ? (tailor.displayName ?? tailor.atelierName) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#94A3B8]">Piece</dt>
                <dd className="text-right text-[#F8FAFC]">{garment || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#94A3B8]">Fabric</dt>
                <dd className="text-right tabular-nums text-[#F8FAFC]">{selectedFabrics.length ? naira(fabricTotal) : 'None'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#94A3B8]">Workmanship</dt>
                <dd className="text-right tabular-nums text-[#F8FAFC]">
                  {tailor && !tailor.isSample && tailor.startingPrice !== null ? `From ${naira(tailor.startingPrice)}` : 'Quoted by artisan'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
                <dt className="font-semibold text-[#F8FAFC]">Estimate so far</dt>
                <dd className="text-right font-bold tabular-nums text-[#F8FAFC]">
                  {naira(fabricTotal + (tailor && !tailor.isSample ? (tailor.startingPrice ?? 0) : 0))}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#94A3B8]">Fit profile</dt>
                <dd className={cn('flex items-center gap-1 text-right', fitReady ? 'text-[#34d399]' : 'text-[#fcd34d]')}>
                  {fitReady ? (
                    <>
                      <Check size={14} aria-hidden="true" /> Attached
                    </>
                  ) : (
                    'Incomplete'
                  )}
                </dd>
              </div>
            </dl>
            <p className="text-xs leading-5 text-[#64748B]">
              No payment now. The artisan adds their workmanship price and delivery fee in a quote; your payment is
              held by AfroCouture until you approve the finished piece.
            </p>
            {error && <InlineAlert>{error}</InlineAlert>}
            {blocker && (touched || !fitReady) && <p className="text-xs leading-5 text-[#fcd34d]">{blocker}</p>}
            <button type="submit" className={primaryButton} disabled={submitting || !fitReady}>
              {submitting ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                <>
                  Send request <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
