// Admin dashboard API shapes (IPILE-api src/admin, docs/rbac.md).
import type { ChatMessage, Fabric, KycStatus, Order, OrderStatus, UserRole } from './index';

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminOverview {
  users: { total: number; byRole: Record<UserRole, number>; newLast7d: number; suspended: number };
  orders: {
    total: number;
    byStatus: Record<OrderStatus, number>;
    /** 30 days, oldest first: orders created and GMV paid per Lagos day. */
    last30d: { date: string; count: number; gmv: number }[];
  };
  money: {
    gmv: number;
    platformFees: number;
    escrowHeld: number;
    refunded: number;
    failedPayouts: { count: number; amount: number };
  };
  queues: { pendingVerifications: number; openDisputes: number; failedPayouts: number; hiddenReviews: number };
  reviews: { count: number; average: number | null; last7d: number };
  recentActivity: { id: string; orderId: string; reference: string; type: string; label: string; createdAt: string }[];
}

export type UserStatus = 'active' | 'suspended' | string;

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  orderCount: number;
}

export interface AdminUserDetail {
  user: AdminUserRow & { updatedAt: string; suspendedAt?: string | null; suspensionReason?: string | null };
  tailorProfile: {
    id: string;
    displayName: string | null;
    atelierName: string | null;
    city: string | null;
    kycStatus: KycStatus;
    rating: number | null;
    reviewCount: number;
  } | null;
  merchantProfile: { id: string; businessName: string | null; city: string | null; verificationStatus: KycStatus } | null;
  stats: { ordersAsCustomer: number; ordersAsTailor: number; spent: number; earned: number };
  recentOrders: {
    id: string;
    reference: string;
    status: OrderStatus;
    garmentType: string;
    totalAmount: number;
    createdAt: string;
    as: 'customer' | 'tailor';
  }[];
}

/** GET /admin/orders rows: the order plus who is on it and its escrow summary. */
export type AdminOrderRow = Order;

export interface AdminFabric extends Omit<Fabric, 'merchant'> {
  stock: number | null;
  isPublished: boolean;
  /** Set while an admin has unpublished it; the merchant can't republish until an admin does. */
  moderatedAt: string | null;
  unpublishedReason: string | null;
  createdAt: string;
  updatedAt: string;
  merchant: { id: string; businessName: string | null; verificationStatus: KycStatus };
}

export interface AdminReview {
  id: string;
  reference: string;
  customerId: string;
  tailorId: string;
  garmentType: string;
  rating: number;
  review: string | null;
  reviewedAt: string;
  reviewReply: string | null;
  reviewHiddenAt: string | null;
  tailor: { id: string; displayName: string | null; atelierName: string | null } | null;
  customer: { id: string; fullName: string | null };
}

export interface AuditEntry {
  id: string;
  admin: { id: string; fullName: string | null; email: string } | null;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export type AdminChatMessage = ChatMessage;
