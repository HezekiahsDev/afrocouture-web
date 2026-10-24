import api from './api';
import type {
  ChatMessage,
  EscrowQueueItem,
  Fabric,
  KycStatus,
  MerchantOrderView,
  MerchantProfile,
  Order,
  OrderListItem,
  OrderMilestone,
  OrderStatus,
  PriceTier,
  TailorProfile,
  TailorReviewPage,
} from '@/types';

// ── Commissions ──

export interface CreateOrderInput {
  tailorId: string;
  garmentType: string;
  brief: string;
  styleId?: string;
  aiDesignId?: string;
  referenceImageUrls?: string[];
  desiredDate?: string;
  fabrics?: { fabricId: string; quantity: number }[];
  useSavedFabrics?: boolean;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return (await api.post<Order>('/orders', input)).data;
}

export async function listOrders(
  params: { role?: 'customer' | 'tailor' | 'merchant'; status?: OrderStatus[] } = {},
): Promise<OrderListItem[]> {
  const query = { role: params.role, status: params.status?.join(',') || undefined };
  return (await api.get<OrderListItem[]>('/orders', { params: query })).data;
}

export async function getOrder(id: string): Promise<Order | MerchantOrderView> {
  return (await api.get<Order | MerchantOrderView>(`/orders/${id}`)).data;
}

const action = async <T = Order>(id: string, path: string, body: object = {}) =>
  (await api.post<T>(`/orders/${id}/${path}`, body)).data;

export const quoteOrder = (
  id: string,
  quote: { workmanshipPrice: number; deliveryFee: number; estimatedDeliveryDate: string; note?: string },
) => action(id, 'quote', quote);
export const declineOrder = (id: string, reason: string) => action(id, 'decline', { reason });
export const cancelOrder = (id: string) => action(id, 'cancel');
export const advanceMilestone = (id: string, milestone: Exclude<OrderMilestone, 'placed'>, note?: string) =>
  action(id, 'milestone', { milestone, note });
export const markDelivered = (id: string, note?: string) => action(id, 'deliver', { note });
export const approveOrder = (id: string, rating: number, review?: string) => action(id, 'approve', { rating, review });
export const disputeOrder = (id: string, reason: string) => action(id, 'dispute', { reason });
/** Rate an order that completed without a review (e.g. automatically). */
export const reviewOrder = (id: string, rating: number, review?: string) => action(id, 'review', { rating, review });
export const replyToReview = (id: string, reply: string) => action(id, 'review/reply', { reply });

export async function getTailorReviews(tailorId: string, params: { before?: string; limit?: number } = {}): Promise<TailorReviewPage> {
  return (await api.get<TailorReviewPage>(`/tailors/${tailorId}/reviews`, { params })).data;
}
export const shipItem = (id: string, itemId: string, note?: string) => action(id, `items/${itemId}/ship`, { note });
export const receiveItem = (id: string, itemId: string) => action(id, `items/${itemId}/receive`);

/** Starts a Paystack checkout; send the browser to `authorizationUrl`. */
export const startPayment = (id: string) => action<{ authorizationUrl: string; reference: string }>(id, 'pay');
/** Called from the Paystack callback page with the `reference` query param. */
export const verifyPayment = (id: string, reference: string) => action(id, 'verify-payment', { reference });

// ── Chat ──

export async function getMessages(orderId: string, before?: string, limit = 50): Promise<ChatMessage[]> {
  return (await api.get<ChatMessage[]>(`/orders/${orderId}/messages`, { params: { before, limit } })).data;
}

export async function sendMessage(orderId: string, content: string, attachmentUrl?: string): Promise<ChatMessage> {
  return (await api.post<ChatMessage>(`/orders/${orderId}/messages`, { content, attachmentUrl })).data;
}

// ── Merchant fabric listings ──

export interface FabricInput {
  name: string;
  category: string;
  origin?: string;
  description?: string;
  tags?: string[];
  price: number;
  unit?: 'yard' | 'bundle';
  priceTiers?: PriceTier[];
  stock?: number;
  imageUrl: string;
  isPublished?: boolean;
}

/** A merchant's own listing (raw entity, includes unpublished ones). */
export type MyFabric = Omit<Fabric, 'merchant'> & { merchantId: string; stock: number | null; isPublished: boolean };

export async function listMyFabrics(): Promise<MyFabric[]> {
  return (await api.get<MyFabric[]>('/fabrics/mine')).data;
}
export async function createFabric(input: FabricInput): Promise<MyFabric> {
  return (await api.post<MyFabric>('/fabrics', input)).data;
}
export async function updateFabric(id: string, input: Partial<FabricInput>): Promise<MyFabric> {
  return (await api.patch<MyFabric>(`/fabrics/${id}`, input)).data;
}
export async function deleteFabric(id: string): Promise<void> {
  await api.delete(`/fabrics/${id}`);
}

// ── Admin ──

export async function getVerificationQueue(
  status: KycStatus = 'pending',
): Promise<{ tailors: TailorProfile[]; merchants: MerchantProfile[] }> {
  return (await api.get('/admin/verifications', { params: { status } })).data;
}
export async function reviewTailor(id: string, decision: 'approve' | 'reject', note?: string): Promise<TailorProfile> {
  return (await api.patch<TailorProfile>(`/admin/tailors/${id}/review`, { decision, note })).data;
}
export async function reviewMerchant(id: string, decision: 'approve' | 'reject', note?: string): Promise<MerchantProfile> {
  return (await api.patch<MerchantProfile>(`/admin/merchants/${id}/review`, { decision, note })).data;
}
export async function getAdminOrder(id: string): Promise<Order> {
  return (await api.get<Order>(`/admin/orders/${id}`)).data;
}
export async function resolveDispute(
  id: string,
  input: { outcome: 'release' | 'refund'; refundAmount?: number; note: string },
): Promise<Order> {
  return (await api.post<Order>(`/admin/orders/${id}/resolve`, input)).data;
}
export async function getEscrowQueue(status: 'failed' | 'pending' = 'failed'): Promise<EscrowQueueItem[]> {
  return (await api.get<EscrowQueueItem[]>('/admin/escrow', { params: { status } })).data;
}
export async function retryPayout(transactionId: string): Promise<unknown> {
  return (await api.post(`/admin/escrow/${transactionId}/retry`)).data;
}

// ── Display helpers ──

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  requested: 'Awaiting quote',
  quoted: 'Quote ready',
  declined: 'Declined',
  cancelled: 'Cancelled',
  paid: 'Paid · in escrow',
  in_progress: 'In production',
  delivered: 'Delivered',
  completed: 'Completed',
  disputed: 'In dispute',
  refunded: 'Refunded',
};

export const MILESTONES: { id: OrderMilestone; label: string }[] = [
  { id: 'placed', label: 'Order placed' },
  { id: 'cutting', label: 'Cutting & sizing' },
  { id: 'fitting', label: 'Fitting' },
  { id: 'delivery', label: 'Handover & delivery' },
];

export const isMerchantView = (order: Order | MerchantOrderView): order is MerchantOrderView =>
  order.viewerRole === 'merchant';
