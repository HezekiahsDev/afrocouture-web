import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in | AfroCouture",
  description: "Sign in to your AfroCouture account.",
};

type Params = { next?: string; email?: string; reason?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return <SignInForm next={params.next} email={params.email} reason={params.reason} />;
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
