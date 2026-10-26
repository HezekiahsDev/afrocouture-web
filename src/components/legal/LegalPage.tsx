import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LEGAL } from '@/lib/legal';
import { SUPPORT } from '@/lib/support';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Shared layout for the Privacy Policy and Terms: heading, contents list, numbered sections. */
export default function LegalPage({
  kicker,
  title,
  intro,
  sections,
  related,
}: {
  kicker: string;
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  related: { href: string; label: string };
}) {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell legal-page">
        <Link href="/marketplace" className="back-link w-fit">
          <ArrowLeft size={16} /> Back to Discover
        </Link>
        <header className="legal-header">
          <span className="section-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated: {LEGAL.lastUpdated}</p>
          <div className="legal-intro">{intro}</div>
        </header>

        <div className="legal-layout">
          <nav className="legal-toc" aria-label="Contents">
            <span className="legal-toc-title">Contents</span>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span>{i + 1}.</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <Link href={related.href} className="legal-related">
              {related.label}
            </Link>
          </nav>

          <article className="legal-body">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
                <h2 id={`${s.id}-title`}>
                  <span>{i + 1}.</span> {s.title}
                </h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** WhatsApp link to support. */
export function ContactLink() {
  if (!SUPPORT.whatsappUrl) return <>AfroCouture support</>;
  return (
    <a href={SUPPORT.whatsappUrl} target="_blank" rel="noopener noreferrer">
      WhatsApp {SUPPORT.whatsappDisplay}
    </a>
  );
}

/** "You can also join our WhatsApp community." when a group link is configured. */
export function CommunityLink() {
  if (!SUPPORT.groupUrl) return null;
  return (
    <>
      {' '}
      You can also join our{' '}
      <a href={SUPPORT.groupUrl} target="_blank" rel="noopener noreferrer">
        WhatsApp community
      </a>
      .
    </>
  );
}
