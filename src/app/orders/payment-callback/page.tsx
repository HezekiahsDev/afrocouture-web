import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import PaymentCallback from "@/components/orders/PaymentCallback";

export const metadata: Metadata = {
  title: "Confirming payment | IPILE",
  description: "Confirming your Paystack payment.",
};

type Params = { reference?: string; trxref?: string; cancelled?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return <PaymentCallback reference={params.reference ?? params.trxref} cancelled={params.cancelled === "1"} />;
}

export default function PaymentCallbackPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
          <Content searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
