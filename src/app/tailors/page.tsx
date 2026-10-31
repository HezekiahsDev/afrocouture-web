import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TailorDirectory from "@/components/marketplace/TailorDirectory";

export const metadata: Metadata = {
  title: "Artisans | IPILE",
  description: "Meet the independent makers behind African couture.",
};

export default function TailorsPage() {
  return (
      <div className="marketplace-site">
        <Navbar />
        <main className="page-shell">
          <TailorDirectory />
        </main>
        <Footer />
      </div>
  );
}
