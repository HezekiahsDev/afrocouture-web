import type { Metadata } from "next";
import { DisputeDetail } from "@/components/admin/DisputeDetail";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Order | AfroCouture admin" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DisputeDetail id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Content params={params} />;
}
