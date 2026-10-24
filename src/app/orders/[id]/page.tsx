import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderDetail from "@/components/orders/OrderDetail";

export const metadata: Metadata = {
  title: "Order | AfroCouture",
  description: "Track your commission, payment and conversation with your artisan.",
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
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
