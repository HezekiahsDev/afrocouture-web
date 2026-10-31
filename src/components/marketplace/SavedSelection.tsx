"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiErrorMessage } from "@/lib/api";
import {
  getFabrics,
  getSaved,
  getTailors,
  naira,
  unsaveItem,
} from "@/lib/catalog";
import { unitPriceFor } from "@/lib/payments";
import type { Fabric, SavedItem, Tailor } from "@/types";
import {
  EmptyState,
  ErrorState,
  Portrait,
  SkeletonCards,
  VerifiedBadge,
  useRemote,
  useSavedItems,
} from "./shared";

const MAX_QTY = 200;

interface SelectionData {
  saved: SavedItem[];
  fabrics: Map<string, Fabric>;
  tailors: Map<string, Tailor>;
}

async function loadSelection(): Promise<SelectionData> {
  const [saved, fabrics, tailors] = await Promise.all([
    getSaved(),
    getFabrics(),
    getTailors(),
  ]);
  return {
    saved,
    fabrics: new Map(fabrics.map((item) => [item.id, item])),
    tailors: new Map(tailors.map((item) => [item.id, item])),
  };
}

export default function SavedSelection() {
  const { status } = useAuth();

  return (
    <div className="catalog-page">
      <Link className="back-link" href="/marketplace">
        <ArrowLeft size={16} /> Back to discover
      </Link>
      <div className="catalog-heading">
        <span className="section-kicker">YOUR SHORTLIST</span>
        <h1>
          Your <em>selection.</em>
        </h1>
        <p>
          Fabrics you&apos;re planning with and artisans you&apos;d like to work
          with, saved to your account.
        </p>
      </div>
      {status === "loading" ? (
        <div className="mk-center" role="status">
          <LoaderCircle className="animate-spin" size={26} />
          <span className="sr-only">Loading your account</span>
        </div>
      ) : status === "anonymous" ? (
        <EmptyState
          title="Sign in to see your selection"
          body="Your saved fabrics and artisans are kept with your account, so they're here on any device."
          action={
            <Link href="/signin?next=/saved" className="mk-state-action">
              Sign in <ArrowRight size={15} />
            </Link>
          }
        />
      ) : (
        <Selection />
      )}
    </div>
  );
}

function Selection() {
  const { result, retry } = useRemote(loadSelection, []);
  const store = useSavedItems();
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Start from the freshly loaded list, then keep it in step with edits here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (result.state === "ready") setItems(result.data.saved);
  }, [result]);

  if (result.state === "error")
    return <ErrorState message={result.message} onRetry={retry} />;
  if (result.state === "loading" || !items)
    return (
      <div className="mk-saved-grid">
        <SkeletonCards count={3} variant="catalog" />
      </div>
    );

  const { fabrics, tailors } = result.data;
  const fabricItems = items.filter((item) => item.itemType === "fabric");
  const tailorItems = items.filter((item) => item.itemType === "tailor");
  const total = fabricItems.reduce((sum, item) => {
    const fabric = fabrics.get(item.itemId);
    const qty = item.quantity ?? 1;
    return fabric ? sum + unitPriceFor(fabric, qty) * qty : sum;
  }, 0);

  async function changeQuantity(item: SavedItem, quantity: number) {
    setBusy(item.id);
    const ok = await store.save("fabric", item.itemId, quantity);
    if (ok)
      setItems((prev) =>
        prev?.map((p) => (p.id === item.id ? { ...p, quantity } : p)) ?? prev,
      );
    setBusy(null);
  }

  async function remove(item: SavedItem) {
    setBusy(item.id);
    setError("");
    try {
      await unsaveItem(item.itemType, item.itemId);
      setItems((prev) => prev?.filter((p) => p.id !== item.id) ?? prev);
      // Keep the shared store (navbar count, hearts) in step; DELETE is idempotent.
      void store.remove(item.itemType, item.itemId);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not remove that item."));
    } finally {
      setBusy(null);
    }
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing saved yet"
        body="Tap the heart on an artisan or add a fabric to your selection, and it will appear here."
        action={
          <span className="mk-state-actions">
            <Link href="/fabric-explorer" className="mk-state-action">
              Explore fabrics <ArrowRight size={15} />
            </Link>
            <Link href="/tailors" className="mk-state-action">
              Meet artisans <ArrowRight size={15} />
            </Link>
          </span>
        }
      />
    );
  }

  return (
    <div className="mk-saved">
      {error && (
        <p className="mk-notice error" role="alert">
          {error}
        </p>
      )}
      <section aria-labelledby="saved-fabrics">
        <div className="catalog-intro">
          <div>
            <span className="section-kicker">FABRIC PLAN</span>
            <h2 id="saved-fabrics">Fabrics</h2>
          </div>
          <span>{fabricItems.length} saved</span>
        </div>
        {fabricItems.length ? (
          <>
            <ul className="mk-saved-list">
              {fabricItems.map((item) => {
                const fabric = fabrics.get(item.itemId);
                const qty = item.quantity ?? 1;
                if (!fabric)
                  return (
                    <li key={item.id} className="mk-saved-row missing">
                      <div>
                        <strong>This fabric is no longer available</strong>
                        <p>The merchant has removed it from the catalogue.</p>
                      </div>
                      <RemoveButton
                        label="Remove unavailable fabric"
                        busy={busy === item.id}
                        onClick={() => remove(item)}
                      />
                    </li>
                  );
                return (
                  <li key={item.id} className="mk-saved-row">
                    <Link
                      href={`/fabric-explorer/${fabric.id}`}
                      className="mk-saved-thumb"
                    >
                      <Image
                        src={fabric.imageUrl}
                        alt=""
                        fill
                        sizes="88px"
                        className="cover-image"
                      />
                    </Link>
                    <div className="mk-saved-copy">
                      <small>{fabric.category}</small>
                      <Link href={`/fabric-explorer/${fabric.id}`}>
                        <strong>{fabric.name}</strong>
                      </Link>
                      <span>
                        {fabric.merchant.businessName}
                        {fabric.merchant.verified && <VerifiedBadge />}
                      </span>
                      <span>
                        {naira(unitPriceFor(fabric, qty))} / {fabric.unit}
                        {unitPriceFor(fabric, qty) < fabric.price && " · bulk price"}
                      </span>
                    </div>
                    <div className="stepper" aria-label={`${fabric.name} quantity`}>
                      <button
                        type="button"
                        aria-label={`Fewer ${fabric.unit}s of ${fabric.name}`}
                        disabled={busy === item.id || qty <= 1}
                        onClick={() => changeQuantity(item, qty - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <strong aria-live="polite">{qty}</strong>
                      <button
                        type="button"
                        aria-label={`More ${fabric.unit}s of ${fabric.name}`}
                        disabled={busy === item.id || qty >= MAX_QTY}
                        onClick={() => changeQuantity(item, qty + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <strong className="mk-saved-line">
                      {naira(unitPriceFor(fabric, qty) * qty)}
                    </strong>
                    <RemoveButton
                      label={`Remove ${fabric.name}`}
                      busy={busy === item.id}
                      onClick={() => remove(item)}
                    />
                  </li>
                );
              })}
            </ul>
            <div className="subtotal mk-saved-total">
              <span>Estimated fabric total</span>
              <strong>{naira(total)}</strong>
            </div>
            <p className="selection-note">
              Prices are per unit, with bulk prices applied where the merchant
              offers them. Next, choose an artisan and describe your piece.
              Nothing is charged until they send a quote and you accept it.
            </p>
            <Link href="/orders/new?useSaved=1" className="detail-action oc-saved-commission">
              Choose an artisan for these fabrics <ArrowRight size={17} />
            </Link>
          </>
        ) : (
          <p className="empty-state">
            No fabrics yet.{" "}
            <Link href="/fabric-explorer" className="mk-inline-link">
              Explore fabrics
            </Link>
          </p>
        )}
      </section>

      <section aria-labelledby="saved-artisans">
        <div className="catalog-intro">
          <div>
            <span className="section-kicker">YOUR MAKERS</span>
            <h2 id="saved-artisans">Artisans</h2>
          </div>
          <span>{tailorItems.length} saved</span>
        </div>
        {tailorItems.length ? (
          <ul className="mk-saved-list">
            {tailorItems.map((item) => {
              const tailor = tailors.get(item.itemId);
              if (!tailor)
                return (
                  <li key={item.id} className="mk-saved-row missing">
                    <div>
                      <strong>This artisan is no longer listed</strong>
                      <p>Their profile is not currently public.</p>
                    </div>
                    <RemoveButton
                      label="Remove unavailable artisan"
                      busy={busy === item.id}
                      onClick={() => remove(item)}
                    />
                  </li>
                );
              const name = tailor.displayName ?? tailor.atelierName ?? "Artisan";
              return (
                <li key={item.id} className="mk-saved-row">
                  <span className="mk-saved-portrait">
                    <Portrait src={tailor.portraitUrl} name={name} size={56} />
                  </span>
                  <div className="mk-saved-copy">
                    <small>{tailor.atelierName}</small>
                    <Link href={`/tailors/${tailor.id}`}>
                      <strong>{name}</strong>
                    </Link>
                    <span>
                      {tailor.city && (
                        <>
                          <MapPin size={12} aria-hidden="true" /> {tailor.city}
                        </>
                      )}
                      {tailor.verified && <VerifiedBadge label="Verified artisan" />}
                    </span>
                    {tailor.craft && <span>{tailor.craft}</span>}
                    {tailor.isSample ? (
                      <span className="oc-sample-note">Sample profile — not taking commissions</span>
                    ) : (
                      <Link href={`/orders/new?tailorId=${tailor.id}&useSaved=1`} className="oc-commission-link">
                        Request a commission <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                  <strong className="mk-saved-line">
                    {tailor.startingPrice !== null
                      ? `From ${naira(tailor.startingPrice)}`
                      : ""}
                  </strong>
                  <RemoveButton
                    label={`Remove ${name}`}
                    busy={busy === item.id}
                    onClick={() => remove(item)}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-state">
            No artisans yet.{" "}
            <Link href="/tailors" className="mk-inline-link">
              Meet the artisans
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

function RemoveButton({
  label,
  busy,
  onClick,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="mk-remove"
      aria-label={label}
      disabled={busy}
      onClick={onClick}
    >
      {busy ? (
        <LoaderCircle size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
