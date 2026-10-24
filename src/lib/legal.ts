/** Operator details shown on the Privacy Policy and Terms of Service. */
export const LEGAL = {
  operator: 'AfroCouture',
  brand: 'AfroCouture AI',
  contactEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@afrocouture.ai',
  country: 'Nigeria',
  lastUpdated: '24 October 2026',
  /** Days after delivery before an order completes on its own (AUTO_APPROVE_DAYS on the API). */
  autoApproveDays: 7,
  /** Days after completion a customer can still review an order. */
  reviewWindowDays: 60,
  /** Read notifications are deleted after this many days. */
  notificationRetentionDays: 90,
  /** Database backups are kept for about this many days. */
  backupRetentionDays: 14,
} as const;
