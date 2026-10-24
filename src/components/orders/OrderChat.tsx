'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ImagePlus, Info, LoaderCircle, Send } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { uploadFile } from '@/lib/catalog';
import { getMessages, sendMessage } from '@/lib/orders';
import { getChatSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const PAGE = 50;
const POLL_MS = 8000;

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });

function merge(list: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(list.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

/**
 * Live conversation between the customer and the artisan on one order. Uses the
 * Socket.IO room when connected and falls back to REST (send + polling) otherwise.
 */
export function OrderChat({
  orderId,
  myId,
  otherName,
  closedReason,
  onOrderUpdated,
}: {
  orderId: string;
  myId: string;
  otherName: string;
  /** When set, the composer is disabled with this explanation. */
  closedReason?: string;
  onOrderUpdated: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [live, setLive] = useState(false);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);
  const lastTypingSent = useRef(0);
  const updated = useRef(onOrderUpdated);
  useEffect(() => {
    updated.current = onOrderUpdated;
  });

  // History
  useEffect(() => {
    let cancelled = false;
    getMessages(orderId, undefined, PAGE)
      .then((list) => {
        if (cancelled) return;
        setMessages(merge([], list));
        setHasMore(list.length === PAGE);
      })
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Could not load messages.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Live room
  useEffect(() => {
    const socket = getChatSocket();
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    let retriedAuth = false;

    const join = () => {
      socket.emit('join_order', { orderId }, (res) => setLive(Boolean(res?.ok)));
    };
    const onMessage = (message: ChatMessage) => {
      if (message.orderId !== orderId) return;
      setMessages((prev) => merge(prev, [message]));
      if (message.senderId !== myId) setTyping(false);
    };
    const onTyping = (payload: { orderId: string; userId: string }) => {
      if (payload.orderId !== orderId || payload.userId === myId) return;
      setTyping(true);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => setTyping(false), 3500);
    };
    const onUpdated = (payload: { orderId: string }) => {
      if (payload.orderId === orderId) updated.current();
    };
    const onDisconnect = () => setLive(false);
    const onConnectError = async () => {
      setLive(false);
      // An expired access token: let the API client refresh it, then reconnect once.
      if (retriedAuth) return;
      retriedAuth = true;
      try {
        await api.get('/auth/me');
        socket.connect();
      } catch {
        // Stay on REST polling.
      }
    };

    socket.on('connect', join);
    socket.on('new_message', onMessage);
    socket.on('typing', onTyping);
    socket.on('order_updated', onUpdated);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    if (socket.connected) join();
    else socket.connect();

    return () => {
      clearTimeout(typingTimer);
      socket.emit('leave_order', { orderId });
      socket.off('connect', join);
      socket.off('new_message', onMessage);
      socket.off('typing', onTyping);
      socket.off('order_updated', onUpdated);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [orderId, myId]);

  // Fallback: poll for new messages while the live connection is down.
  useEffect(() => {
    if (live || loading) return;
    const timer = setInterval(() => {
      getMessages(orderId, undefined, PAGE)
        .then((list) => setMessages((prev) => merge(prev, list)))
        .catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [live, loading, orderId]);

  // Keep the newest message in view unless the person scrolled up to read history.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const loadEarlier = useCallback(async () => {
    if (!messages.length) return;
    setLoadingMore(true);
    stickToBottom.current = false;
    try {
      const older = await getMessages(orderId, messages[0].createdAt, PAGE);
      setMessages((prev) => merge(prev, older));
      setHasMore(older.length === PAGE);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [messages, orderId]);

  async function deliver(content: string, attachmentUrl?: string) {
    const socket = getChatSocket();
    stickToBottom.current = true;
    if (socket.connected && live) {
      try {
        const res = await socket.timeout(5000).emitWithAck('send_message', { orderId, content, attachmentUrl });
        if (res?.ok) {
          if (res.message) setMessages((prev) => merge(prev, [res.message!]));
          return;
        }
        if (res?.error) throw new Error(res.error);
      } catch (err) {
        // A refusal from the server (e.g. order closed) is final; a timeout falls back to REST.
        if (err instanceof Error && !/timed? ?out|operation has timed out/i.test(err.message)) throw err;
      }
    }
    const message = await sendMessage(orderId, content, attachmentUrl);
    setMessages((prev) => merge(prev, [message]));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError('');
    try {
      await deliver(content);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error && !('isAxiosError' in err) ? err.message : apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Send a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('That photo is larger than 10 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const asset = await uploadFile(file, 'chat');
      await deliver(draft.trim(), asset.url);
      setDraft('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send the photo.'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function onDraftChange(value: string) {
    setDraft(value);
    const socket = getChatSocket();
    if (value && live && Date.now() - lastTypingSent.current > 2000) {
      lastTypingSent.current = Date.now();
      socket.emit('typing', { orderId });
    }
  }

  return (
    <section
      className="flex h-[640px] max-h-[80vh] min-h-[460px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 backdrop-blur-xl"
      aria-label={`Conversation with ${otherName}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-[#F8FAFC]">Messages</h2>
          <p className="text-xs text-[#94A3B8]">With {otherName}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
          <span className={cn('h-2 w-2 rounded-full', live ? 'bg-[#10B981]' : 'bg-[#64748B]')} aria-hidden="true" />
          {live ? 'Live' : 'Reconnecting…'}
        </span>
      </header>

      <div
        ref={listRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        aria-live="polite"
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-[#94A3B8]">
            <LoaderCircle className="animate-spin" size={22} aria-label="Loading messages" />
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                type="button"
                onClick={loadEarlier}
                disabled={loadingMore}
                className="mx-auto mb-2 rounded-full border border-white/10 px-3 py-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                {loadingMore ? 'Loading…' : 'Load earlier messages'}
              </button>
            )}
            {!messages.length && (
              <p className="m-auto max-w-xs text-center text-sm text-[#64748B]">
                No messages yet. Ask {otherName} anything about the piece — fit, fabric, timing.
              </p>
            )}
            {messages.map((m, index) => {
              const day = dayOf(m.createdAt);
              const showDay = index === 0 || day !== dayOf(messages[index - 1].createdAt);
              const mine = m.senderId === myId;
              return (
                <div key={m.id} className="flex flex-col">
                  {showDay && (
                    <span className="my-2 self-center text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                      {day}
                    </span>
                  )}
                  {m.type === 'system' ? (
                    <p className="flex items-start gap-2 self-center rounded-xl border border-[#00A3FF]/20 bg-[#00A3FF]/5 px-3 py-2 text-center text-xs text-[#cfe5ff]">
                      <Info size={13} className="mt-0.5 shrink-0 text-[#38BDF8]" aria-hidden="true" />
                      <span>
                        {m.content} <span className="text-[#64748B]">· {timeOf(m.createdAt)}</span>
                      </span>
                    </p>
                  ) : (
                    <div className={cn('flex max-w-[82%] flex-col gap-1', mine ? 'items-end self-end' : 'items-start self-start')}>
                      {m.attachmentUrl && (
                        <a
                          href={m.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block h-48 w-48 overflow-hidden rounded-xl bg-[#1E293B]"
                        >
                          <Image src={m.attachmentUrl} alt="Photo in chat" fill sizes="192px" className="object-cover" />
                        </a>
                      )}
                      {m.content && (
                        <p
                          className={cn(
                            'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-5',
                            mine ? 'rounded-br-md bg-[#00A3FF] text-[#090D16]' : 'rounded-bl-md bg-[#1E293B] text-[#F8FAFC]',
                          )}
                        >
                          {m.content}
                        </p>
                      )}
                      <span className="text-[10px] text-[#64748B]">{timeOf(m.createdAt)}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {typing && (
              <p className="self-start text-xs italic text-[#94A3B8]" aria-live="polite">
                {otherName} is typing…
              </p>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="border-t border-white/[0.08] px-4 py-2 text-xs text-[#ffb4ab]" role="alert">
          {error}
        </p>
      )}

      {closedReason ? (
        <p className="border-t border-white/[0.08] px-5 py-4 text-sm text-[#94A3B8]">{closedReason}</p>
      ) : (
        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-white/[0.08] p-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
            aria-label="Attach a photo"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-60"
            aria-label="Send a photo"
          >
            {uploading ? <LoaderCircle size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          </button>
          <label className="sr-only" htmlFor={`chat-${orderId}`}>
            Message
          </label>
          <textarea
            id={`chat-${orderId}`}
            rows={1}
            value={draft}
            maxLength={2000}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Write a message…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-[#090D16]/60 px-3.5 py-2.5 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#00A3FF]"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A3FF] text-[#090D16] disabled:opacity-50"
            aria-label="Send message"
          >
            {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      )}
    </section>
  );
}
