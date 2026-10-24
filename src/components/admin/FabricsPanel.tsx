'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { EyeOff, Eye } from 'lucide-react';
import { listFabrics, setFabricPublished } from '@/lib/admin';
import { apiErrorMessage } from '@/lib/api';
import { useRemote, ErrorState } from '@/components/marketplace/shared';
import type { AdminFabric } from '@/types/admin';
import { AdminHeading } from './AdminShell';
import { Alert, Chips, Empty, Loading, Pager, Pill, SearchBox, fmtDate, naira } from './ui';
import { useUrlFilters } from './useUrlFilters';
import { KycPill } from './UserDetail';

const VISIBILITY = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Published' },
  { value: 'false', label: 'Unpublished' },
];
const LIMIT = 20;

export function FabricsPanel() {
  const [f, set] = useUrlFilters(['q', 'published', 'page'] as const);
  const page = Number(f.page) || 1;
  const [version, setVersion] = useState(0);
  const { result, retry } = useRemote(
    () => listFabrics({ q: f.q || undefined, published: f.published ? f.published === 'true' : undefined, page, limit: LIMIT }),
    [f.q, f.published, page, version],
  );

  return (
    <>
      <AdminHeading kicker="Community" title="Fabrics" />
      <p className="-mt-3 mb-5 max-w-2xl text-sm text-[#94A3B8]">
        Take down listings that break the rules. The merchant is notified with your reason and can&apos;t republish it until an
        admin does.
      </p>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox label="Search fabrics" placeholder="Fabric or merchant" value={f.q} onChange={(q) => set({ q })} />
        <Chips label="Visibility" value={f.published} onChange={(published) => set({ published })} options={VISIBILITY} />
      </div>
      {result.state === 'loading' && <Loading label="Loading fabrics" />}
      {result.state === 'error' && <ErrorState message={result.message} onRetry={retry} />}
      {result.state === 'ready' && result.data.items.length === 0 && <Empty>No fabrics match these filters.</Empty>}
      {result.state === 'ready' && result.data.items.length > 0 && (
        <div className="flex flex-col gap-4">
          <ul className="grid gap-3">
            {result.data.items.map((fabric) => (
              <FabricRow key={fabric.id} fabric={fabric} onChanged={() => setVersion((v) => v + 1)} />
            ))}
          </ul>
          <Pager page={page} limit={LIMIT} total={result.data.total} onPage={(p) => set({ page: String(p) })} />
        </div>
      )}
    </>
  );
}

function FabricRow({ fabric, onChanged }: { fabric: AdminFabric; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function apply(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await setFabricPublished(fabric.id, !fabric.isPublished, fabric.isPublished ? note.trim() : undefined);
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-4" data-testid="fabric-row">
      <div className="flex flex-wrap items-center gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#1E293B]">
          <Image src={fabric.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#F8FAFC]">{fabric.name}</p>
          <p className="truncate text-xs text-[#94A3B8]">
            {fabric.category} · {naira(fabric.price)}/{fabric.unit} · {fabric.merchant.businessName ?? 'Merchant'}{' '}
            <KycPill status={fabric.merchant.verificationStatus} />
          </p>
          {fabric.moderatedAt && (
            <p className="mt-1 text-xs text-[#ffb4ab]">
              Taken down {fmtDate(fabric.moderatedAt)}: “{fabric.unpublishedReason}”
            </p>
          )}
        </div>
        <span className="flex items-center gap-2">
          {fabric.isSample && <Pill>Sample</Pill>}
          <Pill tone={fabric.isPublished ? 'green' : 'amber'}>{fabric.isPublished ? 'Published' : 'Unpublished'}</Pill>
          {fabric.isPublished ? (
            <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              <EyeOff size={14} aria-hidden="true" /> Take down
            </button>
          ) : (
            <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => apply()} disabled={busy}>
              <Eye size={14} aria-hidden="true" /> {busy ? 'Saving…' : 'Republish'}
            </button>
          )}
        </span>
      </div>
      {open && (
        <form onSubmit={apply} className="mt-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#94A3B8]">Reason (sent to the merchant)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              minLength={5}
              maxLength={500}
              required
              className="min-h-20 rounded-xl border border-white/10 bg-[#0F172A]/80 px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00A3FF]"
              placeholder="e.g. Photos don't show the actual fabric being sold."
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={busy || note.trim().length < 5}>
              {busy ? 'Saving…' : 'Take down listing'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && <div className="mt-3"><Alert>{error}</Alert></div>}
    </li>
  );
}
