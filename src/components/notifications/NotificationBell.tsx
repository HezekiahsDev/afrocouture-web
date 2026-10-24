'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { getNotifications, markNotificationsRead } from '@/lib/notifications';
import type { AppNotification } from '@/types';
import { NotificationItem } from './NotificationItem';

/** Navbar bell: unread badge plus a dropdown of the latest notifications. */
export function NotificationBell({
  unread,
  latest,
  active,
  allHref = '/notifications',
}: {
  unread: number;
  latest: AppNotification | null;
  active: boolean;
  allHref?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getNotifications({ limit: 8 })
      .then((page) => {
        if (!cancelled) {
          setItems(page.items);
          setError(false);
        }
      })
      .catch(() => !cancelled && setError(true));
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false);
        return;
      }
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      cancelled = true;
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  // A live notification arriving while the list is open goes to the top (chat ones replace their older row).
  useEffect(() => {
    if (!latest) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- merge pushed item into the open list
    setItems((prev) => (prev ? [latest, ...prev.filter((n) => n.id !== latest.id)].slice(0, 8) : prev));
  }, [latest]);

  async function openItem(n: AppNotification) {
    setOpen(false);
    if (!n.readAt) {
      setItems((prev) => prev?.map((p) => (p.id === n.id ? { ...p, readAt: new Date().toISOString() } : p)) ?? prev);
      markNotificationsRead({ ids: [n.id] }).catch(() => undefined);
    }
    if (n.link) router.push(n.link);
  }

  async function markAll() {
    setItems((prev) => prev?.map((p) => ({ ...p, readAt: p.readAt ?? new Date().toISOString() })) ?? prev);
    await markNotificationsRead({ all: true }).catch(() => undefined);
  }

  return (
    <div className="mk-account mk-bell" ref={ref}>
      <button
        type="button"
        className={`mk-nav-saved ${active || open ? 'active' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={18} />
        {unread > 0 && <span className="mk-nav-count">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {open && (
        <div className="mk-notif-menu" role="dialog" aria-label="Notifications">
          <div className="mk-notif-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" onClick={markAll}>
                <CheckCheck size={15} aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>
          <div className="mk-notif-list">
            {error ? (
              <p className="mk-notif-empty">Couldn&apos;t load notifications. Try again in a moment.</p>
            ) : items === null ? (
              <p className="mk-notif-empty" role="status">Loading…</p>
            ) : items.length === 0 ? (
              <p className="mk-notif-empty">You&apos;re all caught up. Order updates and messages will appear here.</p>
            ) : (
              items.map((n) => <NotificationItem key={n.id} notification={n} onOpen={openItem} compact />)
            )}
          </div>
          <Link href={allHref} className="mk-notif-all" onClick={() => setOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
