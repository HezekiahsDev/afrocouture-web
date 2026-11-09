import api from './api';
import type {
  DaliAccount,
  DaliQuote,
  LogisticsDelivery,
  LogisticsStatus,
} from '@/types';

/** A stop as the API expects it (camelCase input, snake_case view). */
export interface DeliveryStopInput {
  lat: number;
  lng: number;
  label?: string;
  address: string;
  contactName: string;
  contactPhone: string;
}

export interface CreateDeliveryInput {
  pickup: DeliveryStopInput;
  dropoff: DeliveryStopInput;
  packageCount?: number;
  notes?: string;
}

/** The latest rider job for an order, or null if none has been booked. */
export async function getOrderDelivery(orderId: string): Promise<LogisticsDelivery | null> {
  return (await api.get<LogisticsDelivery | null>(`/orders/${orderId}/delivery`)).data || null;
}

/** Prices a route before the artisan books it. */
export async function quoteOrderDelivery(
  orderId: string,
  stops: Pick<CreateDeliveryInput, 'pickup' | 'dropoff'>,
): Promise<DaliQuote> {
  return (
    await api.post<DaliQuote>(`/orders/${orderId}/delivery/quote`, {
      pickup: { lat: stops.pickup.lat, lng: stops.pickup.lng },
      dropoff: { lat: stops.dropoff.lat, lng: stops.dropoff.lng },
    })
  ).data;
}

/** Books a Dali rider. The fee comes out of the prepaid Dali balance. */
export async function bookOrderDelivery(orderId: string, input: CreateDeliveryInput): Promise<LogisticsDelivery> {
  return (await api.post<LogisticsDelivery>(`/orders/${orderId}/delivery`, input)).data;
}

export async function cancelOrderDelivery(orderId: string, reason?: string): Promise<LogisticsDelivery> {
  return (await api.post<LogisticsDelivery>(`/orders/${orderId}/delivery/cancel`, { reason })).data;
}

// ── Admin ──

export interface AdminDeliveryRow extends LogisticsDelivery {
  order: {
    id: string;
    reference: string;
    status: string;
    garmentType: string;
    customerName: string | null;
  } | null;
}

export async function getDaliAccount(): Promise<DaliAccount> {
  return (await api.get<DaliAccount>('/admin/logistics/account')).data;
}

export async function listDeliveries(
  params: { status?: LogisticsStatus; page?: number; limit?: number } = {},
): Promise<{ items: AdminDeliveryRow[]; total: number; page: number; limit: number }> {
  return (await api.get('/admin/logistics', { params })).data;
}

export async function testDaliWebhook(): Promise<{ delivered?: boolean } | null> {
  return (await api.post('/admin/logistics/webhooks/test')).data;
}

export async function simulateDelivery(deliveryId: string, status: LogisticsStatus): Promise<LogisticsDelivery> {
  return (await api.post<LogisticsDelivery>(`/admin/logistics/${deliveryId}/simulate`, { status })).data;
}

// ── Display helpers ──

export const LOGISTICS_STATUS_LABEL: Record<LogisticsStatus, string> = {
  pending: 'Looking for a rider',
  assigned: 'Rider assigned',
  picked_up: 'Picked up',
  in_transit: 'On the way',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Delivery failed',
  disputed: 'Under review',
};

/** The happy-path order of a rider job, for the status timeline. */
export const LOGISTICS_PROGRESS: LogisticsStatus[] = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed'];

const TERMINAL: LogisticsStatus[] = ['delivered', 'completed', 'cancelled', 'failed', 'disputed'];

export const isDeliveryActive = (status: LogisticsStatus): boolean => !TERMINAL.includes(status);
