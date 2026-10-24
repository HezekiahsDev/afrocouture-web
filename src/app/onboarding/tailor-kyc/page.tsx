'use client';

import { useCallback, useMemo } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  GalleryUpload,
  SectionCard,
  SelectInput,
  TagInput,
  TextArea,
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
import { getMyTailorProfile, naira, saveMyTailorProfile, submitMyTailorProfile } from '@/lib/catalog';
import type { TailorProfile } from '@/types';

const SPECIALTIES = ['Kaftan', 'Agbada', 'Aso Ebi', 'Bridal', 'Senator wear', 'Suits', 'Embroidery', "Children's wear"];
const ID_TYPES = ['National Identity Number (NIN) slip', 'International passport', "Driver's licence", "Voter's card (PVC)"];

interface TailorForm {
  displayName: string;
  atelierName: string;
  city: string;
  craft: string;
  bio: string;
  yearsExperience: string;
  startingPrice: string;
  specialtyTags: string[];
  portraitUrl: string;
  coverImageUrl: string;
  portfolioUrls: string[];
  legalName: string;
  workshopAddress: string;
  idType: string;
  idDocumentUrl: string;
  workshopPhotoUrl: string;
  guildChapter: string;
  guildMembershipId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

const text = (value: string | number | null | undefined) => (value === null || value === undefined ? '' : String(value));
/** Empty inputs clear the saved value rather than sending "" (which the API rejects). */
const orNull = (value: string) => value.trim() || null;
const intOrNull = (value: string) => (value.trim() ? Number(value.replace(/[^\d]/g, '')) : null);

function toState(profile: TailorProfile | null, fullName: string | null | undefined): TailorForm {
  return {
    displayName: text(profile ? profile.displayName : fullName),
    atelierName: text(profile?.atelierName),
    city: text(profile?.city),
    craft: text(profile?.craft),
    bio: text(profile?.bio),
    yearsExperience: text(profile?.yearsExperience),
    startingPrice: text(profile?.startingPrice),
    specialtyTags: profile?.specialtyTags ?? [],
    portraitUrl: text(profile?.portraitUrl),
    coverImageUrl: text(profile?.coverImageUrl),
    portfolioUrls: profile?.portfolioUrls ?? [],
    legalName: text(profile?.legalName),
    workshopAddress: text(profile?.workshopAddress),
    idType: text(profile?.idType),
    idDocumentUrl: text(profile?.idDocumentUrl),
    workshopPhotoUrl: text(profile?.workshopPhotoUrl),
    guildChapter: text(profile?.guildChapter),
    guildMembershipId: text(profile?.guildMembershipId),
    bankName: text(profile?.bankName),
    bankCode: text(profile?.bankCode),
    accountNumber: text(profile?.accountNumber),
    accountName: text(profile?.accountName),
  };
}

function toPayload(form: TailorForm) {
  return {
    displayName: orNull(form.displayName),
    atelierName: orNull(form.atelierName),
    city: orNull(form.city),
    craft: orNull(form.craft),
    bio: orNull(form.bio),
    yearsExperience: intOrNull(form.yearsExperience),
    startingPrice: intOrNull(form.startingPrice),
    specialtyTags: form.specialtyTags,
    portraitUrl: orNull(form.portraitUrl),
    coverImageUrl: orNull(form.coverImageUrl),
    portfolioUrls: form.portfolioUrls,
    legalName: orNull(form.legalName),
    workshopAddress: orNull(form.workshopAddress),
    idType: orNull(form.idType),
    idDocumentUrl: orNull(form.idDocumentUrl),
    workshopPhotoUrl: orNull(form.workshopPhotoUrl),
    guildChapter: orNull(form.guildChapter),
    guildMembershipId: orNull(form.guildMembershipId),
    bankName: orNull(form.bankName),
    bankCode: orNull(form.bankCode),
    accountNumber: orNull(form.accountNumber),
    accountName: orNull(form.accountName),
  } as unknown as Partial<TailorProfile>;
}

function lengthError(value: string, min: number, max: number, what: string) {
  const length = value.trim().length;
  if (!length) return undefined;
  if (length < min) return `${what} must be at least ${min} characters.`;
  if (length > max) return `${what} must be at most ${max} characters.`;
  return undefined;
}

function validate(form: TailorForm): FieldErrors<TailorForm> {
  const years = form.yearsExperience.trim();
  const price = form.startingPrice.trim();
  return {
    displayName: lengthError(form.displayName, 2, 80, 'Display name'),
    atelierName: lengthError(form.atelierName, 2, 120, 'Atelier name'),
    city: lengthError(form.city, 2, 60, 'City'),
    craft: lengthError(form.craft, 1, 120, 'This line'),
    bio: lengthError(form.bio, 1, 1200, 'Your story'),
    yearsExperience: years && !(/^\d+$/.test(years) && Number(years) <= 70) ? 'Enter a whole number of years (0–70).' : undefined,
    startingPrice:
      price && !(/^\d+$/.test(price) && Number(price) >= 1000 && Number(price) <= 50_000_000)
        ? 'Enter a price of at least ₦1,000 (numbers only).'
        : undefined,
    legalName: lengthError(form.legalName, 2, 120, 'Legal name'),
    workshopAddress: lengthError(form.workshopAddress, 1, 300, 'Address'),
    guildChapter: lengthError(form.guildChapter, 1, 120, 'Guild or association'),
    guildMembershipId: lengthError(form.guildMembershipId, 1, 60, 'Membership ID'),
    accountNumber: form.accountNumber && !/^\d{10}$/.test(form.accountNumber) ? 'Account number must be a 10-digit NUBAN.' : undefined,
    accountName: lengthError(form.accountName, 1, 120, 'Account name'),
  };
}

function TailorKyc() {
  const { user } = useAuth();
  const fullName = user?.fullName;
  const toFormState = useCallback((profile: TailorProfile | null) => toState(profile, fullName), [fullName]);

  const form = useVerificationForm<TailorProfile, TailorForm>({
    load: getMyTailorProfile,
    save: saveMyTailorProfile,
    submit: submitMyTailorProfile,
    toState: toFormState,
    toPayload,
    validate,
  });
  const { state: f, set, errors: e, profile } = form;

  const requirements = useMemo(
    () => [
      { label: 'Display name', done: Boolean(f.displayName.trim()) },
      { label: 'Atelier name', done: Boolean(f.atelierName.trim()) },
      { label: 'City', done: Boolean(f.city.trim()) },
      { label: 'Your craft in one line', done: Boolean(f.craft.trim()) },
      { label: 'Starting price', done: Boolean(f.startingPrice.trim()) },
      { label: 'Portrait photo', done: Boolean(f.portraitUrl) },
      { label: 'Legal name', done: Boolean(f.legalName.trim()) },
      { label: 'Workshop address', done: Boolean(f.workshopAddress.trim()) },
      { label: 'ID type', done: Boolean(f.idType) },
      { label: 'Photo of your ID', done: Boolean(f.idDocumentUrl) },
      { label: 'Payout bank account', done: Boolean(f.bankCode && f.accountNumber && f.accountName.trim()) },
    ],
    [f],
  );

  if (form.loadState === 'loading') return <LoadingState label="Loading your artisan profile…" />;
  if (form.loadState === 'error') return <LoadErrorState message={form.loadError} onRetry={form.reload} />;

  const status = profile?.kycStatus ?? 'draft';
  const banner = (
    <StatusBanner
      status={status}
      reviewNote={profile?.reviewNote ?? null}
      submittedAt={profile?.submittedAt ?? null}
      subject="artisan profile"
      approvedLink={{ href: '/tailors', label: 'See the artisan directory' }}
    />
  );

  if (status === 'pending' || status === 'under_review') {
    return (
      <>
        <PageIntro eyebrow="Artisan verification" title="Thanks — we have everything we need">
          Here&apos;s what you sent. Once you&apos;re verified, your atelier appears in the artisan directory and
          customers can commission you.
        </PageIntro>
        {banner}
        <SubmittedSummary
          sections={[
            {
              title: 'Public profile',
              rows: [
                ['Display name', f.displayName],
                ['Atelier', f.atelierName],
                ['City', f.city],
                ['Craft', f.craft],
                ['Starting price', f.startingPrice ? naira(Number(f.startingPrice)) : null],
                ['Specialties', f.specialtyTags.join(', ')],
                ['Portfolio', f.portfolioUrls.length ? `${f.portfolioUrls.length} photos` : null],
              ],
            },
            {
              title: 'Identity & payout',
              rows: [
                ['Legal name', f.legalName],
                ['Workshop address', f.workshopAddress],
                ['ID', <DocumentLink key="id" url={f.idDocumentUrl} label={f.idType || 'View ID'} />],
                ['Guild', [f.guildChapter, f.guildMembershipId].filter(Boolean).join(' · ')],
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
      accountNameHint="It should match your legal name or your atelier's registered name."
    />
  );

  return (
    <>
      <PageIntro eyebrow="Artisan verification" title={approved ? 'Your atelier profile' : 'Get verified as an artisan'}>
        {approved
          ? 'Keep your public profile fresh — new work, prices and specialties update straight away.'
          : 'Tell customers about your craft and confirm who you are. Save as you go; when everything on the checklist is done, submit it for review.'}
      </PageIntro>
      {banner}

      <div className={approved ? 'flex flex-col gap-6' : 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]'}>
        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard
            number="01"
            title="Your atelier"
            description="This is what customers see in the artisan directory."
          >
            <TextInput label="Display name" value={f.displayName} onChange={(v) => set('displayName', v)} maxLength={80} required disabled={approved} error={e.displayName} placeholder="e.g. Amaka Obi" />
            <TextInput label="Atelier name" value={f.atelierName} onChange={(v) => set('atelierName', v)} maxLength={120} required disabled={approved} error={e.atelierName} placeholder="e.g. Obi Couture House" />
            <TextInput label="City" value={f.city} onChange={(v) => set('city', v)} maxLength={60} required disabled={approved} error={e.city} placeholder="e.g. Lagos" />
            <TextInput
              label="Years of experience"
              value={f.yearsExperience}
              onChange={(v) => set('yearsExperience', v.replace(/\D/g, '').slice(0, 2))}
              inputMode="numeric"
              disabled={approved}
              error={e.yearsExperience}
            />
            <TextInput
              label="Your craft in one line"
              value={f.craft}
              onChange={(v) => set('craft', v)}
              maxLength={120}
              required
              error={e.craft}
              placeholder="e.g. Bridal and occasion couture"
              className="sm:col-span-2"
            />
            <TextInput
              label="Starting price"
              value={f.startingPrice}
              onChange={(v) => set('startingPrice', v.replace(/\D/g, '').slice(0, 8))}
              prefix="₦"
              inputMode="numeric"
              required
              error={e.startingPrice}
              hint="The lowest you charge for a commission, in naira."
            />
            <div className="hidden sm:block" aria-hidden="true" />
            <TextArea
              label="Your story"
              value={f.bio}
              onChange={(v) => set('bio', v)}
              maxLength={1200}
              error={e.bio}
              placeholder="How you work, what you love making, and what customers can expect."
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <TagInput
                label="Specialties"
                values={f.specialtyTags}
                onChange={(v) => set('specialtyTags', v)}
                suggestions={SPECIALTIES}
                max={8}
                addLabel="Add another specialty"
              />
            </div>
            <FileUpload
              label="Portrait photo"
              purpose="tailor-portfolio"
              value={f.portraitUrl}
              onChange={(url) => set('portraitUrl', url ?? '')}
              required
              hint="A clear, well-lit photo of you — shown on your directory card."
            />
            <FileUpload
              label="Cover image"
              purpose="tailor-portfolio"
              value={f.coverImageUrl}
              onChange={(url) => set('coverImageUrl', url ?? '')}
              hint="Optional. Your atelier or a signature piece."
            />
            <div className="sm:col-span-2">
              <GalleryUpload
                label="Portfolio"
                hint="Optional. Up to 12 photos of finished pieces."
                purpose="tailor-portfolio"
                urls={f.portfolioUrls}
                onChange={(urls) => set('portfolioUrls', urls)}
                max={12}
              />
            </div>
          </SectionCard>

          {approved && (
            <SectionCard
              number="02"
              title="Payout account"
              description="Where we send your earnings. For your security, we email you whenever these details change."
            >
              {payout}
            </SectionCard>
          )}

          {!approved && (
            <>
              <SectionCard
                number="02"
                title="Identity"
                description="Only our review team sees these details. We use them to confirm you are who you say you are."
              >
                <TextInput label="Legal name" value={f.legalName} onChange={(v) => set('legalName', v)} maxLength={120} required error={e.legalName} hint="As written on your ID." autoComplete="name" />
                <SelectInput label="ID type" value={f.idType} onChange={(v) => set('idType', v)} options={ID_TYPES} placeholder="Select an ID" required error={e.idType} />
                <TextArea
                  label="Workshop address"
                  value={f.workshopAddress}
                  onChange={(v) => set('workshopAddress', v)}
                  maxLength={300}
                  rows={2}
                  required
                  error={e.workshopAddress}
                  className="sm:col-span-2"
                />
                <FileUpload
                  label="Photo of your ID"
                  purpose="tailor-kyc"
                  kind="document"
                  value={f.idDocumentUrl}
                  onChange={(url) => set('idDocumentUrl', url ?? '')}
                  required
                  hint="All four corners visible and the text readable."
                />
                <FileUpload
                  label="Workshop photo"
                  purpose="tailor-kyc"
                  value={f.workshopPhotoUrl}
                  onChange={(url) => set('workshopPhotoUrl', url ?? '')}
                  hint="Optional. Helps us confirm your workshop address."
                />
              </SectionCard>

              <SectionCard
                number="03"
                title="Guild or association"
                optional
                description="If you belong to a tailors' association, add it here."
              >
                <TextInput label="Guild or association" value={f.guildChapter} onChange={(v) => set('guildChapter', v)} maxLength={120} error={e.guildChapter} placeholder="e.g. NUTAD Lagos chapter" />
                <TextInput label="Membership ID" value={f.guildMembershipId} onChange={(v) => set('guildMembershipId', v)} maxLength={60} error={e.guildMembershipId} />
              </SectionCard>

              <SectionCard
                number="04"
                title="Payout account"
                description="Where we send your earnings. The account should be in your name or your atelier's registered name."
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

export default function TailorKycPage() {
  return (
    <VerificationShell portal="Artisan Portal" current="Artisan verification">
      <RequireAuth role="tailor">
        <TailorKyc />
      </RequireAuth>
    </VerificationShell>
  );
}
