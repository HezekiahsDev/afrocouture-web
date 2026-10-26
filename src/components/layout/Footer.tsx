import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SUPPORT } from "@/lib/support";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main page-shell">
        <div>
          <div className="footer-kicker">A MORE PERSONAL WAY TO DRESS</div>
          <h2>
            Made for the way
            <br />
            <em>you move.</em>
          </h2>
        </div>
        <Link className="footer-cta" href="/onboarding">
          Find your place in the atelier <ArrowUpRight size={20} />
        </Link>
      </div>
      <div className="footer-bottom page-shell">
        <Link href="/marketplace" className="footer-logo">
          AfroCouture <span>AI</span>
        </Link>
        <span>Crafted with a love for African style.</span>
        <div>
          <Link href="/fabric-explorer">Fabrics</Link>
          <Link href="/tailors">Artisans</Link>
          {SUPPORT.whatsappUrl && (
            <a href={SUPPORT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              Support
            </a>
          )}
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
