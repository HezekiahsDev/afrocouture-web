// AfroCouture AI — Shared Domain Types for Web

export type UserRole = 'customer' | 'tailor' | 'merchant' | 'admin';
export type OrderStatus = 'pending' | 'cutting' | 'fitting' | 'completed' | 'disputed';
export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type MeasurementUnit = 'in' | 'cm';
export type EscrowStatus = 'held' | 'released' | 'disputed' | 'refunded';
export type DrapeSilhouette = 'slim_modern' | 'classic_regal' | 'relaxed_casual';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
  fullName?: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt: string;
}

export interface MeasurementProfile {
  id?: string;
  userId?: string;
  chest: number;
  shoulderWidth: number;
  sleeveLength: number;
  kaftanLength: number;
  waist: number;
  neck: number;
  drapeSilhouette: DrapeSilhouette;
  unit: MeasurementUnit;
  deliveryAddress?: Record<string, unknown>;
  updatedAt?: string;
}

export interface OrderMilestone {
  stage: number;
  label: string;
  completedAt?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  fabricId?: string;
  itemType: string;
  description: string;
  yards: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  tailorId: string;
  status: OrderStatus;
  currentMilestone: number;
  totalAmount: number;
  escrowAmount: number;
  deliveryAddress: Record<string, unknown>;
  estimatedDelivery?: string;
  items?: OrderItem[];
  milestones?: OrderMilestone[];
  createdAt: string;
}

export interface FabricPricingTier {
  id: string;
  minYards: number;
  maxYards?: number;
  pricePerYard: number;
}

export interface Fabric {
  id: string;
  merchantId: string;
  name: string;
  type: string;
  origin: string;
  basePricePerYard: number;
  stockYards: number;
  images: string[];
  tags: string[];
  isPublished: boolean;
  pricingTiers?: FabricPricingTier[];
  createdAt: string;
}

export interface TailorProfile {
  id: string;
  userId: string;
  fullName: string;
  atelierName: string;
  workshopAddress: string;
  yearsExperience: number;
  guildId?: string;
  guildMembershipId?: string;
  kycStatus: KycStatus;
  kycStep: number;
  rating?: number;
  specialties?: string[];
  avatarUrl?: string;
  city?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'voice' | 'system';
  attachmentUrl?: string;
  isSystemMessage: boolean;
  sentAt: string;
}

export interface AIDesign {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  variations?: Array<{ id: string; url: string; label: string }>;
  feasibilityScore?: number;
  isSaved: boolean;
  createdAt: string;
}

