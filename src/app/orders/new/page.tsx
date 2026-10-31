import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewOrderForm from "@/components/orders/NewOrderForm";

export const metadata: Metadata = {
  title: "Request a commission | IPILE",
  description: "Ask a verified artisan to make your piece.",
};

type Params = { tailorId?: string; aiDesignId?: string; styleId?: string; useSaved?: string; brief?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return (
    <NewOrderForm
      tailorId={params.tailorId}
      aiDesignId={params.aiDesignId}
      styleId={params.styleId}
      useSaved={params.useSaved === "1"}
      brief={params.brief}
    />
  );
}

export default function NewOrderPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
          <Content searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
