import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DisputeDetail } from "@/components/admin/DisputeDetail";

export const metadata: Metadata = {
  title: "Order review | AfroCouture admin",
  robots: { index: false, follow: false },
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DisputeDetail id={id} />;
}

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
      <AdminShell>
        <Content params={params} />
      </AdminShell>
    </Suspense>
  );
}
