'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { safeNext } from '@/lib/auth';
import { ArrowRight, CircleCheck, LoaderCircle, Minus, Plus, Ruler, Shirt, Truck, UserRound } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FileUpload } from '@/components/ui/FileUpload';
import { apiErrorMessage } from '@/lib/api';
import { getMyFitProfile, saveMyFitProfile } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { DeliveryAddress, DrapeSilhouette, FitProfile, MeasurementUnit } from '@/types';
import {
  MAX_MEASURE,
  MEASUREMENTS,
  MIN_MEASURE,
  NIGERIAN_STATES,
  PHONE_PATTERN,
  SILHOUETTES,
  convert,
  emptyMeasurements,
  measurementError,
  measurementsFrom,
  round1,
  typicalRange,
  type MeasurementKey,
  type MeasurementValues,
} from './measurements';

interface AddressValues {
  line1: string;
  city: string;
  state: string;
  landmark: string;
  phone: string;
}

const emptyAddress = (): AddressValues => ({ line1: '', city: '', state: '', landmark: '', phone: '' });

function addressFrom(a: DeliveryAddress | null | undefined): AddressValues {
  return a
    ? { line1: a.line1, city: a.city, state: a.state, landmark: a.landmark ?? '', phone: a.phone ?? '' }
    : emptyAddress();
}

interface FormState {
  unit: MeasurementUnit;
  measurements: MeasurementValues;
  silhouette: DrapeSilhouette;
  frontPhotoUrl: string | null;
  sidePhotoUrl: string | null;
  address: AddressValues;
}

function stateFrom(profile: FitProfile | null): FormState {
  return {
    unit: profile?.unit ?? 'in',
    measurements: measurementsFrom(profile),
    silhouette: profile?.drapeSilhouette ?? 'slim_modern',
    frontPhotoUrl: profile?.frontPhotoUrl ?? null,
    sidePhotoUrl: profile?.sidePhotoUrl ?? null,
    address: addressFrom(profile?.deliveryAddress),
  };
}

function addressErrors(a: AddressValues): Partial<Record<keyof AddressValues, string>> {
  const filled = Object.values(a).some((v) => v.trim() !== '');
  if (!filled) return {};
  const errors: Partial<Record<keyof AddressValues, string>> = {};
  if (a.line1.trim().length < 4) errors.line1 = 'Enter the street address.';
  if (a.city.trim().length < 2) errors.city = 'Enter the city or town.';
  if (!a.state) errors.state = 'Choose a state.';
  if (a.phone.trim() && !PHONE_PATTERN.test(a.phone.trim())) errors.phone = 'Enter a valid phone number.';
  return errors;
}

const card = 'rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-5 backdrop-blur-xl sm:p-6';
const fieldLabel = 'text-[11px] font-bold uppercase tracking-wider text-[#6B655C]';
const input =
  'w-full rounded-xl border border-[#171717]/12 bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-[#6B655C] focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)]';

export function FitProfileForm() {
  // Set when another page (e.g. a commission request) sent the customer here to finish their profile.
  const returnTo = safeNext(useSearchParams().get('next'), '') || null;
  const { user } = useAuth();
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<FormState>(() => stateFrom(null));
  const [saved, setSaved] = useState<FormState>(() => stateFrom(null));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyFitProfile()
      .then((profile) => {
        if (cancelled) return;
        const initial = stateFrom(profile);
        setForm(initial);
        setSaved(initial);
        setSavedAt(profile ? new Date(profile.updatedAt) : null);
        setLoadState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(apiErrorMessage(err, 'We could not load your fit profile.'));
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const measureErrors = useMemo(() => {
    const out: Partial<Record<MeasurementKey, string>> = {};
    for (const { key } of MEASUREMENTS) {
      const e = measurementError(form.measurements[key]);
      if (e) out[key] = e;
    }
    return out;
  }, [form.measurements]);
  const addrErrors = useMemo(() => addressErrors(form.address), [form.address]);
  const hasErrors = Object.keys(measureErrors).length > 0 || Object.keys(addrErrors).length > 0;
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const filledCount = MEASUREMENTS.filter(({ key }) => form.measurements[key].trim() !== '').length;

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setJustSaved(false);
  }

  function setMeasurement(key: MeasurementKey, value: string) {
    update({ measurements: { ...form.measurements, [key]: value } });
  }

  function step(key: MeasurementKey, delta: number) {
    const raw = form.measurements[key].trim();
    const current = Number(raw);
    if (raw === '' || !Number.isFinite(current)) {
      // Start a blank field from the low end of the typical range.
      const low = MEASUREMENTS.find((m) => m.key === key)!.typicalIn[0];
      setMeasurement(key, String(form.unit === 'cm' ? Math.round(low * 2.54) : low));
      return;
    }
    setMeasurement(key, String(Math.min(MAX_MEASURE, Math.max(MIN_MEASURE, round1(current + delta)))));
  }

  function switchUnit(unit: MeasurementUnit) {
    if (unit === form.unit) return;
    const measurements = emptyMeasurements();
    for (const { key } of MEASUREMENTS) measurements[key] = convert(form.measurements[key], form.unit, unit);
    update({ unit, measurements });
  }

  function setAddress(patch: Partial<AddressValues>) {
    update({ address: { ...form.address, ...patch } });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    setSaveError('');
    if (hasErrors) {
      setSaveError('Fix the highlighted fields, then save again.');
      return;
    }

    const a = form.address;
    const addressFilled = Object.values(a).some((v) => v.trim() !== '');
    const payload: Parameters<typeof saveMyFitProfile>[0] = {
      unit: form.unit,
      drapeSilhouette: form.silhouette,
      frontPhotoUrl: form.frontPhotoUrl,
      sidePhotoUrl: form.sidePhotoUrl,
      deliveryAddress: addressFilled
        ? {
            line1: a.line1.trim(),
            city: a.city.trim(),
            state: a.state,
            ...(a.landmark.trim() ? { landmark: a.landmark.trim() } : {}),
            ...(a.phone.trim() ? { phone: a.phone.trim() } : {}),
          }
        : null,
    };
    for (const { key } of MEASUREMENTS) {
      const v = form.measurements[key].trim();
      payload[key] = v === '' ? null : round1(Number(v));
    }

    setSaving(true);
    try {
      const profile = await saveMyFitProfile(payload);
      const next = stateFrom(profile);
      setForm(next);
      setSaved(next);
      setSavedAt(new Date(profile.updatedAt));
      setShowErrors(false);
      setJustSaved(true);
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'We could not save your fit profile.'));
    } finally {
      setSaving(false);
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#6B655C]" role="status">
        <LoaderCircle className="animate-spin" size={28} aria-label="Loading your fit profile" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className={cn(card, 'mx-auto mt-10 max-w-md text-center')}>
        <p className="text-sm text-[#9B2C24]">{loadError}</p>
        <button type="button" className="btn-primary mt-4" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const firstName = user?.fullName?.split(' ')[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8F5637]">Your fit profile</span>
        <h1 className="text-[30px] font-extrabold leading-[38px] tracking-[-0.02em] text-[#171717] md:text-[40px] md:leading-[48px]">
          {firstName ? `${firstName}, let's get your measurements right` : "Let's get your measurements right"}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[#6B655C] md:text-base">
          Save your measurements once and share them with any artisan you commission. Measure over light clothing
          with a soft tape — ask someone to help for shoulders and length. You can leave a field blank and add it
          later; your tailor will confirm everything at the first fitting.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Measurements */}
        <section className={cn(card, 'lg:col-span-7')} aria-labelledby="measure-heading">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Ruler size={20} className="mt-1 text-[#B8734E]" aria-hidden="true" />
              <div>
                <h2 id="measure-heading" className="text-lg font-bold text-[#171717]">
                  Body measurements
                </h2>
                <p className="text-xs text-[#6B655C]">
                  {filledCount} of {MEASUREMENTS.length} added
                </p>
              </div>
            </div>
            <div className="flex rounded-full border border-[#171717]/10 bg-[#F5F0E8] p-1" role="group" aria-label="Units">
              {(['in', 'cm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => switchUnit(u)}
                  aria-pressed={form.unit === u}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                    form.unit === u ? 'bg-[#9E5B37] text-[#FFFDF8]' : 'text-[#6B655C] hover:text-[#171717]',
                  )}
                >
                  {u === 'in' ? 'Inches' : 'Centimetres'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MEASUREMENTS.map(({ key, label, how, typicalIn }) => {
              const error = showErrors ? measureErrors[key] : measureErrors[key] && form.measurements[key] ? measureErrors[key] : '';
              const id = `m-${key}`;
              return (
                <div
                  key={key}
                  className={cn(
                    'flex flex-col gap-2 rounded-xl border bg-[#F5F0E8]/60 p-3.5',
                    error ? 'border-[#9B2C24]/50' : 'border-[#171717]/8',
                  )}
                >
                  <label htmlFor={id} className="text-sm font-semibold text-[#171717]">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                      <input
                        id={id}
                        inputMode="decimal"
                        value={form.measurements[key]}
                        onChange={(e) => setMeasurement(key, e.target.value.replace(/[^0-9.]/g, ''))}
                        onBlur={() => {
                          const v = form.measurements[key];
                          if (v.trim() && Number.isFinite(Number(v))) setMeasurement(key, String(round1(Number(v))));
                        }}
                        placeholder={typicalRange(typicalIn, form.unit)}
                        aria-invalid={Boolean(error)}
                        aria-describedby={`${id}-help`}
                        className={cn(input, 'pr-10 text-base font-semibold [font-variant-numeric:tabular-nums]')}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B655C]">
                        {form.unit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => step(key, form.unit === 'cm' ? -1 : -0.5)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#171717]/12 text-[#6B655C] hover:border-[#B8734E]/50 hover:text-[#171717]"
                      aria-label={`Decrease ${label}`}
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(key, form.unit === 'cm' ? 1 : 0.5)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#171717]/12 text-[#6B655C] hover:border-[#B8734E]/50 hover:text-[#171717]"
                      aria-label={`Increase ${label}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p id={`${id}-help`} className={cn('text-[11px] leading-4', error ? 'text-[#9B2C24]' : 'text-[#6B655C]')}>
                    {error || how}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Silhouette */}
          <section className={card} aria-labelledby="drape-heading">
            <div className="mb-4 flex items-start gap-3">
              <Shirt size={20} className="mt-1 text-[#B8734E]" aria-hidden="true" />
              <div>
                <h2 id="drape-heading" className="text-lg font-bold text-[#171717]">
                  Preferred fit
                </h2>
                <p className="text-xs text-[#6B655C]">How much ease you like. Your tailor adjusts each piece.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5" role="radiogroup" aria-labelledby="drape-heading">
              {SILHOUETTES.map((s) => {
                const active = form.silhouette === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update({ silhouette: s.id })}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3.5 text-left transition',
                      active
                        ? 'border-[#B8734E] bg-[#FFFFFF]/90 shadow-[0_0_20px_-3px_rgba(184,115,78,0.35)]'
                        : 'border-[#171717]/8 bg-[#F5F0E8]/60 hover:border-[#B8734E]/30',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1 h-4 w-4 shrink-0 rounded-full border',
                        active ? 'border-[5px] border-[#B8734E]' : 'border-[#6B655C]',
                      )}
                    />
                    <span className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#171717]">{s.title}</span>
                        <span className="rounded-full bg-[#B8734E]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7A4429]">
                          {s.tag}
                        </span>
                      </span>
                      <span className="text-xs leading-5 text-[#6B655C]">{s.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Photos */}
          <section className={card} aria-labelledby="photo-heading">
            <div className="mb-4 flex items-start gap-3">
              <UserRound size={20} className="mt-1 text-[#B8734E]" aria-hidden="true" />
              <div>
                <h2 id="photo-heading" className="text-lg font-bold text-[#171717]">
                  Reference photos <span className="text-xs font-normal text-[#6B655C]">(optional)</span>
                </h2>
                <p className="text-xs leading-5 text-[#6B655C]">
                  Your tailor uses these to check proportions. Photos are only shared with tailors you commission.
                  Stand straight in fitted clothing against a plain wall.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <FileUpload
                label="Front view"
                purpose="fit-photo"
                value={form.frontPhotoUrl}
                onChange={(url) => update({ frontPhotoUrl: url })}
              />
              <FileUpload
                label="Side view"
                purpose="fit-photo"
                value={form.sidePhotoUrl}
                onChange={(url) => update({ sidePhotoUrl: url })}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Address */}
      <section className={card} aria-labelledby="address-heading">
        <div className="mb-4 flex items-start gap-3">
          <Truck size={20} className="mt-1 text-[#B8734E]" aria-hidden="true" />
          <div>
            <h2 id="address-heading" className="text-lg font-bold text-[#171717]">
              Delivery & fitting address <span className="text-xs font-normal text-[#6B655C]">(optional)</span>
            </h2>
            <p className="text-xs text-[#6B655C]">Where your artisan meets you for fittings and sends the finished piece.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AddressField label="Street address" required error={showErrors ? addrErrors.line1 : undefined} className="md:col-span-2">
            {(id) => (
              <input
                id={id}
                value={form.address.line1}
                onChange={(e) => setAddress({ line1: e.target.value })}
                placeholder="House number and street"
                autoComplete="street-address"
                maxLength={200}
                className={input}
              />
            )}
          </AddressField>
          <AddressField label="City / town" required error={showErrors ? addrErrors.city : undefined}>
            {(id) => (
              <input
                id={id}
                value={form.address.city}
                onChange={(e) => setAddress({ city: e.target.value })}
                placeholder="e.g. Kano"
                autoComplete="address-level2"
                maxLength={60}
                className={input}
              />
            )}
          </AddressField>
          <AddressField label="State" required error={showErrors ? addrErrors.state : undefined}>
            {(id) => (
              <select
                id={id}
                value={form.address.state}
                onChange={(e) => setAddress({ state: e.target.value })}
                autoComplete="address-level1"
                className={cn(input, !form.address.state && 'text-[#6B655C]')}
              >
                <option value="">Choose a state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </AddressField>
          <AddressField label="Landmark">
            {(id) => (
              <input
                id={id}
                value={form.address.landmark}
                onChange={(e) => setAddress({ landmark: e.target.value })}
                placeholder="Nearby landmark to help find you"
                maxLength={120}
                className={input}
              />
            )}
          </AddressField>
          <AddressField label="Phone for delivery" error={showErrors ? addrErrors.phone : undefined}>
            {(id) => (
              <input
                id={id}
                type="tel"
                value={form.address.phone}
                onChange={(e) => setAddress({ phone: e.target.value })}
                placeholder="+234 801 234 5678"
                autoComplete="tel"
                maxLength={17}
                className={input}
              />
            )}
          </AddressField>
        </div>
        <p className="mt-3 text-[11px] text-[#6B655C]">Fields marked * are needed only if you add an address.</p>
      </section>

      {/* Save bar */}
      <div className={cn(card, 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
        <div className="flex items-start gap-3" aria-live="polite">
          {justSaved ? (
            <CircleCheck size={22} className="mt-0.5 shrink-0 text-[#2F6B4F]" aria-hidden="true" />
          ) : (
            <Ruler size={22} className="mt-0.5 shrink-0 text-[#B8734E]" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-semibold text-[#171717]">
              {saveError ? 'Not saved' : justSaved ? 'Fit profile saved' : dirty ? 'You have unsaved changes' : savedAt ? 'All changes saved' : 'Not saved yet'}
            </p>
            <p className={cn('text-xs', saveError ? 'text-[#9B2C24]' : 'text-[#6B655C]')}>
              {saveError ||
                (savedAt
                  ? `Last saved ${savedAt.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}`
                  : 'Save to share these measurements with artisans you commission.')}
            </p>
          </div>
        </div>
        <button type="submit" className="btn-primary justify-center" disabled={saving || (!dirty && Boolean(savedAt))}>
          {saving ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Saving…
            </>
          ) : (
            'Save fit profile'
          )}
        </button>
      </div>

      {savedAt && !dirty && (
        <section className={cn(card, 'flex flex-col gap-4')} aria-labelledby="next-heading">
          <h2 id="next-heading" className="text-lg font-bold text-[#171717]">
            What next?
          </h2>
          {returnTo && (
            <Link href={returnTo} className="btn-primary justify-center self-start">
              Continue where you left off <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/tailors"
              className="group flex items-center justify-between gap-3 rounded-xl border border-[#171717]/10 bg-[#F5F0E8]/60 p-4 transition hover:border-[#B8734E]/40"
            >
              <span>
                <span className="block text-sm font-semibold text-[#171717]">Find an artisan</span>
                <span className="block text-xs text-[#6B655C]">Browse makers and save the ones you like.</span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-[#B8734E] transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/fabric-explorer"
              className="group flex items-center justify-between gap-3 rounded-xl border border-[#171717]/10 bg-[#F5F0E8]/60 p-4 transition hover:border-[#B8734E]/40"
            >
              <span>
                <span className="block text-sm font-semibold text-[#171717]">Choose your fabric</span>
                <span className="block text-xs text-[#6B655C]">Plan yardage for your next piece.</span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-[#B8734E] transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      )}
    </form>
  );
}

function AddressField({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = `addr-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
        {required && <span className="text-[#B8734E]"> *</span>}
      </label>
      {children(id)}
      {error && (
        <p className="text-xs text-[#9B2C24]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FitProfileForm;
