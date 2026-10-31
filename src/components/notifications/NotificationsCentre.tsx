'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { card, ghostButton, InlineAlert, Spinner } from '@/components/orders/ui';
import { apiErrorMessage } from '@/lib/api';
import { getNotifications, markNotificationsRead, onUnreadChange } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';
import { NotificationItem } from './NotificationItem';

const PAGE = 20;

export default function NotificationsCentre() {
  return (
    <RequireAuth>
      <Centre />
    </RequireAuth>
  );
}

function Centre() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [unread, setUnread] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (before?: string) => {
    const page = await getNotifications({ limit: PAGE, before, unread: filter === 'unread' });
    setItems((prev) => (before && prev ? [...prev, ...page.items] : page.items));
    setHasMore(page.hasMore);
    setUnread(page.unreadCount);
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- (re)load when the filter changes
    setItems(null);
    load().catch((err) => setError(apiErrorMessage(err, 'Could not load your notifications.')));
  }, [load]);

  useEffect(() => onUnreadChange(setUnread), []);

  async function loadMore() {
    const last = items?.[items.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      await load(last.createdAt);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load more notifications.'));
    } finally {
      setLoadingMore(false);
    }
  }

  function open(n: AppNotification) {
    if (!n.readAt) {
      setItems((prev) => prev?.map((p) => (p.id === n.id ? { ...p, readAt: new Date().toISOString() } : p)) ?? prev);
      markNotificationsRead({ ids: [n.id] }).catch(() => undefined);
    }
    if (n.link) router.push(n.link);
  }

  async function markAll() {
    setItems((prev) =>
      filter === 'unread' ? [] : (prev?.map((p) => ({ ...p, readAt: p.readAt ?? new Date().toISOString() })) ?? prev),
    );
    try {
      await markNotificationsRead({ all: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="section-kicker">YOUR ATELIER</span>
          <h1 className="text-[30px] font-extrabold leading-[38px] text-[#171717] sm:text-[36px] sm:leading-[44px]">Notifications</h1>
          <p className="text-sm text-[#6B655C]">
            {unread > 0 ? `${unread} unread` : 'You’re all caught up.'} Read notifications are cleared after 90 days.
          </p>
        </div>
        {unread > 0 && (
          <button type="button" className={ghostButton} onClick={markAll}>
            <CheckCheck size={16} aria-hidden="true" /> Mark all as read
          </button>
        )}
      </header>

      <div className="flex gap-2" role="tablist" aria-label="Filter notifications">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition',
              filter === f
                ? 'border-[#B8734E]/50 bg-[#B8734E]/15 text-[#171717]'
                : 'border-[#171717]/12 text-[#6B655C] hover:text-[#171717]',
            )}
          >
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {error && <InlineAlert>{error}</InlineAlert>}

      <section className={cn(card, 'mk-notif-page p-2 sm:p-2')} aria-live="polite">
        {items === null ? (
          <div className="flex justify-center py-16 text-[#6B655C]" role="status">
            <Spinner label="Loading notifications" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#B8734E]/10 text-[#1F2A42]">
              <Bell size={22} aria-hidden="true" />
            </span>
            <p className="font-semibold text-[#171717]">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            <p className="max-w-sm text-sm text-[#6B655C]">
              Quotes, payments, production updates, messages and payouts will show up here as they happen.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationItem notification={n} onOpen={open} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {hasMore && (
        <button type="button" className={cn(ghostButton, 'self-center')} onClick={loadMore} disabled={loadingMore}>
          {loadingMore && <Spinner />} Load older notifications
        </button>
      )}
    </div>
  );
}
