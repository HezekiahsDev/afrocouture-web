import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const metadata: Metadata = {
  title: "Admin | AfroCouture",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
      <AdminShell>
        <AdminConsole />
      </AdminShell>
    </Suspense>
  );
}
