import type { Metadata } from "next";
import NotificationsCentre from "@/components/notifications/NotificationsCentre";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Notifications | AfroCouture admin" };

export default function Page() {
  return <NotificationsCentre />;
}
