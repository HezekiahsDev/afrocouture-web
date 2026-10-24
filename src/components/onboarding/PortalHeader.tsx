'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Sparkles } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/components/auth/AuthProvider';

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

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

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
        className="rounded-xl border border-white/[0.12] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#00A3FF]/40"
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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#00A3FF]/40 bg-[#1E293B] text-xs font-bold text-[#F8FAFC] hover:border-[#00A3FF]"
      >
        {initials(user.fullName, user.email)}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#00A3FF]/25 bg-[#1E293B]/95 p-2 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.08] px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[#F8FAFC]">{user.fullName || 'Your account'}</p>
            <p className="truncate text-xs text-[#94A3B8]">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-[#00A3FF]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#F8FAFC] hover:bg-white/5 disabled:opacity-60"
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
    <header className="fixed top-0 w-full z-50 bg-[#090D16]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        <Link href="/marketplace" className="flex items-center gap-3 shrink-0" aria-label="AfroCouture AI home">
          <span className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#00A3FF] to-[#0284C7] flex items-center justify-center text-[#090D16] font-display font-extrabold text-lg shadow-[0_4px_14px_rgba(0,163,255,0.35)]">
            A
            <Sparkles size={11} className="absolute -top-1.5 -right-1.5 text-[#22D3EE]" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="font-display font-extrabold text-sm md:text-base tracking-tight text-[#F8FAFC] whitespace-nowrap">
              AfroCouture{' '}
              <span className="bg-gradient-to-br from-[#00A3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">AI</span>
            </span>
            <span className="hidden text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold whitespace-nowrap sm:block">
              {portal}
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Portal navigation">
          <span
            aria-current="page"
            className="bg-[#00A3FF] text-[#090D16] font-semibold text-xs rounded-full px-3.5 py-1.5 whitespace-nowrap shadow-[0_4px_14px_rgba(0,163,255,0.3)]"
          >
            {current}
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] px-3 py-1.5 whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/onboarding"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#00A3FF] whitespace-nowrap transition-colors"
          >
            <Icon name="switch_account" className="text-[16px]" />
            <span>Switch role</span>
          </Link>
          {supportEmail && (
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-white/[0.12] text-[#94A3B8] hover:border-[#00A3FF]/40 hover:text-[#F8FAFC] transition-all text-xs whitespace-nowrap"
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
