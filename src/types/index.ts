// IPILE — Shared Domain Types for Web (mirrors IPILE-api responses)

export type UserRole = 'customer' | 'tailor' | 'merchant' | 'admin';
export type SelfServiceRole = Exclude<UserRole, 'admin'>;
export type KycStatus = 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected';
export type MeasurementUnit = 'in' | 'cm';
export type DrapeSilhouette = 'slim_modern' | 'classic_regal' | 'relaxed_casual';
export type SourcingType = 'direct_mill' | 'importer';
export type FabricUnit = 'yard' | 'bundle';
export type SavedItemType = 'tailor' | 'fabric';
export type UploadPurpose = 'tailor-kyc' | 'tailor-portfolio' | 'merchant-verification' | 'fit-photo' | 'fabric' | 'chat';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  /** Null until they choose how they'll use IPILE (shop, make or sell). */
  pathChosenAt?: string | null;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Artisan as shown in the public directory. */
export interface Tailor {
  id: string;
  displayName: string | null;
  atelierName: string | null;
  city: string | null;
  craft: string | null;
  bio: string | null;
  yearsExperience: number | null;
  specialtyTags: string[];
  startingPrice: number | null;
  portraitUrl: string | null;
  coverImageUrl: string | null;
  portfolioUrls: string[];
  rating: number | null;
  reviewCount: number;
  verified: boolean;
  isSample: boolean;
}

/** The signed-in artisan's own profile, including private KYC fields. */
export interface TailorProfile extends Omit<Tailor, 'verified' | 'rating'> {
  userId: string;
  rating: string | null;
  legalName: string | null;
  workshopAddress: string | null;
  idType: string | null;
  idDocumentUrl: string | null;
  workshopPhotoUrl: string | null;
  guildChapter: string | null;
  guildMembershipId: string | null;
  bankName: string | null;
  /** Paystack bank code (from GET /payments/banks). */
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  kycStatus: KycStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface MerchantProfile {
  id: string;
  userId: string;
  businessName: string | null;
  city: string | null;
  marketHub: string | null;
  sourcingType: SourcingType | null;
  specialtyFabrics: string[];
  cacNumber: string | null;
  cacCertificateUrl: string | null;
  warehousePhotoUrl: string | null;
  qualityDeclarationAccepted: boolean;
  bankName: string | null;
  /** Paystack bank code (from GET /payments/banks). */
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  verificationStatus: KycStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface Fabric {
  id: string;
  name: string;
  category: string;
  origin: string | null;
  description: string | null;
  tags: string[];
  price: number;
  unit: FabricUnit;
  /** Wholesale price breaks, ascending by minQuantity. Empty = flat price. */
  priceTiers: PriceTier[];
  imageUrl: string;
  isSample: boolean;
  merchant: { id: string; businessName: string | null; city: string | null; verified: boolean };
}

export interface Style {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  startingPrice: number | null;
  sortOrder: number;
  isSample: boolean;
}

export interface SavedItem {
  id: string;
  itemType: SavedItemType;
  itemId: string;
  quantity: number | null;
  createdAt: string;
}

export interface DeliveryAddress {
  line1: string;
  city: string;
  state: string;
  landmark?: string;
  phone?: string;
}

export interface FitProfile {
  id: string;
  chest: number | null;
  shoulderWidth: number | null;
  sleeveLength: number | null;
  kaftanLength: number | null;
  waist: number | null;
  neck: number | null;
  drapeSilhouette: DrapeSilhouette;
  unit: MeasurementUnit;
  frontPhotoUrl: string | null;
  sidePhotoUrl: string | null;
  deliveryAddress: DeliveryAddress | null;
  updatedAt: string;
}

export interface UploadedAsset {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  resourceType: string;
  originalName: string;
}

/** Shape of a 400 from POST …/submit when required fields are missing. */
export interface MissingFieldsError {
  message: string;
  missing: string[];
}

// ── Orders, escrow & chat (Phase 4) ──

export type OrderStatus =
  | 'requested'
  | 'quoted'
  | 'declined'
  | 'cancelled'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'refunded';
export type OrderMilestone = 'placed' | 'cutting' | 'fitting' | 'delivery';
export type FabricFulfilment = 'pending' | 'shipped' | 'received';
export type OrderViewerRole = 'customer' | 'tailor' | 'merchant' | 'admin';

export interface PriceTier {
  minQuantity: number;
  price: number;
}

export interface TailorSummary {
  id: string;
  displayName: string | null;
  atelierName: string | null;
  portraitUrl: string | null;
  city: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  fabricId: string;
  merchantId: string;
  fabricName: string;
  imageUrl: string;
  unit: FabricUnit;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  fulfilment: FabricFulfilment;
  shippingNote: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type: string;
  label: string;
  actorUserId: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface EscrowSummary {
  held: number;
  released: number;
  refunded: number;
  balance: number;
}

export interface FitSnapshot {
  chest: number | null;
  shoulderWidth: number | null;
  sleeveLength: number | null;
  kaftanLength: number | null;
  waist: number | null;
  neck: number | null;
  drapeSilhouette: string;
  unit: string;
  frontPhotoUrl: string | null;
  sidePhotoUrl: string | null;
}

/** Row in GET /orders. Customers/tailors get totals; merchants get only their lines and merchantTotal. */
export interface OrderListItem {
  id: string;
  reference: string;
  status: OrderStatus;
  milestone: OrderMilestone;
  garmentType: string;
  referenceImageUrls: string[];
  estimatedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  tailor: TailorSummary | null;
  customer: { id: string; fullName: string | null };
  items: OrderItem[];
  totalAmount?: number;
  fabricTotal?: number;
  merchantTotal?: number;
}

/** GET /orders/:id for the customer, tailor or admin. */
export interface Order {
  viewerRole: Exclude<OrderViewerRole, 'merchant'>;
  id: string;
  reference: string;
  customerId: string;
  tailorId: string;
  tailorUserId: string;
  status: OrderStatus;
  milestone: OrderMilestone;
  garmentType: string;
  brief: string;
  styleId: string | null;
  aiDesignId: string | null;
  referenceImageUrls: string[];
  fitSnapshot: FitSnapshot;
  deliveryAddress: DeliveryAddress;
  desiredDate: string | null;
  workmanshipPrice: number | null;
  deliveryFee: number | null;
  estimatedDeliveryDate: string | null;
  quoteNote: string | null;
  quotedAt: string | null;
  declineReason: string | null;
  fabricTotal: number;
  platformFee: number;
  totalAmount: number;
  paystackReference: string | null;
  paidAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  disputeReason: string | null;
  disputedAt: string | null;
  resolutionNote: string | null;
  rating: number | null;
  review: string | null;
  reviewedAt: string | null;
  /** The artisan's public reply (set once). */
  reviewReply: string | null;
  reviewRepliedAt: string | null;
  /** Set when an admin hid the review from the artisan's profile. */
  reviewHiddenAt: string | null;
  items: OrderItem[];
  tailor: TailorSummary | null;
  customer: { id: string; fullName: string | null };
  events: OrderEvent[];
  escrow: EscrowSummary;
  createdAt: string;
  updatedAt: string;
  /** Admin only. */
  escrowTransactions?: EscrowTransaction[];
}

/** GET /orders/:id for a merchant — only their fabric lines and where to ship them. */
export interface MerchantOrderView {
  viewerRole: 'merchant';
  id: string;
  reference: string;
  status: OrderStatus;
  milestone: OrderMilestone;
  garmentType: string;
  paidAt: string | null;
  createdAt: string;
  tailor: TailorSummary | null;
  items: OrderItem[];
  merchantTotal: number;
  shipTo: { name: string | null; address: string | null; city: string | null } | null;
  events: OrderEvent[];
}

export type EscrowTransactionType = 'hold' | 'release_tailor' | 'release_merchant' | 'refund';
export type EscrowTransactionStatus = 'pending' | 'success' | 'failed' | 'reversed';

export interface EscrowTransaction {
  id: string;
  orderId: string;
  type: EscrowTransactionType;
  status: EscrowTransactionStatus;
  amount: number;
  partyType: 'customer' | 'tailor' | 'merchant';
  partyId: string;
  reference: string;
  providerCode: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /admin/escrow rows. */
export interface EscrowQueueItem extends EscrowTransaction {
  order: { id: string; reference: string; status: OrderStatus } | null;
  payee: {
    name: string | null;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    payoutReady: boolean;
  };
}

export type ChatMessageType = 'text' | 'image' | 'system';

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string | null;
  type: ChatMessageType;
  content: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface Bank {
  name: string;
  code: string;
}

// ── AI Design Studio (Phase 5) ──

export interface AiDesign {
  id: string;
  userId: string;
  prompt: string;
  options: { garmentType?: string; occasion?: string; fabric?: string; colour?: string };
  imageUrls: string[];
  selectedIndex: number;
  model: string;
  aspectRatio: '3:4' | '1:1' | '9:16';
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiQuota {
  used: number;
  limit: number;
  resetsAt: string;
}

/** A public review on an artisan's profile (GET /tailors/:id/reviews). */
export interface TailorReview {
  /** The order id. */
  id: string;
  rating: number;
  review: string | null;
  garmentType: string;
  /** First name and last initial. */
  reviewerName: string;
  reviewedAt: string;
  reply: string | null;
  repliedAt: string | null;
}

export interface TailorReviewPage {
  rating: number | null;
  reviewCount: number;
  /** Count of visible reviews per star (keys 1–5). */
  breakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
  items: TailorReview[];
  hasMore: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  /** In-app path, e.g. "/orders/<id>". */
  link: string | null;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  hasMore: boolean;
  unreadCount: number;
}
