'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Bookmark, History, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react';
import { listDesigns } from '@/lib/ai';
import { apiErrorMessage } from '@/lib/api';
import type { AiDesign } from '@/types';

type Tab = 'session' | 'saved' | 'history';
const PAGE = 12;

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: 'session', label: 'This session', icon: Sparkles },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'history', label: 'History', icon: History },
];

function Thumb({ design, active, onOpen }: { design: AiDesign; active: boolean; onOpen: () => void }) {
  const url = design.imageUrls[design.selectedIndex] ?? design.imageUrls[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active ? 'true' : undefined}
      className={`group flex min-w-0 flex-col gap-2 rounded-2xl border p-2 text-left transition ${
        active ? 'border-[#B8734E] bg-[#B8734E]/10' : 'border-[#171717]/10 bg-[#FFFFFF]/70 hover:border-[#B8734E]/40'
      }`}
    >
      <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#FFFFFF]">
        {url && <Image src={url} alt="" fill sizes="(max-width: 640px) 45vw, 180px" className="object-cover" />}
        {design.saved && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#F5F0E8]/80 p-1 text-[#B8734E]" aria-label="Saved">
            <Bookmark size={12} fill="currentColor" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-xs leading-4 text-[#6B655C] group-hover:text-[#171717]">{design.prompt}</span>
    </button>
  );
}

/**
 * Past runs: this session's (kept in memory by the page), saved designs and full history
 * from the API, paged back with `before`.
 */
export function DesignLibrary({
  sessionDesigns,
  activeId,
  onOpen,
  refreshKey,
}: {
  sessionDesigns: AiDesign[];
  activeId: string | null;
  onOpen: (design: AiDesign) => void;
  /** Bumped by the page when a design is saved, unsaved or deleted. */
  refreshKey: number;
}) {
  const [tab, setTab] = useState<Tab>('session');
  const [items, setItems] = useState<AiDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (which: Tab, before?: string) => {
      if (which === 'session') return;
      setLoading(true);
      setError('');
      try {
        const page = await listDesigns({ saved: which === 'saved' ? true : undefined, limit: PAGE, before });
        setItems((prev) => (before ? [...prev, ...page] : page));
        setHasMore(page.length === PAGE);
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not load your designs.'));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Reload the server-backed tabs when switching to them or after the page changes a design.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(tab);
  }, [tab, refreshKey, load]);

  const shown = tab === 'session' ? sessionDesigns : items;
  const empty =
    tab === 'session'
      ? 'Designs you generate now will appear here.'
      : tab === 'saved'
        ? 'Nothing saved yet. Save a design you like to keep it in your collection.'
        : 'No designs yet. Describe an idea above to generate your first.';

  return (
    <section className="flex flex-col gap-4" aria-label="Your designs">
      <div className="flex gap-1 overflow-x-auto rounded-full bg-[#F5F0E8] p-1" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition ${
              tab === id ? 'bg-[#FFFFFF] text-[#171717]' : 'text-[#6B655C] hover:text-[#171717]'
            }`}
          >
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#9B2C24]/30 bg-[#F6E3E0]/20 px-4 py-3 text-sm text-[#7A1F1A]" role="alert">
          {error}
          <button type="button" onClick={() => void load(tab)} className="flex items-center gap-1 font-semibold underline">
            <RefreshCw size={14} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : loading && !shown.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-[#FFFFFF]" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#171717]/12 px-4 py-8 text-center text-sm text-[#6B655C]">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((design) => (
            <Thumb key={design.id} design={design} active={design.id === activeId} onOpen={() => onOpen(design)} />
          ))}
        </div>
      )}

      {tab !== 'session' && hasMore && !error && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void load(tab, items.at(-1)?.createdAt)}
          className="btn-ghost justify-center"
        >
          {loading ? <LoaderCircle size={16} className="animate-spin" aria-label="Loading" /> : 'Load older designs'}
        </button>
      )}
    </section>
  );
}
