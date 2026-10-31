'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CircleCheck, Eye, EyeOff, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { LoadErrorState, LoadingState } from '@/components/onboarding/verification/layout';
import { apiErrorMessage } from '@/lib/api';
import { naira } from '@/lib/catalog';
import { deleteFabric, listMyFabrics, updateFabric, type MyFabric } from '@/lib/orders';
import { cn } from '@/lib/utils';
import { useApprovedMerchant } from './MerchantShell';
import { tierSummary } from './tiers';

/** The merchant's own listings with publish, edit and delete. */
export function FabricList({ savedName }: { savedName?: string }) {
  const merchant = useApprovedMerchant();
  const [fabrics, setFabrics] = useState<MyFabric[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    setFabrics(null);
    try {
      setFabrics(await listMyFabrics());
    } catch (err) {
      setLoadError(apiErrorMessage(err, 'We could not load your fabrics.'));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load();
  }, [load]);

  async function togglePublished(fabric: MyFabric) {
    setBusyId(fabric.id);
    setError('');
    try {
      const updated = await updateFabric(fabric.id, { isPublished: !fabric.isPublished });
      setFabrics((list) => list?.map((f) => (f.id === fabric.id ? { ...f, ...updated } : f)) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update that listing.'));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(fabric: MyFabric) {
    setBusyId(fabric.id);
    setError('');
    try {
      await deleteFabric(fabric.id);
      setFabrics((list) => list?.filter((f) => f.id !== fabric.id) ?? null);
      setConfirmId(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete that listing.'));
    } finally {
      setBusyId(null);
    }
  }

  if (loadError) return <LoadErrorState message={loadError} onRetry={load} />;
  if (!fabrics) return <LoadingState label="Loading your fabrics…" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F5637]">{merchant.businessName}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#171717] sm:text-3xl">Your fabrics</h1>
          <p className="mt-1 text-sm text-[#6B655C]">
            {fabrics.length
              ? `${fabrics.filter((f) => f.isPublished).length} of ${fabrics.length} published`
              : 'List your first fabric to appear in the fabric explorer.'}
          </p>
        </div>
        <Link href="/merchant/fabrics/new" className="btn-primary">
          <Plus size={16} aria-hidden="true" /> Add a fabric
        </Link>
      </div>

      {savedName && (
        <p className="flex items-center gap-2 rounded-xl border border-[#2F6B4F]/30 bg-[#2F6B4F]/10 px-4 py-3 text-sm text-[#2F6B4F]" role="status">
          <CircleCheck size={16} aria-hidden="true" /> Saved “{savedName}”.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-[#9B2C24]/30 bg-[#F6E3E0]/20 px-4 py-3 text-sm text-[#7A1F1A]" role="alert">
          {error}
        </p>
      )}

      {fabrics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#171717]/15 px-6 py-14 text-center">
          <p className="text-base font-semibold text-[#171717]">No fabrics yet</p>
          <p className="max-w-sm text-sm text-[#6B655C]">
            Add a photo, a price per yard or bundle, and optional price breaks for bigger orders.
          </p>
          <Link href="/merchant/fabrics/new" className="btn-primary mt-2">
            <Plus size={16} aria-hidden="true" /> Add a fabric
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {fabrics.map((fabric) => (
            <li
              key={fabric.id}
              data-testid="my-fabric"
              className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-3 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center"
            >
              <span className="relative h-[72px] w-[72px] overflow-hidden rounded-xl bg-[#FFFFFF] sm:h-[88px] sm:w-[88px]">
                <Image src={fabric.imageUrl} alt="" fill sizes="88px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-bold text-[#171717]">{fabric.name}</h2>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      fabric.isPublished ? 'bg-[#2F6B4F]/15 text-[#2F6B4F]' : 'bg-[#171717]/5 text-[#6B655C]',
                    )}
                  >
                    {fabric.moderatedAt ? 'Taken down' : fabric.isPublished ? 'Published' : 'Hidden'}
                  </span>
                </div>
                {fabric.moderatedAt && (
                  <p className="mt-1 text-xs text-[#9B2C24]" data-testid="moderation-note">
                    IPILE took this listing down: “{fabric.unpublishedReason}”. Fix it and contact support to have it
                    republished.
                  </p>
                )}
                <p className="mt-0.5 text-xs text-[#6B655C]">
                  {fabric.category}
                  {fabric.stock !== null && ` · ${fabric.stock} in stock`}
                </p>
                <p className="mt-1.5 text-xs text-[#4B453E]" data-testid="tier-summary">
                  {fabric.priceTiers.length
                    ? tierSummary(fabric.price, fabric.priceTiers, fabric.unit)
                    : `${naira(fabric.price)} per ${fabric.unit}`}
                </p>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                {confirmId === fabric.id ? (
                  <>
                    <span className="self-center text-xs text-[#7A1F1A]">Delete this listing?</span>
                    <button
                      type="button"
                      onClick={() => remove(fabric)}
                      disabled={busyId === fabric.id}
                      className="rounded-xl bg-[#F6E3E0] px-3 py-2 text-xs font-semibold text-[#7A1F1A] hover:brightness-110"
                    >
                      {busyId === fabric.id ? 'Deleting…' : 'Delete'}
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="btn-ghost px-3 py-2">
                      Keep
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => togglePublished(fabric)}
                      disabled={busyId === fabric.id || Boolean(fabric.moderatedAt)}
                      title={fabric.moderatedAt ? 'Only IPILE can republish this listing' : undefined}
                      className="btn-ghost px-3 py-2"
                      aria-label={fabric.isPublished ? `Hide ${fabric.name}` : `Publish ${fabric.name}`}
                    >
                      {busyId === fabric.id ? (
                        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                      ) : fabric.isPublished ? (
                        <EyeOff size={14} aria-hidden="true" />
                      ) : (
                        <Eye size={14} aria-hidden="true" />
                      )}
                      {fabric.isPublished ? 'Hide' : 'Publish'}
                    </button>
                    <Link href={`/merchant/fabrics/${fabric.id}`} className="btn-ghost px-3 py-2" aria-label={`Edit ${fabric.name}`}>
                      <Pencil size={14} aria-hidden="true" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmId(fabric.id)}
                      className="btn-ghost px-3 py-2 hover:!border-[#9B2C24]/50"
                      aria-label={`Delete ${fabric.name}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
