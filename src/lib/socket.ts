import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getArtisanChatSocket(orderId?: string): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('afrocouture_access_token') : null;
    socket = io(`${WS_URL}/chat`, {
      autoConnect: true,
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
    });
  }

  if (orderId && socket.connected) {
    socket.emit('join_order_room', { orderId });
  }

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

