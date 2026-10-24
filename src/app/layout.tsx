import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import './atelier.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SavedProvider } from '@/components/marketplace/shared';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'AfroCouture AI — Africa\'s Premier AI Couture & Artisan Ecosystem',
  description:
    'Find verified African tailors, source premium Ankara and brocade silks, and preview tailored silhouettes instantly with AI. Escrow-protected commissions.',
  keywords: ['African fashion', 'bespoke tailoring', 'Ankara', 'Kaftan', 'Agbada', 'Nigerian fashion', 'AI design'],
  openGraph: {
    title: 'AfroCouture AI',
    description: 'Africa\'s Premier AI Couture & Artisan Ecosystem',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="bg-ambient font-sans">
        <AuthProvider>
          <SavedProvider>
            <div className="relative z-10">{children}</div>
          </SavedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
