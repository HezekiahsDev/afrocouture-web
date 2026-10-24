'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadErrorState, LoadingState } from '@/components/onboarding/verification/layout';
import { apiErrorMessage } from '@/lib/api';
import { listMyFabrics, type MyFabric } from '@/lib/orders';
import { FabricForm } from './FabricForm';

/** Loads one of the merchant's own listings (including hidden ones) for editing. */
export function EditFabric({ id }: { id: string }) {
  const [state, setState] = useState<{ fabric?: MyFabric | null; error?: string }>({});

  const load = useCallback(async () => {
    setState({});
    try {
      const mine = await listMyFabrics();
      setState({ fabric: mine.find((f) => f.id === id) ?? null });
    } catch (err) {
      setState({ error: apiErrorMessage(err, 'We could not load this fabric.') });
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load();
  }, [load]);

  if (state.error) return <LoadErrorState message={state.error} onRetry={load} />;
  if (state.fabric === undefined) return <LoadingState label="Loading the listing…" />;
  if (state.fabric === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-[#F8FAFC]">This listing isn’t one of yours</h1>
        <p className="text-sm text-[#94A3B8]">It may have been deleted.</p>
        <Link href="/merchant/fabrics" className="btn-primary">
          Back to your fabrics
        </Link>
      </div>
    );
  }
  return <FabricForm fabric={state.fabric} />;
}
