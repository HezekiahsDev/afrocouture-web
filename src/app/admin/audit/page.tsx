import type { Metadata } from "next";
import { AuditPanel } from "@/components/admin/AuditPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Audit log | AfroCouture admin" };

export default function Page() {
  return <AuditPanel />;
}
