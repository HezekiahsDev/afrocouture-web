import type { Metadata } from "next";
import { Suspense } from "react";
import { ApprovedMerchant, MerchantShell } from "@/components/merchant/MerchantShell";
import { FabricList } from "@/components/merchant/FabricList";

export const metadata: Metadata = {
  title: "Your fabrics | AfroCouture",
  description: "Manage your fabric listings and wholesale prices.",
};

async function Content({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  return (
    <ApprovedMerchant>
      <FabricList savedName={saved?.slice(0, 120)} />
    </ApprovedMerchant>
  );
}

export default function MerchantFabricsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  return (
    <MerchantShell>
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </MerchantShell>
  );
}
