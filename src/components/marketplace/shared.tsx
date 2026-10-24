"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { AlertCircle, BadgeCheck, RefreshCw, X } from "lucide-react";
import { apiErrorMessage } from "@/lib/api";
import { useSaved } from "@/lib/useSaved";

/* ─────────────────────────────────────────────
   Remote data
───────────────────────────────────────────── */

export type Remote<T> =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; data: T };

/** Loads `load()` whenever `deps` change; `retry()` loads again. */
export function useRemote<T>(load: () => Promise<T>, deps: unknown[]) {
  const [result, setResult] = useState<Remote<T>>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Show the skeleton again when filters change or on retry.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult({ state: "loading" });
    load()
      .then((data) => {
        if (!cancelled) setResult({ state: "ready", data });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setResult({ state: "error", message: apiErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { result, retry };
}

/* ─────────────────────────────────────────────
   Saved items, shared by the navbar and page
───────────────────────────────────────────── */

type SavedApi = ReturnType<typeof useSaved>;
const SavedContext = createContext<SavedApi | null>(null);

/** One saved-items store for the whole app (mounted in the root layout), so the navbar count and page hearts agree. */
export function SavedProvider({ children }: { children: ReactNode }) {
  const saved = useSaved();
  return (
    <SavedContext.Provider value={saved}>
      {children}
      <SavedToast message={saved.error} onClose={saved.clearError} />
    </SavedContext.Provider>
  );
}

export function useSavedItems(): SavedApi {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSavedItems must be used inside <SavedProvider>");
  return ctx;
}

function SavedToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  // Keep the latest callback without restarting the timer on every render.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => close.current(), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;
  return (
    <div className="mk-toast" role="alert">
      <AlertCircle size={18} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss message">
        <X size={16} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   States
───────────────────────────────────────────── */

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mk-state mk-state-error" role="alert">
      <AlertCircle size={22} aria-hidden="true" />
      <div>
        <strong>We couldn&apos;t load this</strong>
        <p>{message}</p>
      </div>
      <button type="button" className="mk-state-action" onClick={onRetry}>
        <RefreshCw size={15} /> Try again
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mk-state">
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      {action}
    </div>
  );
}

/** Grey placeholder blocks shaped like the cards they stand in for. */
export function SkeletonCards({
  count,
  variant,
}: {
  count: number;
  variant: "style" | "artisan" | "fabric" | "catalog" | "directory";
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`mk-skeleton-card mk-skeleton-${variant}`}
          aria-hidden="true"
        >
          <span className="mk-skeleton mk-skeleton-media" />
          <span className="mk-skeleton mk-skeleton-line short" />
          <span className="mk-skeleton mk-skeleton-line" />
          <span className="mk-skeleton mk-skeleton-line medium" />
        </div>
      ))}
      <span className="sr-only" role="status">
        Loading
      </span>
    </>
  );
}

/* ─────────────────────────────────────────────
   Small pieces
───────────────────────────────────────────── */

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="mk-verified">
      <BadgeCheck size={12} aria-hidden="true" /> {label}
    </span>
  );
}

const initials = (name: string | null | undefined) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

/** Round portrait, or the artisan's initials when there is no photo. */
export function Portrait({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string | null;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className="mk-initials"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}

/** Cover image with a quiet fallback panel when an artisan has none. */
export function CoverImage({
  src,
  alt,
  sizes,
  eager,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return <span className="mk-cover-fallback" aria-hidden="true" />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className="cover-image"
      onError={() => setFailed(true)}
    />
  );
}

/** Unique values in first-seen order, ignoring empty ones. */
export function uniqueValues(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}
