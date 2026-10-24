'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ExternalLink, PencilLine, Scissors, Sparkles, Trash2 } from 'lucide-react';
import type { AiDesign } from '@/types';
import { ratioCss } from './options';

export function GeneratingPreview({ count, aspectRatio, elapsed }: { count: number; aspectRatio: string; elapsed: number }) {
  return (
    <section
      className="flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-[#0F172A]/80 p-5 sm:p-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00A3FF] to-[#9333EA] text-white">
          <Sparkles size={17} className="animate-pulse" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-base font-bold text-[#F8FAFC]">Creating your designs…</p>
          <p className="text-xs text-[#94A3B8]">
            <span className="tabular-nums">{elapsed}s</span> · usually takes 10–40 seconds
          </p>
        </div>
      </div>
      <div className={`grid gap-3 ${count > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B]"
            style={{ aspectRatio: ratioCss(aspectRatio) }}
          />
        ))}
      </div>
    </section>
  );
}

export function DesignResult({
  design,
  busy,
  onSelect,
  onToggleSave,
  onDelete,
  onEditPrompt,
}: {
  design: AiDesign;
  busy: boolean;
  onSelect: (index: number) => void;
  onToggleSave: () => void;
  onDelete: () => void;
  onEditPrompt: () => void;
}) {
  const selected = design.imageUrls[design.selectedIndex] ?? design.imageUrls[0];
  const chips = [design.options.garmentType, design.options.occasion, design.options.fabric, design.options.colour].filter(
    Boolean,
  ) as string[];

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-white/[0.08] bg-[#0F172A]/80 p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_96px]">
        <div
          className="relative overflow-hidden rounded-2xl bg-[#1E293B]"
          style={{ aspectRatio: ratioCss(design.aspectRatio) }}
        >
          {selected && (
            <Image
              src={selected}
              alt={`AI-generated concept: ${design.prompt}`}
              fill
              sizes="(max-width: 900px) 100vw, 560px"
              className="object-cover"
              priority
            />
          )}
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#090D16]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22D3EE] backdrop-blur">
            Variation {design.selectedIndex + 1} of {design.imageUrls.length}
          </span>
        </div>

        {design.imageUrls.length > 1 && (
          <div className="flex gap-2 md:flex-col" role="listbox" aria-label="Variations">
            {design.imageUrls.map((url, index) => (
              <button
                key={url}
                type="button"
                role="option"
                aria-selected={index === design.selectedIndex}
                aria-label={`Variation ${index + 1}`}
                disabled={busy}
                onClick={() => onSelect(index)}
                className={`relative w-1/4 shrink-0 overflow-hidden rounded-xl border-2 transition md:w-full ${
                  index === design.selectedIndex ? 'border-[#00A3FF]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ aspectRatio: ratioCss(design.aspectRatio) }}
              >
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#94A3B8]">AI-generated concept — your artisan will adapt it to your measurements and fabric.</p>

      <div className="flex flex-col gap-2 border-t border-white/[0.08] pt-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Your prompt</span>
        <p className="text-sm leading-6 text-[#F8FAFC]">{design.prompt}</p>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[#94A3B8]">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link href={`/orders/new?aiDesignId=${design.id}`} className="btn-primary justify-center">
          <Scissors size={16} aria-hidden="true" /> Commission this design
        </Link>
        <button type="button" onClick={onToggleSave} disabled={busy} className="btn-ghost justify-center" aria-pressed={design.saved}>
          {design.saved ? (
            <>
              <BookmarkCheck size={16} className="text-[#00A3FF]" aria-hidden="true" /> Saved
            </>
          ) : (
            <>
              <Bookmark size={16} aria-hidden="true" /> Save to collection
            </>
          )}
        </button>
        <button type="button" onClick={onEditPrompt} disabled={busy} className="btn-ghost justify-center">
          <PencilLine size={16} aria-hidden="true" /> Edit prompt & regenerate
        </button>
        {selected && (
          <a href={selected} target="_blank" rel="noreferrer" className="btn-ghost justify-center">
            <ExternalLink size={16} aria-hidden="true" /> Open full size
          </a>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="btn-ghost justify-center text-[#ffb4ab] hover:border-[#ffb4ab]/40"
        >
          <Trash2 size={16} aria-hidden="true" /> Delete
        </button>
      </div>
    </section>
  );
}
