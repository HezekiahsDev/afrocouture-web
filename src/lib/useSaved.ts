'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiErrorMessage } from './api';
import { getSaved, saveItem, unsaveItem } from './catalog';
import type { SavedItem, SavedItemType } from '@/types';

const key = (type: SavedItemType, id: string) => `${type}:${id}`;

/**
 * The signed-in person's saved artisans and fabric selection. Saving while signed
 * out sends them to sign in and brings them back to the same page.
 */
export function useSaved() {
  const { status } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Map<string, SavedItem>>(new Map());
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') {
      // Signed out (or signed out elsewhere): forget the previous person's list.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(new Map());
      return;
    }
    let cancelled = false;
    getSaved()
      .then((list) => {
        if (!cancelled) setItems(new Map(list.map((item) => [key(item.itemType, item.itemId), item])));
      })
      .catch(() => {
        // Saved state is a convenience; the page still works without it.
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const requireSignIn = useCallback(() => {
    if (status === 'authenticated') return false;
    // Read the location only when needed: this hook lives in the root layout, where
    // usePathname() would opt every page out of static prerendering.
    const here = window.location.pathname + window.location.search;
    router.push(`/signin?next=${encodeURIComponent(here)}`);
    return true;
  }, [status, router]);

  const isSaved = useCallback((type: SavedItemType, id: string) => items.has(key(type, id)), [items]);
  const quantityOf = useCallback(
    (type: SavedItemType, id: string) => items.get(key(type, id))?.quantity ?? null,
    [items],
  );

  /** Save, or update the quantity of, an item. Resolves to false if it could not be saved. */
  const save = useCallback(
    async (type: SavedItemType, id: string, quantity?: number) => {
      if (requireSignIn()) return false;
      setError('');
      try {
        const saved = await saveItem(type, id, quantity);
        setItems((prev) => new Map(prev).set(key(type, id), saved));
        return true;
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not save that. Please try again.'));
        return false;
      }
    },
    [requireSignIn],
  );

  const toggle = useCallback(
    async (type: SavedItemType, id: string) => {
      if (requireSignIn()) return;
      setError('');
      const k = key(type, id);
      const previous = items.get(k);
      // Optimistic: flip immediately, roll back on failure.
      setItems((prev) => {
        const next = new Map(prev);
        if (previous) next.delete(k);
        else next.set(k, { id: k, itemType: type, itemId: id, quantity: null, createdAt: new Date().toISOString() });
        return next;
      });
      try {
        if (previous) await unsaveItem(type, id);
        else {
          const saved = await saveItem(type, id);
          setItems((prev) => new Map(prev).set(k, saved));
        }
      } catch (err) {
        setItems((prev) => {
          const next = new Map(prev);
          if (previous) next.set(k, previous);
          else next.delete(k);
          return next;
        });
        setError(apiErrorMessage(err, 'Could not update your saved items.'));
      }
    },
    [items, requireSignIn],
  );

  const remove = useCallback(async (type: SavedItemType, id: string) => {
    setError('');
    try {
      await unsaveItem(type, id);
      setItems((prev) => {
        const next = new Map(prev);
        next.delete(key(type, id));
        return next;
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not remove that item.'));
    }
  }, []);

  return { items: [...items.values()], isSaved, quantityOf, save, toggle, remove, error, clearError: () => setError('') };
}
