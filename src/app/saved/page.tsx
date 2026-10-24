import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SavedSelection from "@/components/marketplace/SavedSelection";

export const metadata: Metadata = {
  title: "Your selection | AfroCouture",
  description: "Your saved fabrics and artisans.",
};

export default function SavedPage() {
  return (
      <div className="marketplace-site">
        <Navbar />
        <main className="page-shell">
          <SavedSelection />
        </main>
        <Footer />
      </div>
  );
}
