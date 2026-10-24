import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AiStudio from "@/components/ai-studio/AiStudio";
import AiStudioComingSoon from "@/components/ai-studio/ComingSoon";
import { AI_STUDIO_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title: "AI Design Studio | AfroCouture",
  description: "Describe a garment and generate visual concepts to take to an artisan.",
};

type Params = { prompt?: string; design?: string };

async function StudioContent({ searchParams }: { searchParams: Promise<Params> }) {
  const { prompt, design } = await searchParams;
  if (!AI_STUDIO_ENABLED) return <AiStudioComingSoon prompt={prompt} />;
  return <AiStudio key={design ?? ""} initialPrompt={prompt} initialDesignId={design} />;
}

export default function AiStudioPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
          <StudioContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
