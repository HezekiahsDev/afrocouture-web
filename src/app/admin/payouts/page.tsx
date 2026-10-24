import type { Metadata } from "next";
import { AdminHeading } from "@/components/admin/AdminShell";
import { PayoutsPanel } from "@/components/admin/PayoutsPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Payouts | AfroCouture admin" };

export default function Page() {
  return (
    <>
      <AdminHeading kicker="Operations" title="Payouts" />
      <PayoutsPanel />
    </>
  );
}
