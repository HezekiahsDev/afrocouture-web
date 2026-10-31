import type { Metadata } from "next";
import { Suspense } from "react";
import { ApprovedMerchant, MerchantShell } from "@/components/merchant/MerchantShell";
import { EditFabric } from "@/components/merchant/EditFabric";

export const metadata: Metadata = {
  title: "Edit fabric | IPILE",
  description: "Edit a fabric listing.",
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ApprovedMerchant>
      <EditFabric id={id} />
    </ApprovedMerchant>
  );
}

export default function EditFabricPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <MerchantShell>
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <Content params={params} />
      </Suspense>
    </MerchantShell>
  );
}
