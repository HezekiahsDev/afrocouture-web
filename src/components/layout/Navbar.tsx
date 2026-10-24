"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
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
  Sparkles,
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

const links = [
  { label: "Discover", href: "/marketplace" },
  { label: "Fabrics", href: "/fabric-explorer" },
  { label: "Artisans", href: "/tailors" },
  { label: "AI Studio", href: "/ai-studio", soon: !AI_STUDIO_ENABLED },
];

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

const PROFILE_LINK: Record<SelfServiceRole, string> = {
  customer: "My fit profile",
  tailor: "My artisan profile",
  merchant: "My merchant profile",
};

const ROLE_LABEL: Record<User["role"], string> = {
  customer: "Customer",
  tailor: "Artisan",
  merchant: "Merchant",
  admin: "Admin",
};

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
  const { user, status, signOut } = useAuth();
  const saved = useSavedItems();
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
    <header className="site-header">
      <div className="nav-shell">
        <Link
          href="/marketplace"
          className="brand"
          aria-label="AfroCouture AI home"
        >
          <span className="brand-symbol">
            A
            <span>
              <Sparkles size={11} />
            </span>
          </span>
          <span className="brand-wordmark">
            AfroCouture <span>AI</span>
            <small>THE MODERN ATELIER</small>
          </span>
        </Link>
        <nav
          className={`site-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
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
              {link.soon && <span className="mk-nav-soon">Soon</span>}
            </Link>
          ))}
          <form className="mobile-search" role="search" onSubmit={search}>
            <Search size={17} />
            <input
              aria-label="Search styles, fabrics, or artisans"
              placeholder="Search the atelier"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button aria-label="Submit search" type="submit">
              <ArrowUpRight size={18} />
            </button>
          </form>
          {status === "authenticated" && user ? (
            <div className="mk-mobile-account">
              <div className="mk-account-id">
                <span className="mk-account-avatar" aria-hidden="true">
                  {initials(user)}
                </span>
                <span>
                  <strong>{user.fullName ?? "Your account"}</strong>
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
                <Bell size={16} /> Notifications
                {notifications.unread > 0 && ` (${notifications.unread} unread)`}
              </Link>
              {user.role !== "admin" && (
                <>
                  <Link href="/orders" onClick={closeAll}>
                    <ReceiptText size={16} /> Orders
                    {ordersCount > 0 && ` (${ordersCount} to do)`}
                  </Link>
                  <Link href="/saved" onClick={closeAll}>
                    <Bookmark size={16} /> Your selection
                    {savedCount > 0 && ` (${savedCount})`}
                  </Link>
                </>
              )}
              {user.role === "merchant" && (
                <Link href="/merchant/fabrics" onClick={closeAll}>
                  <Layers size={16} /> My fabrics
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin" onClick={closeAll}>
                  <ShieldCheck size={16} /> Admin dashboard
                </Link>
              )}
              <button type="button" onClick={handleSignOut}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            status === "anonymous" && (
              <div className="mk-mobile-account">
                <Link href={`/signin?next=${encodeURIComponent(pathname)}`} onClick={closeAll}>
                  <UserRound size={16} /> Sign in
                </Link>
                <Link href="/onboarding" className="mobile-join" onClick={closeAll}>
                  Join the atelier <ArrowUpRight size={16} />
                </Link>
              </div>
            )
          )}
        </nav>
        <div className="nav-actions">
          <form className="nav-search" role="search" onSubmit={search}>
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Search styles, fabrics, or artisans"
              placeholder="Search the atelier"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
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
                  <ShieldCheck size={16} aria-hidden="true" /> Admin dashboard
                </Link>
              ) : (
              <>
              <Link
                href="/orders"
                className={`mk-nav-saved ${pathname.startsWith("/orders") ? "active" : ""}`}
                aria-label={`Orders${ordersCount ? `, ${ordersCount} need${ordersCount === 1 ? "s" : ""} your attention` : ""}`}
              >
                <ReceiptText size={18} />
                {ordersCount > 0 && <span className="mk-nav-count">{ordersCount}</span>}
              </Link>
              <Link
                href="/saved"
                className={`mk-nav-saved ${pathname === "/saved" ? "active" : ""}`}
                aria-label={`Your selection, ${savedCount} saved item${savedCount === 1 ? "" : "s"}`}
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
                  <span className="sr-only">Account menu</span>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {accountOpen && (
                  <div className="mk-account-menu" role="menu">
                    <div className="mk-account-id">
                      <strong>{user.fullName ?? "Your account"}</strong>
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
                          <ReceiptText size={16} /> Orders
                          {ordersCount > 0 && (
                            <span className="mk-menu-count">{ordersCount}</span>
                          )}
                        </Link>
                        <Link href="/saved" role="menuitem" onClick={closeAll}>
                          <Bookmark size={16} /> Your selection
                          {savedCount > 0 && (
                            <span className="mk-menu-count">{savedCount}</span>
                          )}
                        </Link>
                      </>
                    )}
                    {user.role === "merchant" && (
                      <Link href="/merchant/fabrics" role="menuitem" onClick={closeAll}>
                        <Layers size={16} /> My fabrics
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin" role="menuitem" onClick={closeAll}>
                        <ShieldCheck size={16} /> Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} /> Sign out
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
                  Sign in
                </Link>
              )}
              <Link href="/onboarding" className="nav-join">
                Join the atelier <ArrowUpRight size={15} />
              </Link>
            </>
          )}
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
