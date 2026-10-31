"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFabric } from "@/lib/catalog";
import { FabricDetail } from "./FabricExplorer";
import { ErrorState, useRemote } from "./shared";

/** A fabric on its own page: where phones go when a fabric is tapped, and the target of shared links. */
export default function FabricView({ id }: { id: string }) {
  const { result, retry } = useRemote(() => getFabric(id), [id]);

  return (
    <div className="catalog-page fabric-page">
      {/* Back to the list with this fabric selected (and scrolled to on phones). */}
      <Link className="back-link" href={`/fabric-explorer?fabric=${id}`}>
        <ArrowLeft size={16} /> All fabrics
      </Link>
      {result.state === "error" ? (
        <ErrorState message={result.message} onRetry={retry} />
      ) : result.state === "loading" ? (
        <div className="mk-skeleton mk-skeleton-detail" aria-hidden="true" />
      ) : (
        <FabricDetail fabric={result.data} standalone />
      )}
    </div>
  );
}
