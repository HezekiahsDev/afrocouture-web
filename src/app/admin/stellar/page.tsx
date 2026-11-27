import type { Metadata } from "next";
import { AdminHeading } from "@/components/admin/AdminShell";
import { StellarPanel } from "@/components/admin/StellarPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Stellar | IPILE admin" };

export default function Page() {
  return (
    <>
      <AdminHeading kicker="Operations" title="Stellar (USDC)" />
      <StellarPanel />
    </>
  );
}
