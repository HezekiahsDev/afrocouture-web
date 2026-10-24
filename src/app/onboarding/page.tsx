import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RoleSelection from "@/components/onboarding/RoleSelection";

export const metadata: Metadata = {
  title: "Join the atelier | AfroCouture",
  description: "Choose your place in the AfroCouture atelier.",
};

async function RoleSelectionContent({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const { idea } = await searchParams;
  return <RoleSelection idea={idea?.slice(0, 300)} />;
}

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <Suspense fallback={<div style={{ minHeight: "75vh" }} />}>
          <RoleSelectionContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
