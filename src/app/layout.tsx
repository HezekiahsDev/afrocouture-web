import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
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
    <html lang="en" className={`${jakartaSans.variable} ${inter.variable}`}>
      <body className="bg-ambient">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
