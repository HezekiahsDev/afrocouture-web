import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrdersList from "@/components/orders/OrdersList";

export const metadata: Metadata = {
  title: "Orders | IPILE",
  description: "Your commissions, requests and fabric orders.",
};

export default function OrdersPage() {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <OrdersList />
      </main>
      <Footer />
    </div>
  );
}
