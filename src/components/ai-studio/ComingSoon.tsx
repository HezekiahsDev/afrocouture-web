import Link from 'next/link';
import { ArrowLeft, ArrowRight, ImagePlus, Scissors, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, ghostButton, primaryButton } from '@/components/orders/ui';

const steps = [
  { icon: Scissors, title: 'Choose an artisan', body: 'Browse verified artisans and pick one whose work you like.' },
  { icon: ImagePlus, title: 'Upload your style', body: 'Add up to six photos of the look, details or silhouette you want.' },
  { icon: Sparkles, title: 'Get a quote', body: 'The artisan quotes for it. You pay into escrow once you accept.' },
];

/** Shown at /ai-studio while generation is switched off. */
export default function AiStudioComingSoon({ prompt }: { prompt?: string }) {
  const idea = prompt?.trim().slice(0, 400);
  const commissionHref = idea ? `/orders/new?brief=${encodeURIComponent(idea)}` : '/orders/new';
  return (
    <div className="flex flex-col gap-8 pb-16 pt-8 sm:pt-10">
      <Link href="/marketplace" className="back-link w-fit">
        <ArrowLeft size={16} /> Back to Discover
      </Link>
      <header className="flex max-w-2xl flex-col gap-3">
        <span className="section-kicker">AI DESIGN STUDIO · COMING SOON</span>
        <h1 className="text-[30px] font-extrabold leading-[38px] text-[#F8FAFC] sm:text-[40px] sm:leading-[48px]">
          Sketch your idea{' '}
          <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            with AI, soon.
          </span>
        </h1>
        <p className="text-sm leading-6 text-[#94A3B8] sm:text-base">
          We&apos;re putting the finishing touches on AI Studio. Until it opens, you can still commission the
          exact look you want: upload photos of the style and an artisan will quote for it.
        </p>
      </header>

      {idea && (
        <div className="max-w-2xl rounded-2xl border border-[#00A3FF]/25 bg-[#00A3FF]/5 p-4 text-sm text-[#cfe5ff]">
          <span className="font-semibold text-[#F8FAFC]">Your idea:</span> {idea}
          <span className="mt-1 block text-[#94A3B8]">We&apos;ll add it to your commission brief.</span>
        </div>
      )}

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className={cn(card, 'flex flex-col gap-2')}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#00A3FF]/10 text-[#22D3EE]">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="text-xs font-bold tracking-widest text-[#64748B]">STEP {i + 1}</span>
            <span className="font-bold text-[#F8FAFC]">{title}</span>
            <span className="text-sm leading-6 text-[#94A3B8]">{body}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Link
          href={commissionHref}
          className={primaryButton}
        >
          Start a commission <ArrowRight size={16} />
        </Link>
        <Link
          href="/tailors"
          className={ghostButton}
        >
          Browse artisans
        </Link>
      </div>
    </div>
  );
}
