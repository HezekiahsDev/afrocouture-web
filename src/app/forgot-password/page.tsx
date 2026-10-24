import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password | AfroCouture",
  description: "Reset the password for your AfroCouture account.",
};

type Params = { email?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return <ForgotPasswordForm email={params.email} />;
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main>
        <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
          <Content searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
