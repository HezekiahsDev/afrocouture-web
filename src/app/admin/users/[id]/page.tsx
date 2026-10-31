import type { Metadata } from "next";
import { UserDetail } from "@/components/admin/UserDetail";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "User | IPILE admin" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetail id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Content params={params} />;
}
