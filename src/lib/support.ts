/**
 * How people reach AfroCouture support: WhatsApp for now (no support inbox yet).
 * NEXT_PUBLIC_SUPPORT_WHATSAPP is the number in international format, digits only (e.g. 2348106681869);
 * NEXT_PUBLIC_SUPPORT_WHATSAPP_GROUP is an optional community group invite link.
 */
const number = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '2348106681869').replace(/\D/g, '');
const group = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_GROUP?.trim() ?? '';

/** "+234 810 668 1869" for Nigerian numbers, "+<digits>" otherwise. */
function display(digits: string): string {
  const ng = /^234(\d{3})(\d{3})(\d{4})$/.exec(digits);
  return ng ? `+234 ${ng[1]} ${ng[2]} ${ng[3]}` : `+${digits}`;
}

export const SUPPORT = {
  /** wa.me chat link, or null when no number is configured. */
  whatsappUrl: number ? `https://wa.me/${number}` : null,
  whatsappDisplay: number ? display(number) : null,
  /** Community group invite, or null until one is configured. */
  groupUrl: /^https:\/\//.test(group) ? group : null,
} as const;
