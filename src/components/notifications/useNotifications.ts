'use client';

import { useEffect, useState } from 'react';
import { getUnreadCount, onUnreadChange } from '@/lib/notifications';
import { getChatSocket } from '@/lib/socket';
import type { AppNotification } from '@/types';

const POLL_MS = 2 * 60 * 1000;

/**
 * Unread count for the signed-in person: pushed live over the socket, with a slow poll
 * and a refresh on tab focus as a fallback. `latest` is the most recent pushed notification.
 */
export function useUnreadNotifications(userId: string | null) {
  const [unread, setUnread] = useState(0);
  const [latest, setLatest] = useState<AppNotification | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    // Bumped by every pushed or announced count, so a slower fetch can't overwrite a newer value.
    let version = 0;
    const refresh = () => {
      const started = version;
      getUnreadCount()
        .then((n) => !cancelled && started === version && setUnread(n))
        .catch(() => undefined);
    };
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    const onFocus = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onFocus);
    const stopListening = onUnreadChange((n) => {
      version++;
      setUnread(n);
    });

    const socket = getChatSocket();
    const onPush = ({ notification, unreadCount }: { notification: AppNotification; unreadCount: number }) => {
      version++;
      setUnread(unreadCount);
      setLatest(notification);
    };
    socket.on('notification', onPush);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onFocus);
      stopListening();
      socket.off('notification', onPush);
    };
  }, [userId]);

  return { unread: userId ? unread : 0, latest };
}
