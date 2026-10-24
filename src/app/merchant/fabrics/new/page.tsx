import type { Metadata } from "next";
import { ApprovedMerchant, MerchantShell } from "@/components/merchant/MerchantShell";
import { FabricForm } from "@/components/merchant/FabricForm";

export const metadata: Metadata = {
  title: "List a fabric | AfroCouture",
  description: "Add a fabric listing with optional wholesale prices.",
};

export default function NewFabricPage() {
  return (
    <MerchantShell>
      <ApprovedMerchant>
        <FabricForm />
      </ApprovedMerchant>
    </MerchantShell>
  );
}
