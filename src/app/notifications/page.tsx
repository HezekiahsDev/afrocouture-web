import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NotificationsCentre from "@/components/notifications/NotificationsCentre";

export const metadata: Metadata = {
  title: "Notifications | AfroCouture",
  description: "Order updates, messages, payouts and reviews.",
};

export default function NotificationsPage() {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <NotificationsCentre />
      </main>
      <Footer />
    </div>
  );
}
