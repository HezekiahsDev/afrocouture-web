"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MoveUpRight,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  SwatchBook,
  WandSparkles,
  X,
} from "lucide-react";
import { getFabrics, getStyles, getTailors, naira } from "@/lib/catalog";
import { AI_STUDIO_ENABLED } from "@/lib/features";
import { useI18n } from "@/i18n/I18nProvider";
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

// Sentinel values for the filter state; only their labels are translated.
const ALL_CITIES = "All cities";
const ALL_FABRICS = "All";

export default function MarketplaceExperience({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const query = initialQuery.trim();
  const term = query.toLowerCase();
  const router = useRouter();
  const { t } = useI18n();
  const c = t.marketplace;
  const saved = useSavedItems();
  const [fabricType, setFabricType] = useState(ALL_FABRICS);
  const [city, setCity] = useState(ALL_CITIES);
  const [prompt, setPrompt] = useState("");
  const styleRail = useRef<HTMLDivElement>(null);

  const styles = useRemote(getStyles, []);
  const tailors = useRemote(() => getTailors(query ? { q: query } : {}), [query]);
  const fabrics = useRemote(() => getFabrics(query ? { q: query } : {}), [query]);

  // The styles API has no search, so match the term locally.
  const visibleStyles =
    styles.result.state === "ready"
      ? styles.result.data.filter(
          (item) =>
            !term ||
            `${item.name} ${item.category}`.toLowerCase().includes(term),
        )
      : [];
  const allTailors = tailors.result.state === "ready" ? tailors.result.data : [];
  const cities = uniqueValues(allTailors.map((item) => item.city));
  const visibleTailors = allTailors.filter(
    (item) => city === ALL_CITIES || item.city === city,
  );
  const allFabrics = fabrics.result.state === "ready" ? fabrics.result.data : [];
  const categories = uniqueValues(allFabrics.map((item) => item.category));
  const visibleFabrics = allFabrics.filter(
    (item) => fabricType === ALL_FABRICS || item.category === fabricType,
  );

  const resultsReady =
    tailors.result.state === "ready" && fabrics.result.state === "ready";

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-rule" /> {c.heroEyebrow}
          </div>
          <h1 id="hero-title">
            {c.heroTitleLead}
            <br />
            <em>{c.heroTitleEmphasis}</em>
          </h1>
          <p>{c.heroBody}</p>
          <div className="hero-actions">
            <Link href="/onboarding" className="action-primary">
              {c.startDesign} <ArrowUpRight size={19} />
            </Link>
            <Link href="#explore" className="action-text">
              {c.exploreAtelier} <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="hero-footnote-icon">
              <ShieldCheck size={18} />
            </span>{" "}
            {c.heroTrust}
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/hero-editorial.jpg"
            alt="Model in colorful African couture against a studio backdrop"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 800px) 100vw, 52vw"
            className="cover-image"
          />
          <div className="hero-image-tint" />
          <div className="hero-image-label">
            <span>{c.heroLabelKicker}</span>
            <strong>{c.heroLabelTitle}</strong>
            <ArrowUpRight size={19} />
          </div>
          <div className="hero-vertical">{c.heroVertical}</div>
        </div>
        <a
          href="#explore"
          className="hero-scroll"
          aria-label={c.scrollToExplore}
        >
          <ArrowDown size={17} />
        </a>
      </section>

      <div className="value-strip" aria-label={c.valueStripLabel}>
        <span>
          <Scissors size={18} /> {c.valueArtisans}
        </span>
        <i />
        <span>
          <Sparkles size={18} /> {c.valueStyle}
        </span>
        <i />
        <span>
          <ShieldCheck size={18} /> {c.valueMadeAroundYou}
        </span>
      </div>

      {query && (
        <div className="page-shell mk-results-bar" role="status">
          <div>
            <span className="section-kicker">{c.resultsKicker}</span>
            <h2>
              {c.resultsFor} <em>“{query}”</em>
            </h2>
            {resultsReady && (
              <p>
                {c.resultsSummary(
                  allTailors.length,
                  allFabrics.length,
                  visibleStyles.length,
                )}
              </p>
            )}
          </div>
          <Link href="/marketplace" className="mk-clear-search">
            <X size={15} /> {c.clearSearch}
          </Link>
        </div>
      )}

      {!query && (
        <section
          id="explore"
          className="section-block page-shell explore-section"
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">{c.possibilitiesKicker}</span>
              <h2>
                {c.possibilitiesTitleLead}{" "}
                <em>{c.possibilitiesTitleEmphasis}</em>
              </h2>
              <p>{c.possibilitiesBody}</p>
            </div>
          </div>
          <div className="path-grid">
            <Link href="/tailors" className="path-card path-tailor">
              <div className="path-card-top">
                <span>01</span>
                <MoveUpRight size={24} />
              </div>
              <div>
                <span className="path-icon">
                  <Scissors size={24} />
                </span>
                <h3>{c.findArtisan}</h3>
                <p>{c.findArtisanBody}</p>
                <span className="path-link">
                  {c.exploreArtisans} <ArrowRight size={17} />
                </span>
              </div>
            </Link>
            <Link href="/fabric-explorer" className="path-card path-fabric">
              <div className="path-card-top">
                <span>02</span>
                <MoveUpRight size={24} />
              </div>
              <div>
                <span className="path-icon">
                  <SwatchBook size={24} />
                </span>
                <h3>{c.discoverFabric}</h3>
                <p>{c.discoverFabricBody}</p>
                <span className="path-link">
                  {c.exploreFabrics} <ArrowRight size={17} />
                </span>
              </div>
            </Link>
            <Link href="/onboarding" className="path-card path-create">
              <div className="path-card-top">
                <span>03</span>
                <MoveUpRight size={24} />
              </div>
              <div>
                <span className="path-icon">
                  <WandSparkles size={24} />
                </span>
                <h3>{c.createOwn}</h3>
                <p>{c.createOwnBody}</p>
                <span className="path-link">
                  {c.getStarted} <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section
        className="section-block page-shell style-section"
        id={query ? "explore" : "styles"}
      >
        <div className="section-heading split">
          <div>
            <span className="section-kicker">{c.stylesKicker}</span>
            <h2>
              {c.stylesTitleLead} <em>{c.stylesTitleEmphasis}</em>
            </h2>
            <p>{c.stylesBody}</p>
          </div>
          {visibleStyles.length > 3 && (
            <div className="rail-controls">
              <button
                type="button"
                aria-label={c.previousStyles}
                onClick={() =>
                  styleRail.current?.scrollBy({
                    left: -300,
                    behavior: "smooth",
                  })
                }
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                aria-label={c.nextStyles}
                onClick={() =>
                  styleRail.current?.scrollBy({ left: 300, behavior: "smooth" })
                }
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
        {styles.result.state === "error" ? (
          <ErrorState message={styles.result.message} onRetry={styles.retry} />
        ) : (
          <div className="style-rail" ref={styleRail}>
            {styles.result.state === "loading" ? (
              <SkeletonCards count={5} variant="style" />
            ) : visibleStyles.length ? (
              visibleStyles.map((item, index) => (
                <Link
                  href={`/onboarding?idea=${encodeURIComponent(item.name)}`}
                  className="style-card"
                  key={item.id}
                  aria-label={c.startPiece(item.name)}
                >
                  <div className="style-image">
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 75vw, 260px"
                      className="cover-image"
                    />
                    <span className="style-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="style-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <div className="style-meta">
                    <span>{item.category}</span>
                    <h3>{item.name}</h3>
                    {item.startingPrice !== null && (
                      <p>{c.fromPrice(naira(item.startingPrice))}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title={
                  query ? c.noStylesFor(query) : c.noStylesYet
                }
                body={
                  query
                    ? c.noStylesForBody
                    : c.noStylesYetBody
                }
              />
            )}
          </div>
        )}
      </section>

      {!query && (
        <section className="atelier-banner page-shell">
          <div className="atelier-banner-art">
            <Image
              src="/images/embroidery-hands-v2.webp"
              alt="Artisan hands embroidering royal blue fabric"
              fill
              sizes="(max-width: 800px) 100vw, 44vw"
              className="cover-image"
            />
          </div>
          <div className="atelier-banner-copy">
            <span className="section-kicker">{c.makingKicker}</span>
            <h2>
              {c.makingTitleLead}
              <br />
              <em>{c.makingTitleEmphasis}</em>
            </h2>
            <p>{c.makingBody}</p>
            <Link href="/tailors" className="action-primary">
              {c.meetMakers} <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      )}

      <section
        className="section-block page-shell artisan-section"
        id="artisans"
      >
        <div className="section-heading split">
          <div>
            <span className="section-kicker">{c.artisansKicker}</span>
            <h2>
              {c.artisansTitleLead} <em>{c.artisansTitleEmphasis}</em>
            </h2>
            <p>{c.artisansBody}</p>
          </div>
          <Link href="/tailors" className="section-link">
            {c.viewAllArtisans} <ArrowUpRight size={18} />
          </Link>
        </div>
        {visibleTailors.some((item) => item.isSample) && (
          <p className="preview-note">{c.artisansPreviewNote}</p>
        )}
        {cities.length > 1 && (
          <div className="filter-row" aria-label={c.filterArtisans}>
            {[ALL_CITIES, ...cities].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={city === value}
                className={city === value ? "selected" : ""}
                onClick={() => setCity(value)}
              >
                {value === ALL_CITIES ? c.allCities : value}
              </button>
            ))}
          </div>
        )}
        {tailors.result.state === "error" ? (
          <ErrorState message={tailors.result.message} onRetry={tailors.retry} />
        ) : (
          <div className="artisan-grid">
            {tailors.result.state === "loading" ? (
              <SkeletonCards count={3} variant="artisan" />
            ) : visibleTailors.length ? (
              visibleTailors.slice(0, 6).map((item) => {
                const isSaved = saved.isSaved("tailor", item.id);
                const name =
                  item.displayName ?? item.atelierName ?? c.artisanFallback;
                return (
                  <article className="artisan-card" key={item.id}>
                    <Link
                      href={`/tailors/${item.id}`}
                      className="artisan-image"
                      aria-label={c.viewProfile(name)}
                    >
                      <CoverImage
                        src={item.coverImageUrl ?? item.portraitUrl}
                        alt=""
                        sizes="(max-width: 700px) 100vw, 33vw"
                      />
                      {item.rating !== null && (
                        <span className="rating">
                          <Star size={14} fill="currentColor" />{" "}
                          {item.rating.toFixed(1)}
                          {item.reviewCount > 0 && (
                            <small>({item.reviewCount})</small>
                          )}
                        </span>
                      )}
                    </Link>
                    <div className="artisan-info">
                      <div className="artisan-person">
                        <Portrait src={item.portraitUrl} name={name} size={46} />
                        <div>
                          <span>{item.atelierName}</span>
                          <h3>{name}</h3>
                        </div>
                        <button
                          type="button"
                          aria-label={
                            isSaved ? c.removeProfile(name) : c.saveProfile(name)
                          }
                          aria-pressed={isSaved}
                          onClick={() => void saved.toggle("tailor", item.id)}
                          className={`save-button ${isSaved ? "saved" : ""}`}
                        >
                          <Heart
                            size={19}
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                      {item.verified && <VerifiedBadge label={c.verifiedArtisan} />}
                      <p>{item.craft}</p>
                      <div className="artisan-bottom">
                        <span>
                          <MapPin size={14} />
                          {item.city ?? "Nigeria"}
                        </span>
                        {item.startingPrice !== null && (
                          <strong>{c.fromPrice(naira(item.startingPrice))}</strong>
                        )}
                      </div>
                      {item.isSample ? (
                        <p className="oc-sample-note">{c.sampleProfile}</p>
                      ) : (
                        <Link
                          href={`/orders/new?tailorId=${item.id}`}
                          className="oc-commission-link"
                        >
                          {c.requestCommission} <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState
                title={
                  query ? c.noArtisansFor(query) : c.noArtisansYet
                }
                body={
                  city !== ALL_CITIES
                    ? c.noArtisansInCity(city)
                    : c.noArtisansYetBody
                }
                action={
                  <Link href="/tailors" className="mk-state-action">
                    {c.browseAllArtisans} <ArrowRight size={15} />
                  </Link>
                }
              />
            )}
          </div>
        )}
      </section>

      <section className="section-block page-shell fabric-section" id="fabrics">
        <div className="section-heading split">
          <div>
            <span className="section-kicker">{c.fabricsKicker}</span>
            <h2>
              {c.fabricsTitleLead} <em>{c.fabricsTitleEmphasis}</em>
            </h2>
            <p>{c.fabricsBody}</p>
          </div>
          <Link href="/fabric-explorer" className="section-link">
            {c.exploreAllFabrics} <ArrowUpRight size={18} />
          </Link>
        </div>
        {visibleFabrics.some((item) => item.isSample) && (
          <p className="preview-note">{c.fabricsPreviewNote}</p>
        )}
        {categories.length > 1 && (
          <div className="filter-row" aria-label={c.filterFabrics}>
            {[ALL_FABRICS, ...categories].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={fabricType === value}
                className={fabricType === value ? "selected" : ""}
                onClick={() => setFabricType(value)}
              >
                {value === ALL_FABRICS ? c.allFabrics : value}
              </button>
            ))}
          </div>
        )}
        {fabrics.result.state === "error" ? (
          <ErrorState message={fabrics.result.message} onRetry={fabrics.retry} />
        ) : (
          <div className="fabric-grid">
            {fabrics.result.state === "loading" ? (
              <SkeletonCards count={4} variant="fabric" />
            ) : visibleFabrics.length ? (
              visibleFabrics.slice(0, 8).map((item) => (
                <Link
                  href={`/fabric-explorer?fabric=${item.id}`}
                  className="fabric-card"
                  key={item.id}
                >
                  <div className="fabric-image">
                    <Image
                      src={item.imageUrl}
                      alt={c.textileAlt(item.name)}
                      fill
                      sizes="(max-width: 600px) 100vw, 25vw"
                      className="cover-image"
                    />
                    <span className="fabric-card-arrow">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>
                  <span className="fabric-type">
                    {item.category}
                    {item.origin && ` · ${item.origin}`}
                  </span>
                  <h3>{item.name}</h3>
                  <div className="fabric-card-bottom">
                    <span>
                      {item.merchant.businessName}
                      {item.merchant.verified && (
                        <BadgeInline label={c.verifiedMerchant} />
                      )}
                    </span>
                    <strong>
                      {naira(item.price)} <small>/ {item.unit}</small>
                    </strong>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title={
                  query ? c.noFabricsFor(query) : c.noFabricsYet
                }
                body={c.noFabricsYetBody}
                action={
                  <Link href="/fabric-explorer" className="mk-state-action">
                    {c.openFabricExplorer} <ArrowRight size={15} />
                  </Link>
                }
              />
            )}
          </div>
        )}
      </section>

      <section className="prompt-section page-shell">
        <div className="prompt-orb">
          <Sparkles size={30} />
        </div>
        <div className="prompt-copy">
          <span className="section-kicker">{c.promptKicker}</span>
          <h2>
            {c.promptTitleLead} <em>{c.promptTitleEmphasis}</em>
          </h2>
          <p>{AI_STUDIO_ENABLED ? c.promptBodyAi : c.promptBody}</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (prompt.trim())
              router.push(
                AI_STUDIO_ENABLED
                  ? `/ai-studio?prompt=${encodeURIComponent(prompt.trim())}`
                  : `/orders/new?brief=${encodeURIComponent(prompt.trim())}`,
              );
          }}
          className="prompt-form"
        >
          <label htmlFor="style-idea" className="sr-only">
            {c.promptLabel}
          </label>
          <input
            id="style-idea"
            value={prompt}
            maxLength={300}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={c.promptPlaceholder}
          />
          <button
            aria-label={
              AI_STUDIO_ENABLED ? c.designInAiStudio : c.commissionThisIdea
            }
            type="submit"
            disabled={!prompt.trim()}
          >
            <ArrowRight size={22} />
          </button>
        </form>
        <div className="prompt-suggestions">
          {c.tryIdea}{" "}
          {c.ideas.map((idea) => (
            <button type="button" key={idea} onClick={() => setPrompt(idea)}>
              {idea}
            </button>
          ))}
        </div>
      </section>
      <div className="trust-note page-shell">
        <span>
          <Check size={17} /> {c.trustReviewed}
        </span>
        <span>
          <Check size={17} /> {c.trustPrices}
        </span>
        <span>
          <Check size={17} /> {c.trustMeasurements}
        </span>
      </div>
    </>
  );
}

/** Compact check mark after a verified merchant's name. */
function BadgeInline({ label }: { label: string }) {
  return (
    <span className="mk-verified-dot" title={label}>
      <ShieldCheck size={12} aria-label={label} />
    </span>
  );
}
