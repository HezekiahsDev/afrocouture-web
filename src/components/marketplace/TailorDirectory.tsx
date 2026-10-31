"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import { getTailors, naira } from "@/lib/catalog";
import {
  CoverImage,
  EmptyState,
  ErrorState,
  Portrait,
  SkeletonCards,
  VerifiedBadge,
  uniqueValues,
  useRemote,
  useSavedItems,
} from "./shared";

const ALL_CITIES = "All cities";

export default function TailorDirectory() {
  const { result, retry } = useRemote(() => getTailors(), []);
  const saved = useSavedItems();
  const [city, setCity] = useState(ALL_CITIES);
  const tailors = result.state === "ready" ? result.data : [];
  const cities = uniqueValues(tailors.map((item) => item.city));
  const shown = tailors.filter(
    (item) => city === ALL_CITIES || item.city === city,
  );

  // Cards load after the first paint, so honour /tailors#<id> once they exist.
  useEffect(() => {
    if (result.state !== "ready" || !window.location.hash) return;
    document
      .getElementById(decodeURIComponent(window.location.hash.slice(1)))
      ?.scrollIntoView({ block: "start" });
  }, [result.state]);

  return (
    <div className="catalog-page">
      <Link className="back-link" href="/marketplace">
        <ArrowLeft size={16} /> Back to discover
      </Link>
      <div className="catalog-heading">
        <span className="section-kicker">
          MEET THE MAKERS / CRAFT WITH CHARACTER
        </span>
        <h1>
          Made by <em>someone.</em>
          <br />
          Made for you.
        </h1>
        <p>
          Discover the people and point of view behind each piece. Find a maker
          whose craft feels like yours.
        </p>
        {tailors.some((item) => item.isSample) && (
          <span className="preview-note">
            Illustrative profiles and sample pricing for this preview.
          </span>
        )}
      </div>
      {cities.length > 1 && (
        <div className="filter-row" aria-label="Filter artisans by city">
          {[ALL_CITIES, ...cities].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={city === value}
              className={city === value ? "selected" : ""}
              onClick={() => setCity(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {result.state === "error" ? (
        <ErrorState message={result.message} onRetry={retry} />
      ) : (
        <div className="directory-grid">
          {result.state === "loading" ? (
            <SkeletonCards count={3} variant="directory" />
          ) : shown.length ? (
            shown.map((item, index) => {
              const isSaved = saved.isSaved("tailor", item.id);
              const name = item.displayName ?? item.atelierName ?? "Artisan";
              return (
                <article className="directory-card" id={item.id} key={item.id}>
                  <div className="directory-photo">
                    <CoverImage
                      src={item.coverImageUrl ?? item.portraitUrl}
                      alt={`${name} in their atelier`}
                      eager={index === 0}
                      sizes="(max-width: 700px) 100vw, 33vw"
                    />
                    <button
                      type="button"
                      aria-label={`${isSaved ? "Remove" : "Save"} ${name}`}
                      aria-pressed={isSaved}
                      onClick={() => void saved.toggle("tailor", item.id)}
                      className={`directory-save ${isSaved ? "saved" : ""}`}
                    >
                      <Heart size={19} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="directory-copy">
                    <div className="directory-person">
                      <Portrait src={item.portraitUrl} name={name} size={55} />
                      <div>
                        <span>{item.atelierName}</span>
                        <h2>
                          <Link href={`/tailors/${item.id}`} className="hover:text-[#8F5637]">
                            {name}
                          </Link>
                        </h2>
                      </div>
                    </div>
                    {item.verified && <VerifiedBadge label="Verified artisan" />}
                    <div className="directory-meta">
                      {item.city && (
                        <span>
                          <MapPin size={14} />
                          {item.city}
                        </span>
                      )}
                      {item.rating !== null && (
                        <span>
                          <Link href={`/tailors/${item.id}#reviews`} className="inline-flex items-center gap-[5px] hover:text-[#171717]">
                            <Star size={14} fill="currentColor" />
                            {item.rating.toFixed(1)}
                            {item.reviewCount > 0 && ` (${item.reviewCount})`}
                          </Link>
                        </span>
                      )}
                      {item.yearsExperience !== null && (
                        <span>
                          {item.yearsExperience} yr
                          {item.yearsExperience === 1 ? "" : "s"} experience
                        </span>
                      )}
                    </div>
                    {item.craft && <p className="mk-craft">{item.craft}</p>}
                    {item.bio && <p>{item.bio}</p>}
                    {item.specialtyTags.length > 0 && (
                      <div className="directory-tags">
                        {item.specialtyTags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="directory-end">
                      <strong>
                        {item.startingPrice !== null
                          ? `From ${naira(item.startingPrice)}`
                          : "Price on request"}
                      </strong>
                      {item.isSample ? (
                        <Link href={`/tailors/${item.id}`}>
                          View profile <ArrowUpRight size={16} />
                        </Link>
                      ) : (
                        <Link href={`/orders/new?tailorId=${item.id}`}>
                          Request a commission <ArrowUpRight size={16} />
                        </Link>
                      )}
                    </div>
                    {item.isSample && (
                      <p className="mk-commission-note">
                        Sample profile — not taking commissions.
                      </p>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState
              title={
                city === ALL_CITIES
                  ? "No artisans here yet"
                  : `No artisans in ${city} yet`
              }
              body="Verified artisans appear here as soon as they're approved. Are you a tailor? Join and start your verification."
              action={
                <Link href="/onboarding" className="mk-state-action">
                  Join as an artisan <ArrowRight size={15} />
                </Link>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
