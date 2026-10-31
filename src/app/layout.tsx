import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import './atelier.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SavedProvider } from '@/components/marketplace/shared';
import { I18nProvider } from '@/i18n/I18nProvider';
import { LOCALES, LOCALE_COOKIE } from '@/i18n/config';

// latin-ext carries the hooked letters Hausa uses (ɓ, ɗ, ƙ) and Yoruba's ṣ;
// vietnamese carries the dotted vowels (ẹ, ọ, ị, ụ) and combining tone marks
// Yoruba and Igbo use.
const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

/** Absolute base for OG/Twitter images; Vercel provides its own production hostname. */
function resolveSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000');
  try {
    return new URL(raw);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: 'IPILE — Contemporary African Luxury, Crafted Around You',
  description:
    'Discover skilled makers, explore fabrics, and bring your next outfit to life. Commission verified African tailors and source premium fabric on IPILE.',
  keywords: [
    'African fashion',
    'bespoke tailoring',
    'Ankara',
    'Kaftan',
    'Agbada',
    'Nigerian fashion',
    'made to measure',
    'artisan marketplace',
  ],
  openGraph: {
    title: 'IPILE — Crafted Around You',
    description:
      'Contemporary African luxury. Discover skilled makers, explore fabrics, and bring your next outfit to life.',
    type: 'website',
    siteName: 'IPILE',
    images: [{ url: '/img/logo.png', width: 666, height: 375, alt: 'IPILE' }],
  },
  icons: {
    icon: '/img/icon.png',
    apple: '/img/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable}`}
    >
      <body className="bg-ambient font-sans">
        {/* Apply the stored language before paint so <html lang> is correct for
            assistive tech even before the client provider hydrates. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]*)/);if(m){var l=decodeURIComponent(m[1]);if(${JSON.stringify(LOCALES)}.indexOf(l)!==-1){document.documentElement.lang=l;document.documentElement.dataset.locale=l;}}}catch(e){}`,
          }}
        />
        <I18nProvider>
          <AuthProvider>
            <SavedProvider>
              <div className="relative z-10">{children}</div>
            </SavedProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
