"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SUPPORT } from "@/lib/support";
import { useI18n } from "@/i18n/I18nProvider";

export default function Footer() {
  const { t } = useI18n();
  const copy = t.footer;

  return (
    <footer className="site-footer">
      <div className="footer-main page-shell">
        <div>
          <div className="footer-kicker">{copy.kicker}</div>
          <h2>
            {copy.titleLead}
            <br />
            <em>{copy.titleEmphasis}</em>
          </h2>
        </div>
        <Link className="footer-cta" href="/onboarding">
          {copy.startDesign} <ArrowUpRight size={20} />
        </Link>
      </div>
      <div className="footer-bottom page-shell">
        <Link href="/marketplace" className="footer-logo" aria-label={copy.home}>
          <Image
            src="/img/logo.png"
            alt="IPILE"
            width={398}
            height={135}
            className="footer-logo-image"
          />
        </Link>
        <span>{copy.tagline}</span>
        <div>
          <Link href="/fabric-explorer">{copy.fabrics}</Link>
          <Link href="/tailors">{copy.artisans}</Link>
          {SUPPORT.whatsappUrl && (
            <a href={SUPPORT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              {copy.support}
            </a>
          )}
          <Link href="/terms">{copy.terms}</Link>
          <Link href="/privacy">{copy.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
