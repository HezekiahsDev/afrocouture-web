'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** List filters kept in the URL, so they survive reloads and can be linked to. */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const values = Object.fromEntries(keys.map((k) => [k, search.get(k) ?? ''])) as Record<K, string>;

  const set = useCallback(
    (patch: Partial<Record<K, string>>) => {
      const next = new URLSearchParams(search.toString());
      for (const [k, v] of Object.entries(patch) as [K, string | undefined][]) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      // Any filter change other than paging goes back to page 1.
      if (!('page' in patch)) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [search, router, pathname],
  );
  return [values, set] as const;
}
