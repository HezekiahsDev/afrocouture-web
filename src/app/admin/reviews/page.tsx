import type { Metadata } from "next";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Reviews | AfroCouture admin" };

export default function Page() {
  return <ReviewsPanel />;
}
