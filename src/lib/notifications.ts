import api from './api';
import type { NotificationPage } from '@/types';

export async function getNotifications(params: { before?: string; limit?: number; unread?: boolean } = {}): Promise<NotificationPage> {
  return (await api.get<NotificationPage>('/notifications', { params: { ...params, unread: params.unread || undefined } })).data;
}

export async function getUnreadCount(): Promise<number> {
  return (await api.get<{ unreadCount: number }>('/notifications/unread-count')).data.unreadCount;
}

/** Marks notifications read (specific ids, everything for one order, or all) and broadcasts the new count. */
export async function markNotificationsRead(target: { ids?: string[]; orderId?: string; all?: boolean }): Promise<number> {
  const { unreadCount } = (await api.post<{ unreadCount: number }>('/notifications/read', target)).data;
  announceUnread(unreadCount);
  return unreadCount;
}

const UNREAD_EVENT = 'IPILE:unread-notifications';

/** Lets the navbar bell pick up count changes made elsewhere on the page. */
export function announceUnread(count: number) {
  window.dispatchEvent(new CustomEvent<number>(UNREAD_EVENT, { detail: count }));
}

export function onUnreadChange(listener: (count: number) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<number>).detail);
  window.addEventListener(UNREAD_EVENT, handler);
  return () => window.removeEventListener(UNREAD_EVENT, handler);
}
