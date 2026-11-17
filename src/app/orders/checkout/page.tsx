import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FabricCheckout from "@/components/orders/FabricCheckout";

export const metadata: Metadata = {
  title: "Fabric checkout | IPILE",
  description: "Pay for your fabric and choose where it should be delivered.",
};

export default function FabricCheckoutPage() {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <FabricCheckout />
      </main>
      <Footer />
    </div>
  );
}
