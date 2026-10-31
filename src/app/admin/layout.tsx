import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

// The dashboard renders after the client confirms an admin session and then loads private
// data in the browser, so navigations into it are expected to wait (not prerenderable UI).
export const instant = false;

export const metadata: Metadata = {
  title: "Admin | IPILE",
  robots: { index: false, follow: false },
};

/** Every /admin page shares the dashboard shell. The proxy only serves these routes to admins. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F5F0E8" }} />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
