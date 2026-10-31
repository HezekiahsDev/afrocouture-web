'use client';

import Link from 'next/link';
import { LoaderCircle, LogIn, Sparkles } from 'lucide-react';
import type { AiDesign, AiQuota } from '@/types';
import {
  ASPECT_RATIOS,
  COLOURS,
  EXAMPLE_PROMPTS,
  FABRICS,
  GARMENT_TYPES,
  OCCASIONS,
  PROMPT_MAX,
  PROMPT_MIN,
} from './options';

export interface ComposerState {
  prompt: string;
  garmentType?: string;
  occasion?: string;
  fabric?: string;
  colour?: string;
  count: number;
  aspectRatio: AiDesign['aspectRatio'];
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(active ? undefined : option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                active
                  ? 'border-[#B8734E] bg-[#B8734E]/15 text-[#171717]'
                  : 'border-[#171717]/12 bg-[#FFFFFF]/60 text-[#6B655C] hover:border-[#B8734E]/50 hover:text-[#171717]'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function formatReset(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
}

export function Composer({
  state,
  onChange,
  onGenerate,
  generating,
  signedIn,
  signInHref,
  quota,
}: {
  state: ComposerState;
  onChange: (next: ComposerState) => void;
  onGenerate: () => void;
  generating: boolean;
  signedIn: boolean;
  signInHref: string;
  quota: AiQuota | null;
}) {
  const length = state.prompt.trim().length;
  const tooShort = length < PROMPT_MIN;
  const remaining = quota ? Math.max(0, quota.limit - quota.used) : null;
  const outOfQuota = remaining === 0;
  const set = (patch: Partial<ComposerState>) => onChange({ ...state, ...patch });

  return (
    // Level 3 "AI focus" surface: gradient hairline stroke + soft blue glow (DESIGN.md › Elevation).
    <div className="rounded-3xl bg-gradient-to-br from-[#B8734E] to-[#1F2A42] p-px shadow-[0_0_20px_-3px_rgba(184,115,78,0.35)]">
    <form
      className="relative flex flex-col gap-6 rounded-[23px] bg-[#FFFFFF] p-5 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        if (signedIn && !tooShort && !generating && !outOfQuota) onGenerate();
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="ai-prompt" className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
          Describe your design
        </label>
        <textarea
          id="ai-prompt"
          value={state.prompt}
          maxLength={PROMPT_MAX}
          rows={4}
          disabled={generating}
          onChange={(event) => set({ prompt: event.target.value })}
          placeholder="e.g. A flowing royal blue agbada with gold embroidery around the neckline, for a wedding"
          className="w-full resize-y rounded-2xl border border-[#171717]/12 bg-[#F5F0E8]/70 px-4 py-3 text-sm leading-6 text-[#171717] outline-none transition placeholder:text-[#6B655C] focus:border-[#B8734E] focus:shadow-[0_0_0_3px_rgba(184,115,78,0.15)] disabled:opacity-60"
        />
        <div className="flex items-center justify-between text-[11px] text-[#6B655C]">
          <span>{tooShort && length > 0 ? `At least ${PROMPT_MIN} characters` : 'Be specific about cut, colour and detail.'}</span>
          <span className="tabular-nums">
            {length}/{PROMPT_MAX}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Need inspiration?</span>
        <div className="flex flex-col gap-1.5">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              disabled={generating}
              onClick={() => set({ prompt: example })}
              className="rounded-xl border border-[#171717]/8 bg-[#F5F0E8]/50 px-3 py-2 text-left text-xs leading-5 text-[#6B655C] transition hover:border-[#B8734E]/30 hover:text-[#171717] disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        <ChipGroup label="Garment" options={GARMENT_TYPES} value={state.garmentType} onChange={(v) => set({ garmentType: v })} disabled={generating} />
        <ChipGroup label="Occasion" options={OCCASIONS} value={state.occasion} onChange={(v) => set({ occasion: v })} disabled={generating} />
        <ChipGroup label="Fabric" options={FABRICS} value={state.fabric} onChange={(v) => set({ fabric: v })} disabled={generating} />
        <ChipGroup label="Colour" options={COLOURS} value={state.colour} onChange={(v) => set({ colour: v })} disabled={generating} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Variations</legend>
          <div className="flex gap-1.5 rounded-full bg-[#F5F0E8] p-1">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                disabled={generating}
                aria-pressed={state.count === n}
                onClick={() => set({ count: n })}
                className={`flex-1 rounded-full py-1.5 text-xs font-bold tabular-nums transition ${
                  state.count === n ? 'bg-[#9E5B37] text-[#FFFDF8]' : 'text-[#6B655C] hover:text-[#171717]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">Shape</legend>
          <div className="flex gap-1.5 rounded-full bg-[#F5F0E8] p-1">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                type="button"
                disabled={generating}
                aria-pressed={state.aspectRatio === ratio.id}
                aria-label={ratio.label}
                onClick={() => set({ aspectRatio: ratio.id })}
                className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
                  state.aspectRatio === ratio.id ? 'bg-[#9E5B37] text-[#FFFDF8]' : 'text-[#6B655C] hover:text-[#171717]'
                }`}
              >
                {ratio.id}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3">
        {signedIn ? (
          <button
            type="submit"
            disabled={tooShort || generating || outOfQuota}
            className="btn-ai w-full justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={17} aria-hidden="true" /> Generate {state.count === 1 ? 'design' : `${state.count} designs`}
              </>
            )}
          </button>
        ) : (
          <Link href={signInHref} className="btn-ai w-full justify-center py-3.5">
            <LogIn size={17} aria-hidden="true" /> Sign in to generate
          </Link>
        )}
        {signedIn && quota && (
          <p className="text-center text-xs text-[#6B655C]" aria-live="polite">
            <span className="tabular-nums">
              {remaining} of {quota.limit}
            </span>{' '}
            generations left today · resets at {formatReset(quota.resetsAt)}
          </p>
        )}
        {!signedIn && (
          <p className="text-center text-xs text-[#6B655C]">Generating needs an IPILE account. Your prompt is kept when you come back.</p>
        )}
      </div>
    </form>
    </div>
  );
}
