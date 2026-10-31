'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Heart, MapPin, MessageSquareReply, Star } from 'lucide-react';
import { getTailor, naira } from '@/lib/catalog';
import { getTailorReviews } from '@/lib/orders';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Stars } from '@/components/orders/ReviewCard';
import { card, formatDate, ghostButton, primaryButton, Spinner } from '@/components/orders/ui';
import type { Tailor, TailorReview, TailorReviewPage } from '@/types';
import { CoverImage, ErrorState, Portrait, useRemote, useSavedItems, VerifiedBadge } from './shared';

/** Public artisan profile: who they are, their work, and what customers said. */
export default function TailorProfileView({ id }: { id: string }) {
  const { result, retry } = useRemote(() => Promise.all([getTailor(id), getTailorReviews(id)]), [id]);

  if (result.state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#6B655C]" role="status">
        <Spinner label="Loading artisan" />
      </div>
    );
  }
  if (result.state === 'error') {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-16">
        <ErrorState message={result.message} onRetry={retry} />
        <Link href="/tailors" className={cn(ghostButton, 'self-start')}>
          <ArrowLeft size={16} /> All artisans
        </Link>
      </div>
    );
  }
  const [tailor, reviews] = result.data;
  return <Profile tailor={tailor} firstPage={reviews} />;
}

function Profile({ tailor, firstPage }: { tailor: Tailor; firstPage: TailorReviewPage }) {
  const saved = useSavedItems();
  const name = tailor.displayName ?? tailor.atelierName ?? 'Artisan';
  const isSaved = saved.isSaved('tailor', tailor.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 py-8 sm:py-12">
      <Link href="/tailors" className="back-link w-fit">
        <ArrowLeft size={16} /> All artisans
      </Link>

      <section className={cn(card, 'overflow-hidden p-0 sm:p-0')}>
        <div className="relative h-48 bg-[#EFE7DA] sm:h-72">
          <CoverImage src={tailor.coverImageUrl ?? tailor.portraitUrl} alt={`${name}'s atelier`} sizes="(max-width: 1200px) 100vw, 1152px" eager />
        </div>
        <div className="flex flex-col gap-5 p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="-mt-14 overflow-hidden rounded-full border-4 border-[#FFFFFF] sm:-mt-20">
                <Portrait src={tailor.portraitUrl} name={name} size={88} />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                {tailor.atelierName && tailor.atelierName !== name && (
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#8F5637]">{tailor.atelierName}</span>
                )}
                <h1 className="text-[26px] font-extrabold leading-8 text-[#171717] sm:text-[34px] sm:leading-[42px]">{name}</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={ghostButton}
                aria-pressed={isSaved}
                onClick={() => void saved.toggle('tailor', tailor.id)}
              >
                <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-[#B8734E]' : undefined} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              {!tailor.isSample && (
                <Link href={`/orders/new?tailorId=${tailor.id}`} className={primaryButton}>
                  Request a commission <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#6B655C]">
            {tailor.verified && <VerifiedBadge label="Verified artisan" />}
            {tailor.city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} aria-hidden="true" /> {tailor.city}
              </span>
            )}
            {tailor.yearsExperience !== null && (
              <span className="flex items-center gap-1.5">
                <BriefcaseBusiness size={15} aria-hidden="true" /> {tailor.yearsExperience} yr{tailor.yearsExperience === 1 ? '' : 's'} experience
              </span>
            )}
            {tailor.rating !== null && (
              <a href="#reviews" className="flex items-center gap-1.5 text-[#B8734E] hover:underline">
                <Star size={15} fill="currentColor" aria-hidden="true" /> {tailor.rating.toFixed(1)}
                <span className="text-[#6B655C]">
                  ({tailor.reviewCount} review{tailor.reviewCount === 1 ? '' : 's'})
                </span>
              </a>
            )}
            <span className="font-semibold text-[#171717]">
              {tailor.startingPrice !== null ? `From ${naira(tailor.startingPrice)}` : 'Price on request'}
            </span>
          </div>
          {tailor.isSample && (
            <p className="rounded-xl border border-[#171717]/12 bg-[#171717]/3 px-4 py-3 text-sm text-[#6B655C]">
              This is a sample profile that shows what an atelier page looks like. It isn&apos;t taking commissions.
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className={cn(card, 'flex flex-col gap-4 self-start')} aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-lg font-bold text-[#171717]">About the atelier</h2>
          {tailor.craft && <p className="font-semibold text-[#5C3B29]">{tailor.craft}</p>}
          {tailor.bio ? (
            <p className="whitespace-pre-line text-sm leading-6 text-[#6B655C]">{tailor.bio}</p>
          ) : (
            <p className="text-sm text-[#6B655C]">This artisan hasn&apos;t written a bio yet.</p>
          )}
          {tailor.specialtyTags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Specialties">
              {tailor.specialtyTags.map((tag) => (
                <li key={tag} className="rounded-full border border-[#171717]/12 px-3 py-1 text-xs font-semibold text-[#4B453E]">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cn(card, 'flex flex-col gap-4')} aria-labelledby="portfolio-heading">
          <h2 id="portfolio-heading" className="text-lg font-bold text-[#171717]">Portfolio</h2>
          {tailor.portfolioUrls.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tailor.portfolioUrls.map((url, i) => (
                <li key={url} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#EFE7DA]">
                  <Image src={url} alt={`${name}'s work, piece ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 250px" className="object-cover" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#6B655C]">No portfolio pieces yet.</p>
          )}
        </section>
      </div>

      <Reviews tailorId={tailor.id} firstPage={firstPage} isSample={tailor.isSample} />
    </div>
  );
}

function Reviews({ tailorId, firstPage, isSample }: { tailorId: string; firstPage: TailorReviewPage; isSample: boolean }) {
  const [items, setItems] = useState<TailorReview[]>(firstPage.items);
  const [hasMore, setHasMore] = useState(firstPage.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const total = Object.values(firstPage.breakdown).reduce((a, b) => a + b, 0);

  const loadMore = useCallback(async () => {
    const last = items[items.length - 1];
    if (!last) return;
    setLoading(true);
    setError('');
    try {
      const page = await getTailorReviews(tailorId, { before: last.reviewedAt });
      setItems((prev) => [...prev, ...page.items]);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load more reviews.'));
    } finally {
      setLoading(false);
    }
  }, [items, tailorId]);

  return (
    <section id="reviews" className={cn(card, 'flex scroll-mt-28 flex-col gap-6')} aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-lg font-bold text-[#171717]">Customer reviews</h2>

      {total === 0 ? (
        <p className="text-sm text-[#6B655C]">
          {isSample
            ? 'This sample profile’s rating is illustrative; it has no customer reviews.'
            : 'No reviews yet. Reviews come only from customers who completed a commission with this artisan.'}
        </p>
      ) : (
        <>
          <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,320px)]">
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-extrabold text-[#171717]">{firstPage.rating?.toFixed(1)}</span>
              <Stars rating={Math.round(firstPage.rating ?? 0)} />
              <span className="text-xs text-[#6B655C]">
                {total} verified review{total === 1 ? '' : 's'}
              </span>
            </div>
            <dl className="flex flex-col gap-1.5">
              {(['5', '4', '3', '2', '1'] as const).map((r) => {
                const count = firstPage.breakdown[r];
                return (
                  <div key={r} className="flex items-center gap-3 text-xs text-[#6B655C]">
                    <dt className="w-10 shrink-0">{r} star</dt>
                    <dd className="h-2 flex-1 overflow-hidden rounded-full bg-[#171717]/6">
                      <span className="block h-full rounded-full bg-[#B8734E]" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                    </dd>
                    <dd className="w-6 text-right tabular-nums">{count}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <ul className="flex flex-col divide-y divide-white/[0.06]">
            {items.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 py-5 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={r.rating} size={14} />
                  <span className="text-sm font-semibold text-[#171717]">{r.reviewerName}</span>
                  <span className="text-xs text-[#6B655C]">
                    {r.garmentType} · {formatDate(r.reviewedAt)}
                  </span>
                </div>
                {r.review && <p className="text-sm leading-6 text-[#4B453E]">{r.review}</p>}
                {r.reply && (
                  <div className="ml-0 rounded-xl border border-[#171717]/10 bg-[#171717]/3 p-3 sm:ml-6">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B655C]">
                      <MessageSquareReply size={13} aria-hidden="true" /> Artisan&apos;s reply
                    </p>
                    <p className="text-sm leading-6 text-[#4B453E]">{r.reply}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {error && <p className="text-sm text-[#9B2C24]">{error}</p>}
          {hasMore && (
            <button type="button" className={cn(ghostButton, 'self-center')} onClick={loadMore} disabled={loading}>
              {loading && <Spinner />} More reviews
            </button>
          )}
        </>
      )}
    </section>
  );
}
