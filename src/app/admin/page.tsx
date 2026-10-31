import type { Metadata } from "next";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Overview | IPILE admin" };

export default function Page() {
  return <OverviewDashboard />;
}
