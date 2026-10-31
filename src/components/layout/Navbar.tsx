"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  ChevronDown,
  Layers,
  LogOut,
  Menu,
  ReceiptText,
  Ruler,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_HOME } from "@/lib/auth";
import { useSavedItems } from "@/components/marketplace/shared";
import { listOrders } from "@/lib/orders";
import { needsAction, rolesFor } from "@/components/orders/needsAction";
import type { SelfServiceRole, User } from "@/types";
import { AI_STUDIO_ENABLED } from "@/lib/features";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUnreadNotifications } from "@/components/notifications/useNotifications";
import { SetupBanner } from "@/components/onboarding/SetupBanner";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

/** Orders waiting on this person, across the roles they can act in. */
function useOrdersNeedingAction(user: User | null, pathname: string): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!user || user.role === "admin") return;
    let cancelled = false;
    Promise.all(
      rolesFor(user.role).map((role) =>
        listOrders({ role }).then((orders) => orders.filter((o) => needsAction(o, role)).length),
      ),
    )
      .then((counts) => !cancelled && setCount(counts.reduce((a, b) => a + b, 0)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // Re-check when they move between pages (e.g. after acting on an order).
  }, [user, pathname]);
  return user ? count : 0;
}

const isSelfService = (role: User["role"]): role is SelfServiceRole =>
  role in ROLE_HOME;

const initials = (user: User) =>
  (user.fullName ?? user.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/**
 * The current path is request data on dynamic routes (e.g. /orders/[id]), so the
 * navbar renders inside its own Suspense boundary with an empty bar as fallback.
 */
export default function Navbar() {
  return (
    <Suspense fallback={<header className="site-header" aria-hidden="true" />}>
      <NavbarContent />
    </Suspense>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { user, status, signOut } = useAuth();
  const saved = useSavedItems();
  const links = [
    { label: t.nav.discover, href: "/marketplace" },
    { label: t.nav.fabrics, href: "/fabric-explorer" },
    { label: t.nav.artisans, href: "/tailors" },
    { label: t.nav.aiStudio, href: "/ai-studio", soon: !AI_STUDIO_ENABLED },
  ];
  const PROFILE_LINK: Record<SelfServiceRole, string> = t.nav.profile;
  const ROLE_LABEL: Record<User["role"], string> = t.nav.roles;
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const accountRef = useRef<HTMLDivElement>(null);
  const savedCount = saved.items.length;
  const ordersCount = useOrdersNeedingAction(status === "authenticated" ? user : null, pathname);
  const notifications = useUnreadNotifications(status === "authenticated" && user ? user.id : null);

  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setAccountOpen(false);
        return;
      }
      if (!accountRef.current?.contains(event.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [accountOpen]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(
      `/marketplace${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`,
    );
    setMenuOpen(false);
  }

  async function handleSignOut() {
    setAccountOpen(false);
    setMenuOpen(false);
    await signOut();
    router.push("/marketplace");
  }

  const closeAll = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const profileHref =
    user && isSelfService(user.role) ? ROLE_HOME[user.role] : null;

  return (
    <>
    <header className="site-header">
      <div className="nav-shell">
        <Link
          href="/marketplace"
          className="brand"
          aria-label={t.nav.home}
        >
          <Image
            src="/img/logo.png"
            alt="IPILE"
            width={398}
            height={135}
            loading="eager"
            className="brand-logo"
          />
        </Link>
        <nav
          className={`site-nav ${menuOpen ? "is-open" : ""}`}
          aria-label={t.nav.mainNavigation}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeAll}
              className={pathname.startsWith(link.href) ? "active" : ""}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
              {link.soon && <span className="mk-nav-soon">{t.nav.soon}</span>}
            </Link>
          ))}
          <form className="mobile-search" role="search" onSubmit={search}>
            <Search size={17} />
            <input
              aria-label={t.nav.searchLabel}
              placeholder={t.nav.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button aria-label={t.nav.submitSearch} type="submit">
              <ArrowUpRight size={18} />
            </button>
          </form>
          <div className="lang-switcher-mobile">
            <LanguageSwitcher tone="light" />
          </div>
          {status === "authenticated" && user ? (
            <div className="mk-mobile-account">
              <div className="mk-account-id">
                <span className="mk-account-avatar" aria-hidden="true">
                  {initials(user)}
                </span>
                <span>
                  <strong>{user.fullName ?? t.nav.yourAccount}</strong>
                  <small>
                    {user.email} · {ROLE_LABEL[user.role]}
                  </small>
                </span>
              </div>
              {profileHref && (
                <Link href={profileHref} onClick={closeAll}>
                  <Ruler size={16} /> {PROFILE_LINK[user.role as SelfServiceRole]}
                </Link>
              )}
              <Link href={user.role === "admin" ? "/admin/notifications" : "/notifications"} onClick={closeAll}>
                <Bell size={16} /> {t.nav.notifications}
                {notifications.unread > 0 && ` (${t.nav.unread(notifications.unread)})`}
              </Link>
              {user.role !== "admin" && (
                <>
                  <Link href="/orders" onClick={closeAll}>
                    <ReceiptText size={16} /> {t.nav.orders}
                    {ordersCount > 0 && ` (${t.nav.toDo(ordersCount)})`}
                  </Link>
                  <Link href="/saved" onClick={closeAll}>
                    <Bookmark size={16} /> {t.nav.selection}
                    {savedCount > 0 && ` (${savedCount})`}
                  </Link>
                </>
              )}
              {user.role === "merchant" && (
                <Link href="/merchant/fabrics" onClick={closeAll}>
                  <Layers size={16} /> {t.nav.myFabrics}
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin" onClick={closeAll}>
                  <ShieldCheck size={16} /> {t.nav.adminDashboard}
                </Link>
              )}
              <button type="button" onClick={handleSignOut}>
                <LogOut size={16} /> {t.nav.signOut}
              </button>
            </div>
          ) : (
            status === "anonymous" && (
              <div className="mk-mobile-account">
                <Link href={`/signin?next=${encodeURIComponent(pathname)}`} onClick={closeAll}>
                  <UserRound size={16} /> {t.nav.signIn}
                </Link>
                <Link href="/onboarding" className="mobile-join" onClick={closeAll}>
                  {t.nav.joinAtelier} <ArrowUpRight size={16} />
                </Link>
              </div>
            )
          )}
        </nav>
        <div className="nav-actions">
          <form className="nav-search" role="search" onSubmit={search}>
            <Search size={16} aria-hidden="true" />
            <input
              aria-label={t.nav.searchLabel}
              placeholder={t.nav.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <LanguageSwitcher tone="dark" />
          {status === "authenticated" && user ? (
            <>
              <NotificationBell
                unread={notifications.unread}
                latest={notifications.latest}
                active={pathname === "/notifications"}
                allHref={user.role === "admin" ? "/admin/notifications" : "/notifications"}
              />
              {user.role === "admin" ? (
                <Link href="/admin" className="mk-nav-admin">
                  <ShieldCheck size={16} aria-hidden="true" /> {t.nav.adminDashboard}
                </Link>
              ) : (
              <>
              <Link
                href="/orders"
                className={`mk-nav-saved ${pathname.startsWith("/orders") ? "active" : ""}`}
                aria-label={ordersCount ? t.nav.ordersAttention(ordersCount) : t.nav.orders}
              >
                <ReceiptText size={18} />
                {ordersCount > 0 && <span className="mk-nav-count">{ordersCount}</span>}
              </Link>
              <Link
                href="/saved"
                className={`mk-nav-saved ${pathname === "/saved" ? "active" : ""}`}
                aria-label={t.nav.selectionLabel(savedCount)}
              >
                <Bookmark size={18} />
                {savedCount > 0 && (
                  <span className="mk-nav-count">{savedCount}</span>
                )}
              </Link>
              </>
              )}
              <div className="mk-account" ref={accountRef}>
                <button
                  type="button"
                  className="mk-account-button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <span className="mk-account-avatar" aria-hidden="true">
                    {initials(user)}
                  </span>
                  <span className="sr-only">{t.nav.accountMenu}</span>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {accountOpen && (
                  <div className="mk-account-menu" role="menu">
                    <div className="mk-account-id">
                      <strong>{user.fullName ?? t.nav.yourAccount}</strong>
                      <small>{user.email}</small>
                      <span className="mk-role-pill">{ROLE_LABEL[user.role]}</span>
                    </div>
                    {profileHref && (
                      <Link
                        href={profileHref}
                        role="menuitem"
                        onClick={closeAll}
                      >
                        <Ruler size={16} />{" "}
                        {PROFILE_LINK[user.role as SelfServiceRole]}
                      </Link>
                    )}
                    {user.role !== "admin" && (
                      <>
                        <Link href="/orders" role="menuitem" onClick={closeAll}>
                          <ReceiptText size={16} /> {t.nav.orders}
                          {ordersCount > 0 && (
                            <span className="mk-menu-count">{ordersCount}</span>
                          )}
                        </Link>
                        <Link href="/saved" role="menuitem" onClick={closeAll}>
                          <Bookmark size={16} /> {t.nav.selection}
                          {savedCount > 0 && (
                            <span className="mk-menu-count">{savedCount}</span>
                          )}
                        </Link>
                      </>
                    )}
                    {user.role === "merchant" && (
                      <Link href="/merchant/fabrics" role="menuitem" onClick={closeAll}>
                        <Layers size={16} /> {t.nav.myFabrics}
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin" role="menuitem" onClick={closeAll}>
                        <ShieldCheck size={16} /> {t.nav.adminDashboard}
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} /> {t.nav.signOut}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {status === "anonymous" && (
                <Link
                  href={`/signin?next=${encodeURIComponent(pathname)}`}
                  className="mk-nav-signin"
                >
                  {t.nav.signIn}
                </Link>
              )}
              <Link href="/onboarding" className="nav-join">
                {t.nav.joinAtelier} <ArrowUpRight size={15} />
              </Link>
            </>
          )}
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
    {status === "authenticated" && user && <SetupBanner user={user} pathname={pathname} />}
    </>
  );
}
