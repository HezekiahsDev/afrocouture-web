import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FabricView from "@/components/marketplace/FabricView";

export const metadata: Metadata = {
  title: "Fabric | IPILE",
  description: "Textile details, wholesale pricing and yardage planning.",
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FabricView id={id} />;
}

export default function FabricPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
          <Content params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
