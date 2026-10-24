'use client';

import { useMemo } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { RequireAuth } from '@/components/auth/RequireAuth';
import {
  ChoiceCards,
  SectionCard,
  TagInput,
  TextInput,
} from '@/components/onboarding/verification/fields';
import { BankFields, type PayoutAccountValue } from '@/components/onboarding/verification/bank';
import {
  ActionBar,
  DocumentLink,
  LoadErrorState,
  LoadingState,
  PageIntro,
  RequirementsChecklist,
  StatusBanner,
  SubmittedSummary,
  VerificationShell,
  maskAccount,
} from '@/components/onboarding/verification/layout';
import { useVerificationForm, type FieldErrors } from '@/components/onboarding/verification/useVerificationForm';
import { getMyMerchantProfile, saveMyMerchantProfile, submitMyMerchantProfile } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { MerchantProfile, SourcingType } from '@/types';

const FABRICS = ['Ankara', 'Swiss voile', 'Guinea brocade', 'Aso Oke', 'Lace', 'Adire', 'Silk & velvet'];
const CAC_PATTERN = /^(RC|BN|IT|LP|LLP)[- ]?\d{4,8}$/i;

const SOURCING: { value: SourcingType; title: string; description: string }[] = [
  {
    value: 'direct_mill',
    title: 'Direct from mills or weavers',
    description: 'You buy from the people who make the cloth — textile mills, dyers or handloom weavers.',
  },
  {
    value: 'importer',
    title: 'Importer or wholesaler',
    description: 'You import finished fabric or buy it wholesale and resell it.',
  },
];

interface MerchantForm {
  businessName: string;
  city: string;
  marketHub: string;
  sourcingType: SourcingType | '';
  specialtyFabrics: string[];
  cacNumber: string;
  cacCertificateUrl: string;
  warehousePhotoUrl: string;
  qualityDeclarationAccepted: boolean;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

const text = (value: string | null | undefined) => value ?? '';
const orNull = (value: string) => value.trim() || null;

function toState(profile: MerchantProfile | null): MerchantForm {
  return {
    businessName: text(profile?.businessName),
    city: text(profile?.city),
    marketHub: text(profile?.marketHub),
    sourcingType: profile?.sourcingType ?? '',
    specialtyFabrics: profile?.specialtyFabrics ?? [],
    cacNumber: text(profile?.cacNumber),
    cacCertificateUrl: text(profile?.cacCertificateUrl),
    warehousePhotoUrl: text(profile?.warehousePhotoUrl),
    qualityDeclarationAccepted: profile?.qualityDeclarationAccepted ?? false,
    bankName: text(profile?.bankName),
    bankCode: text(profile?.bankCode),
    accountNumber: text(profile?.accountNumber),
    accountName: text(profile?.accountName),
  };
}

function toPayload(form: MerchantForm) {
  return {
    businessName: orNull(form.businessName),
    city: orNull(form.city),
    marketHub: orNull(form.marketHub),
    sourcingType: form.sourcingType || null,
    specialtyFabrics: form.specialtyFabrics,
    cacNumber: orNull(form.cacNumber),
    cacCertificateUrl: orNull(form.cacCertificateUrl),
    warehousePhotoUrl: orNull(form.warehousePhotoUrl),
    qualityDeclarationAccepted: form.qualityDeclarationAccepted,
    bankName: orNull(form.bankName),
    bankCode: orNull(form.bankCode),
    accountNumber: orNull(form.accountNumber),
    accountName: orNull(form.accountName),
  } as unknown as Partial<MerchantProfile>;
}

function lengthError(value: string, min: number, max: number, what: string) {
  const length = value.trim().length;
  if (!length) return undefined;
  if (length < min) return `${what} must be at least ${min} characters.`;
  if (length > max) return `${what} must be at most ${max} characters.`;
  return undefined;
}

function validate(form: MerchantForm): FieldErrors<MerchantForm> {
  return {
    businessName: lengthError(form.businessName, 2, 120, 'Business name'),
    city: lengthError(form.city, 2, 60, 'City'),
    marketHub: lengthError(form.marketHub, 1, 160, 'Location'),
    cacNumber:
      form.cacNumber.trim() && !CAC_PATTERN.test(form.cacNumber.trim())
        ? 'Enter a CAC number like RC-123456 or BN-1234567.'
        : undefined,
    accountNumber: form.accountNumber && !/^\d{10}$/.test(form.accountNumber) ? 'Account number must be a 10-digit NUBAN.' : undefined,
    accountName: lengthError(form.accountName, 1, 120, 'Account name'),
  };
}

function MerchantVerification() {
  const form = useVerificationForm<MerchantProfile, MerchantForm>({
    load: getMyMerchantProfile,
    save: saveMyMerchantProfile,
    submit: submitMyMerchantProfile,
    toState,
    toPayload,
    validate,
  });
  const { state: f, set, errors: e, profile } = form;

  const requirements = useMemo(
    () => [
      { label: 'Registered business name', done: Boolean(f.businessName.trim()) },
      { label: 'City', done: Boolean(f.city.trim()) },
      { label: 'Market or warehouse location', done: Boolean(f.marketHub.trim()) },
      { label: 'How you source fabric', done: Boolean(f.sourcingType) },
      { label: 'CAC number', done: Boolean(f.cacNumber.trim()) },
      { label: 'CAC certificate', done: Boolean(f.cacCertificateUrl) },
      { label: 'Quality declaration', done: f.qualityDeclarationAccepted },
      { label: 'Payout bank account', done: Boolean(f.bankCode && f.accountNumber && f.accountName.trim()) },
    ],
    [f],
  );

  if (form.loadState === 'loading') return <LoadingState label="Loading your merchant details…" />;
  if (form.loadState === 'error') return <LoadErrorState message={form.loadError} onRetry={form.reload} />;

  const status = profile?.verificationStatus ?? 'draft';
  const banner = (
    <StatusBanner
      status={status}
      reviewNote={profile?.reviewNote ?? null}
      submittedAt={profile?.submittedAt ?? null}
      subject="merchant account"
      approvedLink={{ href: '/merchant/fabrics', label: 'Manage your fabric listings' }}
    />
  );

  if (status === 'pending' || status === 'under_review') {
    return (
      <>
        <PageIntro eyebrow="Merchant verification" title="Thanks — we have everything we need">
          Here&apos;s what you sent. Once you&apos;re verified you can list fabrics for tailors and customers to buy.
        </PageIntro>
        {banner}
        <SubmittedSummary
          sections={[
            {
              title: 'Business',
              rows: [
                ['Business name', f.businessName],
                ['City', f.city],
                ['Market or warehouse', f.marketHub],
                ['Sourcing', SOURCING.find((s) => s.value === f.sourcingType)?.title],
                ['Fabrics', f.specialtyFabrics.join(', ')],
              ],
            },
            {
              title: 'Registration & payout',
              rows: [
                ['CAC number', f.cacNumber],
                ['CAC certificate', <DocumentLink key="cac" url={f.cacCertificateUrl} label="View certificate" />],
                ['Stall or warehouse photo', <DocumentLink key="photo" url={f.warehousePhotoUrl} label="View photo" />],
                ['Bank', f.bankName],
                ['Account', maskAccount(f.accountNumber)],
              ],
            },
          ]}
        />
      </>
    );
  }

  const approved = status === 'approved';
  const payout = (
    <BankFields
      value={{ bankName: f.bankName, bankCode: f.bankCode, accountNumber: f.accountNumber, accountName: f.accountName }}
      onChange={(patch) =>
        (Object.entries(patch) as [keyof PayoutAccountValue, string][]).forEach(([field, value]) => set(field, value))
      }
      errors={e}
      accountNameHint="It should match your registered business name."
    />
  );

  return (
    <>
      <PageIntro eyebrow="Merchant verification" title={approved ? 'Your merchant profile' : 'Get verified as a fabric merchant'}>
        {approved
          ? 'Keep where you sell from and what you stock up to date.'
          : 'Tell us about your business and share your CAC registration. Save as you go; when everything on the checklist is done, submit it for review.'}
      </PageIntro>
      {banner}

      <div className={approved ? 'flex flex-col gap-6' : 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]'}>
        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard number="01" title="Your business" description="Shown alongside every fabric you list.">
            <TextInput label="Registered business name" value={f.businessName} onChange={(v) => set('businessName', v)} maxLength={120} required disabled={approved} error={e.businessName} hint="As it appears on your CAC certificate." />
            <TextInput label="City" value={f.city} onChange={(v) => set('city', v)} maxLength={60} required disabled={approved} error={e.city} placeholder="e.g. Kano" />
            <TextInput
              label="Market or warehouse location"
              value={f.marketHub}
              onChange={(v) => set('marketHub', v)}
              maxLength={160}
              required
              error={e.marketHub}
              placeholder="e.g. Kantin Kwari Market, Kano"
              hint="Where your stock ships from."
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <ChoiceCards
                label="How you source fabric"
                value={f.sourcingType}
                onChange={(v) => set('sourcingType', v)}
                options={SOURCING}
                required
                disabled={approved}
              />
            </div>
            <div className="sm:col-span-2">
              <TagInput
                label="Fabrics you stock"
                values={f.specialtyFabrics}
                onChange={(v) => set('specialtyFabrics', v)}
                suggestions={FABRICS}
                max={12}
                addLabel="Add another fabric"
              />
            </div>
          </SectionCard>

          {approved && (
            <SectionCard
              number="02"
              title="Payout account"
              description="Where we send money from your sales. For your security, we email you whenever these details change."
            >
              {payout}
            </SectionCard>
          )}

          {!approved && (
            <>
              <SectionCard
                number="02"
                title="Registration"
                description="Only our review team sees these documents. We use them to confirm your business is registered."
              >
                <TextInput
                  label="CAC number"
                  value={f.cacNumber}
                  onChange={(v) => set('cacNumber', v.toUpperCase())}
                  maxLength={14}
                  required
                  error={e.cacNumber}
                  placeholder="RC-123456 or BN-1234567"
                  autoComplete="off"
                />
                <div className="hidden sm:block" aria-hidden="true" />
                <FileUpload
                  label="CAC certificate"
                  purpose="merchant-verification"
                  kind="document"
                  value={f.cacCertificateUrl}
                  onChange={(url) => set('cacCertificateUrl', url ?? '')}
                  required
                  hint="A clear scan or photo of the certificate."
                />
                <FileUpload
                  label="Stall or warehouse photo"
                  purpose="merchant-verification"
                  value={f.warehousePhotoUrl}
                  onChange={(url) => set('warehousePhotoUrl', url ?? '')}
                  hint="Optional. Helps us confirm where you trade."
                />
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-4 sm:col-span-2',
                    f.qualityDeclarationAccepted ? 'border-[#00A3FF]/50 bg-[#00A3FF]/10' : 'border-white/10 bg-[#0F172A]/60',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={f.qualityDeclarationAccepted}
                    onChange={(event) => set('qualityDeclarationAccepted', event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#00A3FF]"
                  />
                  <span className="text-xs leading-relaxed text-[#CBD5E1]">
                    <span className="font-semibold text-[#F8FAFC]">Quality declaration. </span>
                    I confirm that the fabrics I list will be described accurately — including fibre content, colour and
                    whether they are original or replica — and that I will accept returns for items that don&apos;t match
                    their description.
                  </span>
                </label>
              </SectionCard>

              <SectionCard
                number="03"
                title="Payout account"
                description="Where we send money from your sales. The account should be in your business's registered name."
              >
                {payout}
              </SectionCard>
            </>
          )}
        </div>

        {!approved && (
          <div className="order-first lg:order-none lg:sticky lg:top-28">
            <RequirementsChecklist items={requirements} />
          </div>
        )}
      </div>

      <ActionBar
        dirty={form.dirty}
        busy={form.busy}
        notice={form.notice}
        actionError={form.actionError}
        missing={form.missing}
        onSave={form.saveDraft}
        onSubmit={approved ? undefined : form.submitForReview}
        submitLabel={profile?.reviewNote ? 'Resubmit for review' : 'Submit for review'}
      />
    </>
  );
}

export default function MerchantVerificationPage() {
  return (
    <VerificationShell portal="Merchant Portal" current="Merchant verification">
      <RequireAuth role="merchant">
        <MerchantVerification />
      </RequireAuth>
    </VerificationShell>
  );
}
