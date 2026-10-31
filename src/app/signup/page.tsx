import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create your account | IPILE",
  description: "Join IPILE to commission artisans, source fabric or sell your craft.",
};

type Params = { role?: string; next?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return <SignUpForm initialRole={params.role} next={params.next} />;
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
