import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FabricExplorer from "@/components/marketplace/FabricExplorer";

export const metadata: Metadata = {
  title: "Fabric Explorer | IPILE",
  description: "Explore beautiful African textiles and plan your next garment.",
};

async function FabricExplorerContent({
  searchParams,
}: {
  searchParams: Promise<{ fabric?: string }>;
}) {
  const { fabric } = await searchParams;
  return <FabricExplorer key={fabric ?? ""} initialFabric={fabric} />;
}

export default function FabricExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ fabric?: string }>;
}) {
  return (
      <div className="marketplace-site">
        <Navbar />
        <main className="page-shell">
          <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
            <FabricExplorerContent searchParams={searchParams} />
          </Suspense>
        </main>
        <Footer />
      </div>
  );
}
