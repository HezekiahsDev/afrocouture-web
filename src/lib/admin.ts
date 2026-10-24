import api from './api';
import type {
  AdminChatMessage,
  AdminFabric,
  AdminOrderRow,
  AdminOverview,
  AdminReview,
  AdminUserDetail,
  AdminUserRow,
  AuditEntry,
  Paged,
} from '@/types/admin';
import type { OrderStatus, UserRole } from '@/types';

// Verification queue, order detail, dispute resolution and payout retries live in lib/orders.ts.

export async function getOverview(): Promise<AdminOverview> {
  return (await api.get<AdminOverview>('/admin/overview')).data;
}

export async function listUsers(params: { q?: string; role?: UserRole; status?: string; page?: number; limit?: number }) {
  return (await api.get<Paged<AdminUserRow>>('/admin/users', { params })).data;
}

export async function getUser(id: string): Promise<AdminUserDetail> {
  return (await api.get<AdminUserDetail>(`/admin/users/${id}`)).data;
}

export async function suspendUser(id: string, reason: string): Promise<AdminUserRow> {
  return (await api.post<AdminUserRow>(`/admin/users/${id}/suspend`, { reason })).data;
}

export async function reactivateUser(id: string): Promise<AdminUserRow> {
  return (await api.post<AdminUserRow>(`/admin/users/${id}/reactivate`)).data;
}

export async function searchOrders(params: { status?: OrderStatus[]; q?: string; page?: number; limit?: number }) {
  const query = { ...params, status: params.status?.length ? params.status.join(',') : undefined };
  return (await api.get<Paged<AdminOrderRow>>('/admin/orders', { params: query })).data;
}

export async function getOrderMessages(orderId: string, before?: string): Promise<AdminChatMessage[]> {
  return (await api.get<AdminChatMessage[]>(`/admin/orders/${orderId}/messages`, { params: { before, limit: 100 } })).data;
}

export async function listFabrics(params: { q?: string; published?: boolean; page?: number; limit?: number }) {
  return (await api.get<Paged<AdminFabric>>('/admin/fabrics', { params })).data;
}

export async function setFabricPublished(id: string, isPublished: boolean, note?: string): Promise<AdminFabric> {
  return (await api.patch<AdminFabric>(`/admin/fabrics/${id}`, { isPublished, note })).data;
}

export async function listReviews(params: { before?: string; limit?: number } = {}) {
  return (await api.get<{ items: AdminReview[]; hasMore: boolean }>('/admin/reviews', { params })).data;
}

export async function setReviewHidden(orderId: string, hidden: boolean) {
  return (await api.patch<{ id: string; reviewHiddenAt: string | null }>(`/admin/reviews/${orderId}`, { hidden })).data;
}

export async function listAudit(params: { action?: string; targetType?: string; targetId?: string; before?: string; limit?: number }) {
  return (await api.get<{ items: AuditEntry[]; hasMore: boolean }>('/admin/audit', { params })).data;
}
