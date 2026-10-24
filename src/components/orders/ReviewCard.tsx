'use client';

import { useState, type FormEvent } from 'react';
import { EyeOff, MessageSquareReply, Star } from 'lucide-react';
import { replyToReview, reviewOrder } from '@/lib/orders';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';
import { fieldClass, formatDate, InlineAlert, labelClass, primaryButton, SectionCard, Spinner, useAction } from './ui';

/** Mirrors REVIEW_WINDOW_DAYS in afrocouture-api/src/orders/orders.service.ts. */
const REVIEW_WINDOW_DAYS = 60;

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#FBBF24]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= rating ? 'currentColor' : 'none'} className={n > rating ? 'text-[#475569]' : undefined} aria-hidden="true" />
      ))}
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onChange(n)}
          className="p-1 text-[#FBBF24]"
        >
          <Star size={26} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

/** The review on a finished order: rate it (customer), read it, and reply once (artisan). */
export function ReviewCard({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const role = order.viewerRole;
  const [now] = useState(() => Date.now());
  const finishedAt = new Date(order.completedAt ?? order.updatedAt).getTime();
  const canRate =
    role === 'customer' && order.rating === null && now - finishedAt <= REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  if (order.rating === null && !canRate) return null;
  return (
    <SectionCard title={order.rating === null ? 'Rate your artisan' : 'Review'} kicker="Shown on the artisan’s profile" className="scroll-mt-28">
      <div id="review" className="flex flex-col gap-4">
        {order.rating === null ? <RateForm order={order} onUpdate={onUpdate} /> : <ReviewBody order={order} onUpdate={onUpdate} />}
      </div>
    </SectionCard>
  );
}

function RateForm({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const { busy, error, run } = useAction();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const artisan = order.tailor?.displayName ?? order.tailor?.atelierName ?? 'your artisan';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!rating) return;
    const updated = await run('review', () => reviewOrder(order.id, rating, review.trim() || undefined));
    if (updated) onUpdate(updated);
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={submit}>
      <p className="text-sm text-[#94A3B8]">
        How did {artisan} do? Your first name and last initial appear with the review.
      </p>
      <fieldset>
        <legend className={labelClass}>Your rating</legend>
        <StarPicker value={rating} onChange={setRating} />
      </fieldset>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Review (optional)</span>
        <textarea
          className={cn(fieldClass, 'min-h-20')}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={1000}
          placeholder="Fit, finishing, communication, timing…"
        />
      </label>
      {error && <InlineAlert>{error}</InlineAlert>}
      <button type="submit" className={cn(primaryButton, 'self-start')} disabled={!rating || busy !== null}>
        {busy === 'review' && <Spinner />} Post review
      </button>
    </form>
  );
}

function ReviewBody({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const { busy, error, run } = useAction();
  const [reply, setReply] = useState('');
  const isTailor = order.viewerRole === 'tailor';

  async function submit(e: FormEvent) {
    e.preventDefault();
    const updated = await run('reply', () => replyToReview(order.id, reply.trim()));
    if (updated) onUpdate(updated);
  }

  return (
    <>
      {order.reviewHiddenAt && (
        <InlineAlert tone="info">
          <EyeOff size={14} className="mr-1 inline" aria-hidden="true" />
          This review was hidden from the artisan&apos;s profile by AfroCouture and doesn&apos;t count towards their rating.
        </InlineAlert>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Stars rating={order.rating ?? 0} />
          {order.reviewedAt && <span className="text-xs text-[#64748B]">{formatDate(order.reviewedAt)}</span>}
        </div>
        {order.review ? (
          <p className="text-sm leading-6 text-[#cbd5e1]">“{order.review}”</p>
        ) : (
          <p className="text-sm text-[#64748B]">No written review.</p>
        )}
      </div>

      {order.reviewReply ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            <MessageSquareReply size={14} aria-hidden="true" /> Artisan&apos;s reply
          </p>
          <p className="text-sm leading-6 text-[#cbd5e1]">{order.reviewReply}</p>
        </div>
      ) : (
        isTailor && (
          <form className="flex flex-col gap-2" onSubmit={submit}>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Reply publicly (once)</span>
              <textarea
                className={cn(fieldClass, 'min-h-20')}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                maxLength={1000}
                placeholder="Thank your customer, or add context other customers should know."
              />
            </label>
            {error && <InlineAlert>{error}</InlineAlert>}
            <button type="submit" className={cn(primaryButton, 'self-start')} disabled={reply.trim().length < 2 || busy !== null}>
              {busy === 'reply' && <Spinner />} Post reply
            </button>
          </form>
        )
      )}
    </>
  );
}
