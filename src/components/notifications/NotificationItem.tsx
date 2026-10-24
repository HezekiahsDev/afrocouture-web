'use client';

import { createElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  MessageCircle,
  Package,
  ReceiptText,
  RotateCcw,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';
import type { AppNotification } from '@/types';

const ICONS: [prefix: string, icon: LucideIcon][] = [
  ['chat', MessageCircle],
  ['order_milestone', Scissors],
  ['order_paid', Wallet],
  ['payout', Wallet],
  ['payment_refunded', RotateCcw],
  ['fabric', Package],
  ['review', Star],
  ['verification', ShieldCheck],
  ['admin', ShieldAlert],
  ['order', ReceiptText],
];

export const iconFor = (type: string): LucideIcon => ICONS.find(([prefix]) => type.startsWith(prefix))?.[1] ?? Bell;

export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

/** One notification row, shared by the bell dropdown and the notifications page. */
export function NotificationItem({
  notification,
  onOpen,
  compact = false,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
  compact?: boolean;
}) {
  const unread = !notification.readAt;
  return (
    <button
      type="button"
      className={`mk-notif-item${unread ? ' is-unread' : ''}${compact ? ' is-compact' : ''}`}
      onClick={() => onOpen(notification)}
    >
      <span className="mk-notif-icon" aria-hidden="true">
        {createElement(iconFor(notification.type), { size: compact ? 16 : 18 })}
      </span>
      <span className="mk-notif-text">
        <strong>{notification.title}</strong>
        {notification.body && <span>{notification.body}</span>}
        <small>{timeAgo(notification.createdAt)}</small>
      </span>
      {unread && (
        <span className="mk-notif-dot">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </button>
  );
}
