'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Banknote,
  Bell,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  ReceiptText,
  Scale,
  ScrollText,
  Star,
  Store,
  Users,
  X,
} from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useUnreadNotifications } from '@/components/notifications/useNotifications';
import { getOverview } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { AdminOverview } from '@/types/admin';

type Queues = AdminOverview['queues'];

interface AdminContextValue {
  queues: Queues | null;
  /** Re-reads the queue counts (after approving, resolving, retrying…). */
  refreshQueues: () => void;
}
const AdminContext = createContext<AdminContextValue>({ queues: null, refreshQueues: () => undefined });
export const useAdminQueues = () => useContext(AdminContext);

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: (q: Queues, unread: number) => number;
  /** Active when this returns true; defaults to a path-prefix match. */
  active?: (pathname: string, status: string | null) => boolean;
}

const NAV: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Operations',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard, active: (p) => p === '/admin' },
      { label: 'Verifications', href: '/admin/verifications', icon: BadgeCheck, badge: (q) => q.pendingVerifications },
      {
        label: 'Orders',
        href: '/admin/orders',
        icon: ReceiptText,
        active: (p, s) => p.startsWith('/admin/orders') && s !== 'disputed',
      },
      {
        label: 'Disputes',
        href: '/admin/orders?status=disputed',
        icon: Scale,
        badge: (q) => q.openDisputes,
        active: (p, s) => p === '/admin/orders' && s === 'disputed',
      },
      { label: 'Payouts', href: '/admin/payouts', icon: Banknote, badge: (q) => q.failedPayouts },
    ],
  },
  {
    heading: 'Community',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Fabrics', href: '/admin/fabrics', icon: Layers },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: Bell, badge: (_q, unread) => unread },
      { label: 'Audit log', href: '/admin/audit', icon: ScrollText },
    ],
  },
];

/** Old console links (/admin?tab=…) open the matching section. */
const LEGACY_TABS: Record<string, string> = {
  verifications: '/admin/verifications',
  disputes: '/admin/orders?status=disputed',
  payouts: '/admin/payouts',
};

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="admin">
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [queues, setQueues] = useState<Queues | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifications = useUnreadNotifications(user?.id ?? null);

  const refreshQueues = useCallback(() => {
    getOverview()
      .then((o) => setQueues(o.queues))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshQueues();
  }, [pathname, refreshQueues]);

  const tab = search.get('tab');
  useEffect(() => {
    if (pathname === '/admin' && tab && LEGACY_TABS[tab]) router.replace(LEGACY_TABS[tab]);
  }, [pathname, tab, router]);

  async function handleSignOut() {
    await signOut();
    router.push('/marketplace');
  }

  const status = search.get('status');
  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {NAV.map((group) => (
        <div key={group.heading} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">{group.heading}</p>
          {group.items.map((item) => {
            const isActive = item.active ? item.active(pathname, status) : pathname.startsWith(item.href);
            const count = queues ? (item.badge?.(queues, notifications.unread) ?? 0) : item.label === 'Notifications' ? notifications.unread : 0;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-[#00A3FF]/15 text-[#F8FAFC]' : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]',
                )}
              >
                <Icon size={18} aria-hidden="true" className={isActive ? 'text-[#38BDF8]' : undefined} />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums',
                      item.label === 'Disputes' || item.label === 'Payouts' ? 'bg-[#93000a]/60 text-[#ffdad6]' : 'bg-[#00A3FF] text-[#090D16]',
                    )}
                  >
                    {count > 99 ? '99+' : count}
                    <span className="sr-only"> waiting</span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const account = user && (
    <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
      <div className="px-3">
        <p className="truncate text-sm font-semibold text-[#F8FAFC]">{user.fullName ?? 'Admin'}</p>
        <p className="truncate text-xs text-[#64748B]">{user.email}</p>
      </div>
      <Link href="/marketplace" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC]">
        <Store size={16} aria-hidden="true" /> View marketplace
      </Link>
      <button type="button" onClick={handleSignOut} className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#94A3B8] hover:text-[#F8FAFC]">
        <LogOut size={16} aria-hidden="true" /> Sign out
      </button>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00A3FF] text-base font-black text-[#090D16]">A</span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold text-[#F8FAFC]">AfroCouture</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#38BDF8]">Admin</span>
      </span>
    </Link>
  );

  return (
    <AdminContext.Provider value={{ queues, refreshQueues }}>
      <div className="min-h-screen bg-[#090D16] text-[#DFE2EF] lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col justify-between overflow-y-auto border-r border-white/[0.06] bg-[#0B1120] px-3 py-6 lg:flex">
          <div className="flex flex-col gap-8">
            {brand}
            {nav}
          </div>
          {account}
        </aside>

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#0B1120]/95 px-4 py-3 backdrop-blur lg:hidden">
          {brand}
          <div className="flex items-center gap-2">
            <NotificationBell unread={notifications.unread} latest={notifications.latest} active={false} allHref="/admin/notifications" />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-[#CBD5E1]"
              aria-label="Open admin menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col justify-between overflow-y-auto bg-[#0B1120] px-3 py-5">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  {brand}
                  <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-2 text-[#94A3B8]">
                    <X size={20} />
                  </button>
                </div>
                {nav}
              </div>
              {account}
            </div>
          </div>
        )}

        <main className="min-w-0">
          <div className="hidden items-center justify-end gap-3 border-b border-white/[0.06] px-8 py-3 lg:flex">
            <NotificationBell unread={notifications.unread} latest={notifications.latest} active={pathname === '/admin/notifications'} allHref="/admin/notifications" />
          </div>
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}

/** Page title block used by every admin section. */
export function AdminHeading({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">{kicker}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}
