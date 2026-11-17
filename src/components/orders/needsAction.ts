import type { OrderListItem } from '@/types';

export type OrdersRole = 'customer' | 'tailor' | 'merchant';

const fabricHasArrivedToConfirm = (order: OrderListItem) =>
  (order.status === 'paid' || order.status === 'in_progress') && order.items.some((item) => item.fulfilment === 'shipped');

/** Whether an order is waiting on the person viewing it in this role. */
export function needsAction(order: OrderListItem, role: OrdersRole): boolean {
  switch (role) {
    case 'customer':
      return (
        order.status === 'quoted' ||
        order.status === 'delivered' ||
        (order.fabricDestination === 'customer' && fabricHasArrivedToConfirm(order))
      );
    case 'tailor':
      if (order.type === 'fabric') return fabricHasArrivedToConfirm(order);
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
  if (role === 'customer') {
    if (order.status === 'quoted') return order.type === 'fabric' ? 'Complete your payment' : 'Review the quote and pay';
    return order.type === 'fabric' ? 'Confirm fabric arrived' : 'Approve or raise an issue';
  }
  if (role === 'merchant') return `Ship fabric to the ${order.fabricDestination === 'customer' ? 'customer' : 'artisan'}`;
  if (order.type === 'fabric') return 'Confirm fabric arrived';
  if (order.status === 'requested') return 'Send a quote';
  if (order.status === 'paid') return 'Start work';
  return 'Confirm fabric arrived';
}

export const rolesFor = (userRole: string): OrdersRole[] => {
  if (userRole === 'tailor') return ['tailor', 'customer'];
  if (userRole === 'merchant') return ['merchant', 'customer'];
  return ['customer'];
};
