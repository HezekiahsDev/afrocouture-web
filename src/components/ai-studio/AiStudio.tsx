'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, ImageOff, Wand2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiErrorCode, apiErrorMessage } from '@/lib/api';
import { deleteDesign, generateDesign, getDesign, getQuota, updateDesign } from '@/lib/ai';
import type { AiDesign, AiQuota } from '@/types';
import { Composer, type ComposerState } from './Composer';
import { DesignResult, GeneratingPreview } from './DesignResult';
import { DesignLibrary } from './DesignLibrary';

interface StudioError {
  title: string;
  message: string;
}

/** Turns a failed generation into a message that tells the person what to do next. */
function describeError(err: unknown): StudioError {
  const status = axios.isAxiosError(err) ? err.response?.status : undefined;
  const code = apiErrorCode(err);
  if (code === 'AI_DAILY_LIMIT') {
    const body = axios.isAxiosError(err) ? (err.response?.data as { error?: { resetsAt?: string } } | undefined) : undefined;
    const resetsAt = body?.error?.resetsAt;
    const when = resetsAt
      ? new Date(resetsAt).toLocaleString('en-NG', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
      : 'tomorrow';
    return { title: "You've reached today's limit", message: `You can generate more designs from ${when}. Your saved designs are below.` };
  }
  if (status === 429) return { title: 'Slow down a little', message: apiErrorMessage(err) };
  if (status === 422) {
    return {
      title: 'That prompt was blocked',
      message: 'The image safety filter stopped this one. Try describing the garment, fabric and occasion without mentioning real people or brands.',
    };
  }
  if (status === 503) return { title: "AI Studio isn't available right now", message: 'Please try again later. Your prompt has been kept.' };
  return { title: 'Something went wrong', message: apiErrorMessage(err, 'We could not generate designs this time. Please try again.') };
}

const initialState = (prompt?: string): ComposerState => ({
  prompt: prompt?.slice(0, 400) ?? '',
  count: 4,
  aspectRatio: '3:4',
});

export default function AiStudio({ initialPrompt, initialDesignId }: { initialPrompt?: string; initialDesignId?: string }) {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const [composer, setComposer] = useState<ComposerState>(() => initialState(initialPrompt));
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [current, setCurrent] = useState<AiDesign | null>(null);
  const [session, setSession] = useState<AiDesign[]>([]);
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StudioError | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const composerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const refreshQuota = useCallback(() => {
    getQuota()
      .then(setQuota)
      .catch(() => setQuota(null));
  }, []);

  useEffect(() => {
    if (signedIn) refreshQuota();
  }, [signedIn, refreshQuota]);

  // Deep link: /ai-studio?design=<id>
  useEffect(() => {
    if (!signedIn || !initialDesignId) return;
    let cancelled = false;
    getDesign(initialDesignId)
      .then((design) => {
        if (!cancelled) setCurrent(design);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, initialDesignId]);

  useEffect(() => {
    if (!generating) return;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [generating]);

  const show = useCallback((design: AiDesign) => {
    setCurrent(design);
    setNotFound(false);
    setError(null);
    // Keep the URL shareable without re-rendering the server wrapper.
    window.history.replaceState(null, '', `/ai-studio?design=${design.id}`);
  }, []);

  const replace = (updated: AiDesign) => {
    setCurrent(updated);
    setSession((list) => list.map((d) => (d.id === updated.id ? updated : d)));
  };

  async function generate() {
    setGenerating(true);
    setElapsed(0);
    setError(null);
    setNotFound(false);
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const design = await generateDesign({
        prompt: composer.prompt.trim(),
        garmentType: composer.garmentType,
        occasion: composer.occasion,
        fabric: composer.fabric,
        colour: composer.colour,
        count: composer.count,
        aspectRatio: composer.aspectRatio,
      });
      setSession((list) => [design, ...list]);
      show(design);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setGenerating(false);
      refreshQuota();
    }
  }

  async function mutate(
    action: () => Promise<AiDesign | void>,
    onDone?: (result: AiDesign | void) => void,
    onFail?: () => void,
  ) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      onDone?.(result);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      onFail?.();
      setError({ title: 'That didn’t save', message: apiErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const signInHref = `/signin?next=${encodeURIComponent(
    composer.prompt.trim() ? `/ai-studio?prompt=${encodeURIComponent(composer.prompt.trim())}` : '/ai-studio',
  )}`;

  return (
    <div className="flex flex-col gap-8 pb-16 pt-8 sm:pt-10">
      <Link href="/marketplace" className="back-link w-fit">
        <ArrowLeft size={16} /> Back to discover
      </Link>

      <header className="flex max-w-2xl flex-col gap-3">
        <span className="section-kicker">AI DESIGN STUDIO</span>
        <h1 className="text-[30px] font-extrabold leading-[38px] text-[#171717] sm:text-[40px] sm:leading-[48px]">
          Sketch your idea <span className="bg-gradient-to-r from-[#B8734E] via-[#1F2A42] to-[#B8734E] bg-clip-text text-transparent">with AI.</span>
        </h1>
        <p className="text-sm leading-6 text-[#6B655C] sm:text-base">
          Describe a garment and get visual concepts in seconds. Pick the one you love and send it to an artisan as the
          starting point for your commission.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div ref={composerRef} className="min-w-0 lg:sticky lg:top-28">
          <Composer
            state={composer}
            onChange={setComposer}
            onGenerate={generate}
            generating={generating}
            signedIn={signedIn}
            signInHref={signInHref}
            quota={quota}
          />
        </div>

        <div ref={resultRef} className="flex min-w-0 scroll-mt-28 flex-col gap-8">
          {error && (
            <div className="rounded-2xl border border-[#9B2C24]/30 bg-[#F6E3E0]/20 px-5 py-4" role="alert">
              <p className="font-display text-sm font-bold text-[#7A1F1A]">{error.title}</p>
              <p className="mt-1 text-sm text-[#7A1F1A]/90">{error.message}</p>
            </div>
          )}

          {generating ? (
            <GeneratingPreview count={composer.count} aspectRatio={composer.aspectRatio} elapsed={elapsed} />
          ) : current ? (
            <DesignResult
              design={current}
              busy={busy}
              onSelect={(index) => {
                if (index === current.selectedIndex) return;
                const previous = current;
                replace({ ...current, selectedIndex: index });
                void mutate(
                  () => updateDesign(current.id, { selectedIndex: index }),
                  (updated) => updated && replace(updated),
                  () => replace(previous),
                );
              }}
              onToggleSave={() => void mutate(() => updateDesign(current.id, { saved: !current.saved }), (u) => u && replace(u))}
              onDelete={() => {
                if (!window.confirm('Delete this design and its images? This can’t be undone.')) return;
                const id = current.id;
                void mutate(
                  () => deleteDesign(id),
                  () => {
                    setSession((list) => list.filter((d) => d.id !== id));
                    setCurrent(null);
                    window.history.replaceState(null, '', '/ai-studio');
                  },
                );
              }}
              onEditPrompt={() => {
                setComposer({
                  prompt: current.prompt,
                  garmentType: current.options.garmentType,
                  occasion: current.options.occasion,
                  fabric: current.options.fabric,
                  colour: current.options.colour,
                  count: current.imageUrls.length || 4,
                  aspectRatio: current.aspectRatio,
                });
                composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                composerRef.current?.querySelector('textarea')?.focus({ preventScroll: true });
              }}
            />
          ) : notFound ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#171717]/12 px-6 py-14 text-center">
              <ImageOff size={28} className="text-[#6B655C]" aria-hidden="true" />
              <p className="font-display text-base font-bold text-[#171717]">We couldn’t find that design</p>
              <p className="max-w-sm text-sm text-[#6B655C]">It may have been deleted, or it belongs to another account.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#171717]/12 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B8734E] to-[#1F2A42] text-[#171717]">
                <Wand2 size={22} aria-hidden="true" />
              </span>
              <p className="font-display text-base font-bold text-[#171717]">Your designs will appear here</p>
              <p className="max-w-sm text-sm text-[#6B655C]">
                {initialDesignId && !signedIn
                  ? 'Sign in to open this design.'
                  : 'Describe a garment, pick a few details and generate up to four variations.'}
              </p>
            </div>
          )}

          {signedIn && (
            <DesignLibrary sessionDesigns={session} activeId={current?.id ?? null} onOpen={show} refreshKey={refreshKey} />
          )}
        </div>
      </div>
    </div>
  );
}
