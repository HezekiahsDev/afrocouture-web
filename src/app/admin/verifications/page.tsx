import type { Metadata } from "next";
import { AdminHeading } from "@/components/admin/AdminShell";
import { VerificationsPanel } from "@/components/admin/VerificationsPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Verifications | IPILE admin" };

export default function Page() {
  return (
    <>
      <AdminHeading kicker="Operations" title="Verifications" />
      <VerificationsPanel />
    </>
  );
}
