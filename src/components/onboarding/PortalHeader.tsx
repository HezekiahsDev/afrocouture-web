'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/components/auth/AuthProvider';
import { SUPPORT } from '@/lib/support';

interface PortalHeaderProps {
  /** Small caption under the wordmark, e.g. "Customer fit profile" */
  portal: string;
  /** Label of the current onboarding step, shown as the active pill */
  current: string;
  links?: { label: string; href: string }[];
}

const defaultLinks = [
  { label: 'Fabrics', href: '/fabric-explorer' },
  { label: 'Marketplace', href: '/marketplace' },
];

const ROLE_LABEL: Record<string, string> = {
  customer: 'Customer',
  tailor: 'Artisan',
  merchant: 'Merchant',
  admin: 'Admin',
};

function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/signin"
        className="rounded-xl border border-[#171717]/15 px-3 py-1.5 text-xs font-semibold text-[#171717] hover:border-[#B8734E]/40"
      >
        Sign in
      </Link>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    // RequireAuth sees a user-initiated sign-out and takes them to the marketplace.
    await signOut();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Your account"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B8734E]/40 bg-[#FFFFFF] text-xs font-bold text-[#171717] hover:border-[#B8734E]"
      >
        {initials(user.fullName, user.email)}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#B8734E]/25 bg-[#FFFFFF]/95 p-2 shadow-[0_12px_32px_-4px_rgba(23,23,23,0.14)] backdrop-blur-xl"
        >
          <div className="border-b border-[#171717]/10 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[#171717]">{user.fullName || 'Your account'}</p>
            <p className="truncate text-xs text-[#6B655C]">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-[#B8734E]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7A4429]">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#171717] hover:bg-[#171717]/5 disabled:opacity-60"
          >
            <LogOut size={16} aria-hidden="true" /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}

export function PortalHeader({ portal, current, links = defaultLinks }: PortalHeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#F5F0E8]/85 backdrop-blur-xl border-b border-[#171717]/10">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        <Link href="/marketplace" className="flex items-center gap-3 shrink-0" aria-label="IPILE — home">
          <Image
            src="/img/logo-ink-trim.png"
            alt="IPILE"
            width={398}
            height={135}
            loading="eager"
            className="h-8 w-auto md:h-9"
          />
          <span className="hidden border-l border-[#171717]/15 pl-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B655C] sm:block">
            {portal}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Portal navigation">
          <span
            aria-current="page"
            className="bg-[#9E5B37] text-[#FFFDF8] font-semibold text-xs rounded-full px-3.5 py-1.5 whitespace-nowrap shadow-[0_4px_14px_rgba(184,115,78,0.3)]"
          >
            {current}
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-[#6B655C] hover:text-[#171717] px-3 py-1.5 whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/onboarding"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs text-[#6B655C] hover:text-[#B8734E] whitespace-nowrap transition-colors"
          >
            <Icon name="switch_account" className="text-[16px]" />
            <span>Switch role</span>
          </Link>
          {SUPPORT.whatsappUrl && (
            <a
              href={SUPPORT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Support on WhatsApp"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#171717]/15 text-[#6B655C] hover:border-[#B8734E]/40 hover:text-[#171717] transition-all text-xs whitespace-nowrap"
            >
              <Icon name="support_agent" className="text-[16px]" />
              <span className="hidden md:inline">Support</span>
            </a>
          )}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

export default PortalHeader;
