'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { SectionCard, SelectInput, TagInput, TextArea, TextInput } from '@/components/onboarding/verification/fields';
import { apiErrorMessage } from '@/lib/api';
import { createFabric, updateFabric, type FabricInput, type MyFabric } from '@/lib/orders';
import { cn } from '@/lib/utils';
import { TierEditor } from './TierEditor';
import { checkTiers, toTiers, type TierDraft } from './tiers';

const CATEGORIES = ['Ankara', 'Voile', 'Aso Oke', 'Brocade', 'Lace', 'Adire', 'Kente', 'Silk', 'Velvet', 'Cotton', 'Other'];
const TAGS = ['Cotton', 'Wax print', 'Handwoven', 'Embroidered', 'Lightweight', 'Ceremonial', 'Formal', 'Patterned'];

interface FormState {
  name: string;
  category: string;
  customCategory: string;
  origin: string;
  description: string;
  tags: string[];
  price: string;
  unit: 'yard' | 'bundle';
  stock: string;
  imageUrl: string;
  isPublished: boolean;
  tiers: TierDraft[];
}

function initial(fabric?: MyFabric): FormState {
  const known = fabric && CATEGORIES.includes(fabric.category);
  return {
    name: fabric?.name ?? '',
    category: fabric ? (known ? fabric.category : 'Other') : '',
    customCategory: fabric && !known ? fabric.category : '',
    origin: fabric?.origin ?? '',
    description: fabric?.description ?? '',
    tags: fabric?.tags ?? [],
    price: fabric ? String(fabric.price) : '',
    unit: fabric?.unit ?? 'yard',
    stock: fabric?.stock === null || fabric?.stock === undefined ? '' : String(fabric.stock),
    imageUrl: fabric?.imageUrl ?? '',
    isPublished: fabric?.isPublished ?? true,
    tiers: (fabric?.priceTiers ?? []).map((t) => ({ minQuantity: String(t.minQuantity), price: String(t.price) })),
  };
}

type Errors = Partial<Record<'name' | 'category' | 'price' | 'imageUrl' | 'stock', string>>;

const TIER_MESSAGE = /price break|cheaper|base price|Larger quantities|price for \d+\+/i;

/** Create or edit a fabric listing, including its wholesale price breaks. */
export function FabricForm({ fabric }: { fabric?: MyFabric }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => initial(fabric));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [tierServerError, setTierServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError('');
    if (key === 'tiers' || key === 'price') setTierServerError('');
  };

  const basePrice = /^\d+$/.test(f.price) ? Number(f.price) : null;
  const category = f.category === 'Other' ? f.customCategory.trim() : f.category;

  function validate(): Errors {
    return {
      name: f.name.trim().length < 2 ? 'Give the fabric a name (at least 2 characters).' : undefined,
      category: category.length < 2 ? 'Choose a category.' : undefined,
      price: basePrice === null || basePrice < 100 ? 'Enter a price of at least ₦100.' : undefined,
      imageUrl: f.imageUrl ? undefined : 'Add a photo of the fabric.',
      stock: f.stock && !/^\d+$/.test(f.stock) ? 'Stock must be a whole number.' : undefined,
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const tierProblem = checkTiers(f.tiers, basePrice);
    if (Object.values(found).some(Boolean) || tierProblem) {
      setFormError('Fix the highlighted fields first.');
      requestAnimationFrame(() =>
        document.querySelector('[data-field-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      );
      return;
    }

    const payload: FabricInput = {
      name: f.name.trim(),
      category,
      origin: f.origin.trim() || undefined,
      description: f.description.trim() || undefined,
      tags: f.tags,
      price: basePrice!,
      unit: f.unit,
      priceTiers: toTiers(f.tiers),
      stock: f.stock ? Number(f.stock) : undefined,
      imageUrl: f.imageUrl,
      isPublished: f.isPublished,
    };

    setSaving(true);
    setFormError('');
    try {
      if (fabric) await updateFabric(fabric.id, payload);
      else await createFabric(payload);
      router.push(`/merchant/fabrics?saved=${encodeURIComponent(payload.name)}`);
    } catch (err) {
      const message = apiErrorMessage(err, 'We could not save this fabric.');
      if (TIER_MESSAGE.test(message)) setTierServerError(message);
      setFormError(message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Link href="/merchant/fabrics" className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#6B655C] hover:text-[#B8734E]">
        <ArrowLeft size={15} aria-hidden="true" /> Back to your fabrics
      </Link>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F5637]">{fabric ? 'Edit listing' : 'New listing'}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[#171717] sm:text-3xl">{fabric ? fabric.name : 'List a fabric'}</h1>
      </div>

      <SectionCard number="01" title="The fabric" description="What customers see in the fabric explorer.">
        <TextInput label="Name" value={f.name} onChange={(v) => set('name', v)} maxLength={120} required error={errors.name} placeholder="e.g. Royal Gold Ankara" className="sm:col-span-2" />
        <SelectInput label="Category" value={f.category} onChange={(v) => set('category', v)} options={CATEGORIES} placeholder="Choose a category" required error={f.category === 'Other' ? undefined : errors.category} />
        {f.category === 'Other' ? (
          <TextInput label="Category name" value={f.customCategory} onChange={(v) => { set('customCategory', v); setErrors((p) => ({ ...p, category: undefined })); }} maxLength={40} required error={errors.category} placeholder="e.g. Batik" />
        ) : (
          <TextInput label="Origin" value={f.origin} onChange={(v) => set('origin', v)} maxLength={80} placeholder="e.g. Kano, Nigeria" />
        )}
        {f.category === 'Other' && (
          <TextInput label="Origin" value={f.origin} onChange={(v) => set('origin', v)} maxLength={80} placeholder="e.g. Kano, Nigeria" />
        )}
        <TextArea label="Description" value={f.description} onChange={(v) => set('description', v)} maxLength={1200} rows={3} placeholder="Fibre, weight, finish and what it suits best." className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <TagInput label="Tags" values={f.tags} onChange={(v) => set('tags', v)} suggestions={TAGS} max={8} maxLength={30} addLabel="Add a tag" />
        </div>
        <div className="sm:col-span-2">
          <FileUpload label="Photo" purpose="fabric" value={f.imageUrl || null} onChange={(url) => set('imageUrl', url ?? '')} required hint="A close, well-lit photo that shows the pattern and texture." />
          {errors.imageUrl && (
            <p className="mt-1.5 text-xs text-[#9B2C24]" role="alert" data-field-error="true">
              {errors.imageUrl}
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard number="02" title="Price & stock">
        <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
          <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Sold by the</legend>
          <div className="flex gap-2">
            {(['yard', 'bundle'] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                aria-pressed={f.unit === unit}
                onClick={() => set('unit', unit)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-semibold capitalize',
                  f.unit === unit ? 'border-[#B8734E] bg-[#B8734E]/15 text-[#7A4429]' : 'border-[#171717]/12 text-[#6B655C] hover:border-[#B8734E]/40',
                )}
              >
                {unit}
              </button>
            ))}
          </div>
        </fieldset>
        <TextInput label={`Base price per ${f.unit}`} value={f.price} onChange={(v) => set('price', v.replace(/\D/g, '').slice(0, 8))} prefix="₦" inputMode="numeric" required error={errors.price} />
        <TextInput label={`Stock (${f.unit}s)`} value={f.stock} onChange={(v) => set('stock', v.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" error={errors.stock} hint="Optional. Leave blank if you restock on demand." />
        <TierEditor tiers={f.tiers} onChange={(t) => set('tiers', t)} basePrice={basePrice} unit={f.unit} serverError={tierServerError} />
      </SectionCard>

      {fabric?.moderatedAt ? (
        <p className="rounded-2xl border border-[#9B2C24]/30 bg-[#F6E3E0]/15 p-4 text-sm text-[#7A1F1A]">
          IPILE took this listing down: “{fabric.unpublishedReason}”. You can still edit it; contact support once it&apos;s
          fixed and we&apos;ll republish it.
        </p>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-4">
          <input type="checkbox" checked={f.isPublished} onChange={(e) => set('isPublished', e.target.checked)} className="h-4 w-4 accent-[#B8734E]" />
          <span className="text-sm text-[#171717]">
            Published <span className="text-xs text-[#6B655C]">— visible in the fabric explorer and orderable</span>
          </span>
        </label>
      )}

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-[#171717]/12 bg-[#FFFFFF]/95 p-4 shadow-[0_12px_32px_-4px_rgba(23,23,23,0.14)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <p className={cn('text-xs', formError ? 'text-[#9B2C24]' : 'text-[#6B655C]')} role={formError ? 'alert' : undefined}>
          {formError || (fabric ? 'Changes go live as soon as you save.' : 'You can edit or unpublish it at any time.')}
        </p>
        <button type="submit" className="btn-primary justify-center" disabled={saving}>
          {saving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          {saving ? 'Saving…' : fabric ? 'Save changes' : f.isPublished ? 'Publish listing' : 'Save as draft'}
        </button>
      </div>
    </form>
  );
}
