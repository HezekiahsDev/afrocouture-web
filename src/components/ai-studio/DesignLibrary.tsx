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
        active ? 'border-[#00A3FF] bg-[#00A3FF]/10' : 'border-white/[0.08] bg-[#0F172A]/70 hover:border-[#00A3FF]/40'
      }`}
    >
      <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1E293B]">
        {url && <Image src={url} alt="" fill sizes="(max-width: 640px) 45vw, 180px" className="object-cover" />}
        {design.saved && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#090D16]/80 p-1 text-[#00A3FF]" aria-label="Saved">
            <Bookmark size={12} fill="currentColor" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-xs leading-4 text-[#94A3B8] group-hover:text-[#F8FAFC]">{design.prompt}</span>
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
      <div className="flex gap-1 overflow-x-auto rounded-full bg-[#090D16] p-1" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition ${
              tab === id ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#ffb4ab]/30 bg-[#93000a]/20 px-4 py-3 text-sm text-[#ffdad6]" role="alert">
          {error}
          <button type="button" onClick={() => void load(tab)} className="flex items-center gap-1 font-semibold underline">
            <RefreshCw size={14} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : loading && !shown.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-[#1E293B]" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-[#64748B]">{empty}</p>
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
