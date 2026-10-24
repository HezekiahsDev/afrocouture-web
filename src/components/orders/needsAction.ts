import type { OrderListItem } from '@/types';

export type OrdersRole = 'customer' | 'tailor' | 'merchant';

/** Whether an order is waiting on the person viewing it in this role. */
export function needsAction(order: OrderListItem, role: OrdersRole): boolean {
  switch (role) {
    case 'customer':
      return order.status === 'quoted' || order.status === 'delivered';
    case 'tailor':
      return (
        order.status === 'requested' ||
        order.status === 'paid' ||
        (order.status === 'in_progress' && order.items.some((item) => item.fulfilment === 'shipped'))
      );
    case 'merchant':
      return (
        (order.status === 'paid' || order.status === 'in_progress') &&
        order.items.some((item) => item.fulfilment === 'pending')
      );
  }
}

/** What the person should do next, in a few words. */
export function nextStep(order: OrderListItem, role: OrdersRole): string | null {
  if (!needsAction(order, role)) return null;
  if (role === 'customer') return order.status === 'quoted' ? 'Review the quote and pay' : 'Approve or raise an issue';
  if (role === 'merchant') return 'Ship fabric to the artisan';
  if (order.status === 'requested') return 'Send a quote';
  if (order.status === 'paid') return 'Start work';
  return 'Confirm fabric arrived';
}

export const rolesFor = (userRole: string): OrdersRole[] => {
  if (userRole === 'tailor') return ['tailor', 'customer'];
  if (userRole === 'merchant') return ['merchant', 'customer'];
  return ['customer'];
};
