import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MarketplaceHero from '@/components/marketplace/MarketplaceHero';
import QuickActionGrid from '@/components/marketplace/QuickActionGrid';
import AIPromptBar from '@/components/marketplace/AIPromptBar';
import StyleCarousel from '@/components/marketplace/StyleCarousel';
import FeaturedTailors from '@/components/marketplace/FeaturedTailors';
import TrendingFabrics from '@/components/marketplace/TrendingFabrics';
import EscrowGuaranteeStrip from '@/components/marketplace/EscrowGuaranteeStrip';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace — AfroCouture AI',
  description: 'Browse verified African tailors, explore premium fabrics, and generate bespoke outfits with AI.',
};

export default function MarketplacePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#090D16' }}>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <MarketplaceHero />
        <QuickActionGrid />
        <AIPromptBar />
        <StyleCarousel />
        <FeaturedTailors />
        <TrendingFabrics />
        <EscrowGuaranteeStrip />
      </main>
      <Footer />
    </div>
  );
}
