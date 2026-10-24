import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MarketplaceExperience from "@/components/marketplace/MarketplaceExperience";

export const metadata: Metadata = {
  title: "Discover | AfroCouture",
  description:
    "Discover African couture, artisan makers, and beautiful textiles.",
};

async function MarketplaceContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <MarketplaceExperience key={q ?? ""} initialQuery={q ?? ""} />;
}

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
      <div className="marketplace-site">
        <Navbar />
        <main>
          <Suspense
            fallback={
              <div className="page-shell" style={{ minHeight: "70vh" }} />
            }
          >
            <MarketplaceContent searchParams={searchParams} />
          </Suspense>
        </main>
        <Footer />
      </div>
  );
}
