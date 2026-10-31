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
const ALL_FABRICS = "All";

export default function MarketplaceExperience({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const query = initialQuery.trim();
  const term = query.toLowerCase();
  const router = useRouter();
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
            <span className="eyebrow-rule" /> CONTEMPORARY AFRICAN LUXURY
          </div>
          <h1 id="hero-title">
            Your vision,
            <br />
            <em>thoughtfully made.</em>
          </h1>
          <p>
            Discover skilled makers, explore fabrics, and bring your next outfit
            to life.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding" className="action-primary">
              Start your design <ArrowUpRight size={19} />
            </Link>
            <Link href="#explore" className="action-text">
              Explore the atelier <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="hero-footnote-icon">
              <ShieldCheck size={18} />
            </span>{" "}
            Every artisan and merchant is reviewed before they go live.
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
            <span>01 / THE NEW ATELIER</span>
            <strong>Craft meets imagination.</strong>
            <ArrowUpRight size={19} />
          </div>
          <div className="hero-vertical">IPILE · CRAFTED AROUND YOU</div>
        </div>
        <a
          href="#explore"
          className="hero-scroll"
          aria-label="Scroll to explore"
        >
          <ArrowDown size={17} />
        </a>
      </section>

      <div className="value-strip" aria-label="How IPILE works">
        <span>
          <Scissors size={18} /> Skilled artisans
        </span>
        <i />
        <span>
          <Sparkles size={18} /> A style that is yours
        </span>
        <i />
        <span>
          <ShieldCheck size={18} /> Made around you
        </span>
      </div>

      {query && (
        <div className="page-shell mk-results-bar" role="status">
          <div>
            <span className="section-kicker">SEARCH</span>
            <h2>
              Results for <em>“{query}”</em>
            </h2>
            {resultsReady && (
              <p>
                {allTailors.length} artisan{allTailors.length === 1 ? "" : "s"}{" "}
                · {allFabrics.length} fabric{allFabrics.length === 1 ? "" : "s"}{" "}
                · {visibleStyles.length} style
                {visibleStyles.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <Link href="/marketplace" className="mk-clear-search">
            <X size={15} /> Clear search
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
              <span className="section-kicker">01 / THE POSSIBILITIES</span>
              <h2>
                Start with what <em>inspires you.</em>
              </h2>
              <p>Every great piece begins somewhere. Find your next one here.</p>
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
                <h3>Find an artisan</h3>
                <p>Work one on one with a maker who understands your vision.</p>
                <span className="path-link">
                  Explore artisans <ArrowRight size={17} />
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
                <h3>Discover fabric</h3>
                <p>
                  Find texture, color, and heritage in every beautiful weave.
                </p>
                <span className="path-link">
                  Explore fabrics <ArrowRight size={17} />
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
                <h3>Create your own</h3>
                <p>
                  Begin your bespoke journey with an idea, then make it real.
                </p>
                <span className="path-link">
                  Get started <ArrowRight size={17} />
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
            <span className="section-kicker">02 / STYLE NOTES</span>
            <h2>
              Wear the <em>occasion.</em>
            </h2>
            <p>Considered silhouettes for every chapter of your life.</p>
          </div>
          {visibleStyles.length > 3 && (
            <div className="rail-controls">
              <button
                type="button"
                aria-label="Previous styles"
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
                aria-label="Next styles"
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
                  aria-label={`Start a ${item.name} piece`}
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
                      <p>From {naira(item.startingPrice)}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title={query ? `No styles match “${query}”` : "No styles yet"}
                body={
                  query
                    ? "Try a broader word like “kaftan” or “wedding”."
                    : "New silhouettes are on their way. Explore fabrics in the meantime."
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
            <span className="section-kicker">THE ART OF MAKING</span>
            <h2>
              Made by hands.
              <br />
              <em>Made for you.</em>
            </h2>
            <p>
              Behind every stitch is a person, a place, and a story. Discover
              the artisans turning your ideas into pieces to keep.
            </p>
            <Link href="/tailors" className="action-primary">
              Meet the makers <ArrowUpRight size={18} />
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
            <span className="section-kicker">
              03 / PEOPLE BEHIND THE PIECES
            </span>
            <h2>
              Meet your <em>maker.</em>
            </h2>
            <p>
              Independent artisans with a point of view and a love for their
              craft.
            </p>
          </div>
          <Link href="/tailors" className="section-link">
            View all artisans <ArrowUpRight size={18} />
          </Link>
        </div>
        {visibleTailors.some((item) => item.isSample) && (
          <p className="preview-note">
            Illustrative artisan profiles and sample pricing for this preview.
          </p>
        )}
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
        {tailors.result.state === "error" ? (
          <ErrorState message={tailors.result.message} onRetry={tailors.retry} />
        ) : (
          <div className="artisan-grid">
            {tailors.result.state === "loading" ? (
              <SkeletonCards count={3} variant="artisan" />
            ) : visibleTailors.length ? (
              visibleTailors.slice(0, 6).map((item) => {
                const isSaved = saved.isSaved("tailor", item.id);
                const name = item.displayName ?? item.atelierName ?? "Artisan";
                return (
                  <article className="artisan-card" key={item.id}>
                    <Link
                      href={`/tailors/${item.id}`}
                      className="artisan-image"
                      aria-label={`View ${name}'s profile`}
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
                          aria-label={`${isSaved ? "Remove" : "Save"} ${name}`}
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
                      {item.verified && <VerifiedBadge label="Verified artisan" />}
                      <p>{item.craft}</p>
                      <div className="artisan-bottom">
                        <span>
                          <MapPin size={14} />
                          {item.city ?? "Nigeria"}
                        </span>
                        {item.startingPrice !== null && (
                          <strong>From {naira(item.startingPrice)}</strong>
                        )}
                      </div>
                      {item.isSample ? (
                        <p className="oc-sample-note">
                          Sample profile — not taking commissions
                        </p>
                      ) : (
                        <Link
                          href={`/orders/new?tailorId=${item.id}`}
                          className="oc-commission-link"
                        >
                          Request a commission <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState
                title={
                  query ? `No artisans match “${query}”` : "No artisans here yet"
                }
                body={
                  city !== ALL_CITIES
                    ? `No artisans in ${city} match. Try another city.`
                    : "Verified artisans appear here as soon as they're approved."
                }
                action={
                  <Link href="/tailors" className="mk-state-action">
                    Browse all artisans <ArrowRight size={15} />
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
            <span className="section-kicker">04 / THE TEXTILE EDIT</span>
            <h2>
              Start with the <em>material.</em>
            </h2>
            <p>Beautiful fabrics chosen for the stories they help tell.</p>
          </div>
          <Link href="/fabric-explorer" className="section-link">
            Explore all fabrics <ArrowUpRight size={18} />
          </Link>
        </div>
        {visibleFabrics.some((item) => item.isSample) && (
          <p className="preview-note">
            Sample listings and pricing. Availability is confirmed by each
            merchant.
          </p>
        )}
        {categories.length > 1 && (
          <div className="filter-row" aria-label="Filter fabrics by type">
            {[ALL_FABRICS, ...categories].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={fabricType === value}
                className={fabricType === value ? "selected" : ""}
                onClick={() => setFabricType(value)}
              >
                {value}
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
                      alt={`${item.name} textile`}
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
                        <BadgeInline />
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
                  query ? `No fabrics match “${query}”` : "No fabrics listed yet"
                }
                body="Verified merchants add new textiles regularly."
                action={
                  <Link href="/fabric-explorer" className="mk-state-action">
                    Open the fabric explorer <ArrowRight size={15} />
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
          <span className="section-kicker">YOUR NEXT IDEA STARTS HERE</span>
          <h2>
            What would you <em>create?</em>
          </h2>
          <p>
            {AI_STUDIO_ENABLED
              ? "Describe the piece you have in mind. AI Studio turns it into design previews you can take to an artisan as a commission."
              : "Describe the piece you have in mind and add photos of the style you love. A verified artisan quotes to make it for you."}
          </p>
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
            Describe your style idea
          </label>
          <input
            id="style-idea"
            value={prompt}
            maxLength={300}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="A midnight blue kaftan with gold embroidery…"
          />
          <button
            aria-label={AI_STUDIO_ENABLED ? "Design this idea in AI Studio" : "Commission this idea"}
            type="submit"
            disabled={!prompt.trim()}
          >
            <ArrowRight size={22} />
          </button>
        </form>
        <div className="prompt-suggestions">
          Try an idea:{" "}
          {["Modern agbada", "Wedding guest look", "Everyday Ankara"].map(
            (idea) => (
              <button type="button" key={idea} onClick={() => setPrompt(idea)}>
                {idea}
              </button>
            ),
          )}
        </div>
      </section>
      <div className="trust-note page-shell">
        <span>
          <Check size={17} /> Artisans reviewed before they go live
        </span>
        <span>
          <Check size={17} /> Starting prices shown up front
        </span>
        <span>
          <Check size={17} /> Measurements saved once in your fit profile
        </span>
      </div>
    </>
  );
}

/** Compact check mark after a verified merchant's name. */
function BadgeInline() {
  return (
    <span className="mk-verified-dot" title="Verified merchant">
      <ShieldCheck size={12} aria-label="Verified merchant" />
    </span>
  );
}
