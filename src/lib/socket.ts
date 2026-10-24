import { io, type Socket } from 'socket.io-client';
import { TOKEN_KEYS } from './api';
import type { AppNotification, ChatMessage, OrderMilestone, OrderStatus } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ServerToClient {
  new_message: (message: ChatMessage) => void;
  typing: (payload: { orderId: string; userId: string }) => void;
  order_updated: (payload: { orderId: string; status: OrderStatus; milestone: OrderMilestone }) => void;
  /** Sent to every connection of the person it is for. */
  notification: (payload: { notification: AppNotification; unreadCount: number }) => void;
}

type Ack = { ok: boolean; error?: string };
export interface ClientToServer {
  join_order: (payload: { orderId: string }, ack: (res: Ack) => void) => void;
  leave_order: (payload: { orderId: string }, ack?: (res: Ack) => void) => void;
  send_message: (
    payload: { orderId: string; content: string; attachmentUrl?: string },
    ack: (res: Ack & { message?: ChatMessage }) => void,
  ) => void;
  typing: (payload: { orderId: string }) => void;
}

export type ChatSocket = Socket<ServerToClient, ClientToServer>;

let socket: ChatSocket | null = null;
/** User id the current connection authenticated as. */
let socketOwner: string | null = null;

/** `sub` of the stored access token, i.e. who a new connection would authenticate as. */
function tokenOwner(): string | null {
  const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * One shared connection to the /chat namespace. The access token is read on every
 * (re)connect, so a refreshed token is picked up automatically. A connection made for
 * someone else (after switching accounts) is replaced.
 */
export function getChatSocket(): ChatSocket {
  const owner = tokenOwner();
  if (socket && socketOwner !== owner) disconnectChatSocket();
  if (!socket) {
    socketOwner = owner;
    socket = io(`${WS_URL}/chat`, {
      transports: ['websocket', 'polling'],
      auth: (cb) => cb({ token: localStorage.getItem(TOKEN_KEYS.ACCESS) ?? undefined }),
    });
  }
  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
  socketOwner = null;
}

/** Called by AuthProvider: signing out closes the connection so nothing more arrives for that person. */
export function bindChatSocketUser(userId: string | null) {
  if (!userId) disconnectChatSocket();
}
