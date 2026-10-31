"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Info,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { getFabrics, naira } from "@/lib/catalog";
import { unitPriceFor } from "@/lib/payments";
import type { Fabric, PriceTier } from "@/types";
import {
  EmptyState,
  ErrorState,
  SkeletonCards,
  VerifiedBadge,
  uniqueValues,
  useRemote,
  useSavedItems,
} from "./shared";

const ALL = "All";
const MAX_QTY = 200;

/**
 * Matches the breakpoint in atelier.css where the detail panel stops sitting
 * beside the grid. Below it, a fabric opens on its own page instead.
 */
const PAGE_QUERY = "(max-width: 1100px)";

const unitLabel = (unit: Fabric["unit"], qty: number) =>
  `${unit}${qty === 1 ? "" : "s"}`;

const opensAsPage = () => window.matchMedia(PAGE_QUERY).matches;

export default function FabricExplorer({
  initialFabric,
}: {
  initialFabric?: string;
}) {
  const { result, retry } = useRemote(() => getFabrics(), []);
  // Selecting a fabric updates the URL shallowly, so the server-provided value
  // goes stale (e.g. coming back from /saved). The live URL wins.
  const requested = useSearchParams().get("fabric") ?? initialFabric;
  const fabrics = result.state === "ready" ? result.data : [];
  const missing =
    result.state === "ready" &&
    Boolean(requested) &&
    !fabrics.some((item) => item.id === requested);

  return (
    <div className="catalog-page">
      <Link className="back-link" href="/marketplace">
        <ArrowLeft size={16} /> Back to discover
      </Link>
      <div className="catalog-heading">
        <span className="section-kicker">
          THE TEXTILE EDIT / SOURCED WITH INTENTION
        </span>
        <h1>
          Fabric with a <em>story.</em>
        </h1>
        <p>
          Explore color, texture, and possibility. Select a textile to see how
          it could become your next piece.
        </p>
        {fabrics.some((item) => item.isSample) && (
          <span className="preview-note">
            Sample listings and pricing. Availability is confirmed by each
            merchant.
          </span>
        )}
      </div>

      {missing && (
        <p className="mk-notice" role="status">
          <Info size={16} aria-hidden="true" /> That fabric is no longer
          available. Here is the rest of the collection.
        </p>
      )}

      {result.state === "error" ? (
        <ErrorState message={result.message} onRetry={retry} />
      ) : result.state === "loading" ? (
        <div className="catalog-layout">
          <div className="catalog-grid">
            <SkeletonCards count={4} variant="catalog" />
          </div>
          <div className="mk-skeleton mk-skeleton-detail" aria-hidden="true" />
        </div>
      ) : fabrics.length ? (
        <Explorer
          fabrics={fabrics}
          initialId={missing ? undefined : requested}
        />
      ) : (
        <EmptyState
          title="No fabrics listed yet"
          body="Verified merchants add new textiles regularly. Meanwhile, meet the artisans who can source fabric for you."
          action={
            <Link href="/tailors" className="mk-state-action">
              Meet the artisans <ArrowRight size={15} />
            </Link>
          }
        />
      )}
    </div>
  );
}

function Explorer({
  fabrics,
  initialId,
}: {
  fabrics: Fabric[];
  initialId?: string;
}) {
  const saved = useSavedItems();
  const [selectedId, setSelectedId] = useState(initialId ?? fabrics[0].id);
  const [filter, setFilter] = useState(ALL);
  const selected = fabrics.find((item) => item.id === selectedId) ?? fabrics[0];
  const categories = uniqueValues(fabrics.map((item) => item.category));
  const filtered = fabrics.filter(
    (item) => filter === ALL || item.category === filter,
  );

  // Coming back from a fabric's page on a phone: return to where they were.
  useEffect(() => {
    if (initialId && opensAsPage()) {
      document
        .getElementById(`fabric-${initialId}`)
        ?.scrollIntoView({ block: "center" });
    }
    // Only on arrival; later selections update the URL but should not scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(event: MouseEvent<HTMLAnchorElement>, id: string) {
    setSelectedId(id);
    // A shallow URL update: router.replace would re-render the page, whose
    // `fabric`-keyed explorer would then remount and refetch the catalogue.
    // On phones this also marks the fabric to return to from its page.
    window.history.replaceState(null, "", `/fabric-explorer?fabric=${id}`);
    // Wide screens show the detail beside the grid; narrow ones follow the link.
    if (!opensAsPage()) event.preventDefault();
  }

  return (
    <div className="catalog-layout">
      <div className="catalog-list">
        <div className="catalog-intro">
          <div>
            <span className="section-kicker">BROWSE THE COLLECTION</span>
            <h2>Find your fabric</h2>
          </div>
          <span>
            {filtered.length} textile{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
        {categories.length > 1 && (
          <div className="filter-row" aria-label="Fabric categories">
            {[ALL, ...categories].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={filter === value ? "selected" : ""}
              >
                {value}
              </button>
            ))}
          </div>
        )}
        <div className="catalog-grid">
          {filtered.map((item) => (
            <Link
              href={`/fabric-explorer/${item.id}`}
              id={`fabric-${item.id}`}
              className={`catalog-item ${selected.id === item.id ? "active" : ""}`}
              aria-current={selected.id === item.id ? "true" : undefined}
              onClick={(event) => choose(event, item.id)}
              key={item.id}
            >
              <span className="catalog-item-image">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 45vw, 260px"
                  className="cover-image"
                />
              </span>
              <span className="catalog-item-copy">
                <small>
                  {item.category}
                  {item.origin && ` / ${item.origin}`}
                </small>
                <strong>{item.name}</strong>
                <span>{item.merchant.businessName}</span>
                <b>
                  {naira(item.price)} <i>/ {item.unit}</i>
                </b>
              </span>
              {saved.isSaved("fabric", item.id) ? (
                <Check
                  className="catalog-item-arrow"
                  size={17}
                  aria-label="In your selection"
                />
              ) : (
                <ArrowUpRight className="catalog-item-arrow" size={17} />
              )}
            </Link>
          ))}
        </div>
        <div className="catalog-guidance">
          <Ruler size={22} />
          <div>
            <strong>How much fabric do I need?</strong>
            <p>
              Most bespoke pieces start at 3 yards. Your artisan will confirm
              the exact amount for your design and measurements.
            </p>
          </div>
        </div>
      </div>
      {/* Keyed so the yardage resets when another fabric is chosen. Hidden
          below the page breakpoint, where fabrics open on their own page. */}
      <FabricDetail key={selected.id} fabric={selected} />
    </div>
  );
}

/** Price rows for the tier table: base price up to the first break, then each break. */
function tierRows(fabric: Fabric): { from: number; to: number | null; price: number }[] {
  const tiers: PriceTier[] = [...(fabric.priceTiers ?? [])].sort((a, b) => a.minQuantity - b.minQuantity);
  if (!tiers.length) return [];
  const rows: { from: number; to: number | null; price: number }[] = [
    { from: 1, to: tiers[0].minQuantity - 1, price: fabric.price },
  ];
  tiers.forEach((tier, i) => {
    const next = tiers[i + 1];
    rows.push({ from: tier.minQuantity, to: next ? next.minQuantity - 1 : null, price: tier.price });
  });
  return rows;
}

function PriceTiers({ fabric, qty }: { fabric: Fabric; qty: number }) {
  const rows = tierRows(fabric);
  if (!rows.length) return null;
  const plural = fabric.unit === "bundle" ? "bundles" : "yards";
  return (
    <div className="mt-5" aria-label="Wholesale pricing">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
        Buy more, pay less per {fabric.unit}
      </p>
      <table className="w-full overflow-hidden rounded-xl border border-[#171717]/10 text-sm">
        <tbody>
          {rows.map((row) => {
            const active = qty >= row.from && (row.to === null || qty <= row.to);
            return (
              <tr
                key={row.from}
                data-active={active ? "true" : undefined}
                className={
                  active
                    ? "bg-[#B8734E]/15 text-[#171717]"
                    : "text-[#6B655C] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#171717]/8"
                }
              >
                <td className="px-3.5 py-2">
                  {row.to === null ? `${row.from}+` : row.from === row.to ? row.from : `${row.from}–${row.to}`} {plural}
                </td>
                <td className="px-3.5 py-2 text-right font-semibold tabular-nums">
                  {naira(row.price)} / {fabric.unit}
                  {active && <Check size={14} className="ml-1.5 inline text-[#B8734E]" aria-label="Your price" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The detail panel beside the explorer grid, or the body of a fabric's own page (`standalone`). */
export function FabricDetail({
  fabric,
  standalone = false,
}: {
  fabric: Fabric;
  standalone?: boolean;
}) {
  const saved = useSavedItems();
  const savedQty = saved.quantityOf("fabric", fabric.id);
  // Until the person picks an amount, follow the saved quantity (which may load later).
  const [picked, setPicked] = useState<number | null>(null);
  const qty = picked ?? savedQty ?? (fabric.unit === "bundle" ? 1 : 3);
  const setQty = (value: number) => setPicked(value);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inSelection = savedQty !== null;
  const unchanged = inSelection && savedQty === qty;
  const unitPrice = unitPriceFor(fabric, qty);
  const savings = (fabric.price - unitPrice) * qty;

  async function addToSelection() {
    setSaving(true);
    setJustSaved(false);
    const ok = await saved.save("fabric", fabric.id, qty);
    setSaving(false);
    setJustSaved(ok);
  }

  const Panel = standalone ? "article" : "aside";

  return (
    <Panel className="fabric-detail" aria-label={`${fabric.name} details`}>
      <div className="detail-image">
        <Image
          src={fabric.imageUrl}
          alt={`Close view of ${fabric.name}`}
          fill
          sizes="(max-width: 900px) 100vw, 600px"
          className="cover-image"
          preload={standalone}
        />
        <span>{fabric.category.toUpperCase()}</span>
      </div>
      <div className="detail-body">
        <span className="section-kicker">
          THE TEXTILE{fabric.origin && ` / ${fabric.origin.toUpperCase()}`}
        </span>
        {standalone ? <h1>{fabric.name}</h1> : <h2>{fabric.name}</h2>}
        {fabric.description && (
          <p className="detail-description">{fabric.description}</p>
        )}
        {fabric.tags.length > 0 && (
          <div className="detail-tags">
            {fabric.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className="detail-facts">
          <div>
            <span>Merchant</span>
            <strong className="mk-fact-merchant">
              {fabric.merchant.businessName}
              {fabric.merchant.verified && <VerifiedBadge />}
            </strong>
          </div>
          {fabric.merchant.city && (
            <div>
              <span>Ships from</span>
              <strong>
                <MapPin size={12} aria-hidden="true" /> {fabric.merchant.city}
              </strong>
            </div>
          )}
          {fabric.origin && (
            <div>
              <span>Origin</span>
              <strong>{fabric.origin}</strong>
            </div>
          )}
          <div>
            <span>Price</span>
            <strong>
              {naira(fabric.price)} / {fabric.unit}
            </strong>
          </div>
        </div>
        <PriceTiers fabric={fabric} qty={qty} />
        <div className="yardage-row">
          <div>
            <span>
              Plan your {fabric.unit === "bundle" ? "bundles" : "yardage"}
            </span>
            <small>Starting estimate for your garment</small>
          </div>
          <div className="stepper">
            <button
              type="button"
              aria-label={`Fewer ${fabric.unit}s`}
              disabled={qty <= 1}
              onClick={() => {
                setQty(Math.max(1, qty - 1));
                setJustSaved(false);
              }}
            >
              <Minus size={16} />
            </button>
            <strong aria-live="polite">{qty}</strong>
            <button
              type="button"
              aria-label={`More ${fabric.unit}s`}
              disabled={qty >= MAX_QTY}
              onClick={() => {
                setQty(Math.min(MAX_QTY, qty + 1));
                setJustSaved(false);
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="subtotal">
          <span>
            Estimated fabric cost · {qty} {unitLabel(fabric.unit, qty)}
            {unitPrice < fabric.price && (
              <> at {naira(unitPrice)} / {fabric.unit}</>
            )}
          </span>
          <strong data-testid="fabric-subtotal">{naira(unitPrice * qty)}</strong>
        </div>
        {savings > 0 && (
          <p className="-mt-2 mb-3 text-right text-xs font-semibold text-[#2F6B4F]" data-testid="fabric-savings">
            You save {naira(savings)} with the wholesale price
          </p>
        )}
        <button
          type="button"
          className="detail-action"
          onClick={addToSelection}
          disabled={saving || unchanged}
        >
          {saving ? (
            <>
              <LoaderCircle size={18} className="animate-spin" /> Saving…
            </>
          ) : unchanged ? (
            <>
              <Check size={18} /> In your selection ({savedQty}{" "}
              {unitLabel(fabric.unit, savedQty ?? 0)})
            </>
          ) : inSelection ? (
            <>
              Update selection ({qty} {unitLabel(fabric.unit, qty)}){" "}
              <ArrowRight size={19} />
            </>
          ) : (
            <>
              Add to selection <ArrowRight size={19} />
            </>
          )}
        </button>
        {(justSaved || inSelection) && (
          <p className="selection-note" role="status">
            {justSaved ? "Saved to your selection. " : ""}
            <Link href="/saved">View selection</Link>
          </p>
        )}
        <Link className="detail-secondary" href="/tailors">
          Pair with an artisan <ArrowUpRight size={17} />
        </Link>
        <div className="detail-assurance">
          <span>
            <ShieldCheck size={17} />
            {fabric.merchant.verified
              ? "Merchant verified by IPILE"
              : "Sample listing for this preview"}
          </span>
        </div>
      </div>
    </Panel>
  );
}
