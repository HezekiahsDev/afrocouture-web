import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify your email | AfroCouture",
  description: "Confirm your email address to finish creating your account.",
};

type Params = { email?: string; next?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return <VerifyEmailForm email={params.email} next={params.next} />;
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
