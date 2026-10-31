import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TailorProfileView from "@/components/marketplace/TailorProfileView";

export const metadata: Metadata = {
  title: "Artisan | IPILE",
  description: "Portfolio, specialties and reviews from customers who commissioned this artisan.",
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TailorProfileView id={id} />;
}

export default function TailorPage({ params }: { params: Promise<{ id: string }> }) {
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
