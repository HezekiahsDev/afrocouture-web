import type { Metadata } from "next";
import { UsersPanel } from "@/components/admin/UsersPanel";

// Admin pages wait for the admin session and load data in the browser (see ../layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Users | IPILE admin" };

export default function Page() {
  return <UsersPanel />;
}
