import type { Metadata } from "next";
import { OrdersPanel } from "@/components/admin/OrdersPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Orders | IPILE admin" };

export default function Page() {
  return <OrdersPanel />;
}
