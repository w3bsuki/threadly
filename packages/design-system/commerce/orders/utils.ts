import type { Order, OrderStatus, PaymentStatus } from '../types';

// Order status flow
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

// Check if status transition is valid
export function canTransitionStatus(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const allowedStatuses = ORDER_STATUS_FLOW[currentStatus] || [];
  return allowedStatuses.includes(newStatus);
}

// Get order status color for UI
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'yellow',
    PROCESSING: 'blue',
    SHIPPED: 'indigo',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED: 'gray',
  };
  return colors[status] || 'gray';
}

// Get payment status color for UI
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'yellow',
    PROCESSING: 'blue',
    SUCCEEDED: 'green',
    FAILED: 'red',
    CANCELLED: 'gray',
    REFUNDED: 'orange',
  };
  return colors[status] || 'gray';
}

// Format order status for display
export function formatOrderStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };
  return labels[status] || status;
}

// Calculate order progress percentage
export function getOrderProgress(status: OrderStatus): number {
  const progress: Record<OrderStatus, number> = {
    PENDING: 20,
    PROCESSING: 40,
    SHIPPED: 70,
    DELIVERED: 100,
    CANCELLED: 0,
    REFUNDED: 0,
  };
  return progress[status] || 0;
}

// Group orders by status
export function groupOrdersByStatus(
  orders: Order[]
): Record<OrderStatus, Order[]> {
  return orders.reduce(
    (groups, order) => {
      const status = order.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(order);
      return groups;
    },
    {} as Record<OrderStatus, Order[]>
  );
}

// Filter orders by date range
export function filterOrdersByDateRange(
  orders: Order[],
  startDate: Date,
  endDate: Date
): Order[] {
  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

// Calculate order statistics
export function calculateOrderStats(orders: Order[]) {
  const total = orders.length;
  const revenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((sum, order) => sum + order.total, 0);

  const byStatus = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<OrderStatus, number>
  );

  const averageOrderValue = total > 0 ? revenue / total : 0;

  return {
    total,
    revenue,
    averageOrderValue,
    byStatus,
    completionRate: total > 0 ? ((byStatus.DELIVERED || 0) / total) * 100 : 0,
  };
}

// Format order ID for display
export function formatOrderId(orderId: string): string {
  // Take first and last 4 characters for a shorter display
  if (orderId.length <= 8) return orderId.toUpperCase();
  return `${orderId.slice(0, 4)}...${orderId.slice(-4)}`.toUpperCase();
}

// Check if order can be cancelled
export function canCancelOrder(order: Order): boolean {
  return (
    ['PENDING', 'PROCESSING'].includes(order.status) &&
    order.paymentStatus !== 'REFUNDED'
  );
}

// Check if order can be refunded
export function canRefundOrder(order: Order): boolean {
  return (
    order.status === 'DELIVERED' &&
    order.paymentStatus === 'SUCCEEDED' &&
    // Check if within refund window (e.g., 30 days)
    new Date().getTime() -
      new Date(order.deliveredAt || order.createdAt).getTime() <=
      30 * 24 * 60 * 60 * 1000
  );
}

// Generate tracking URL
export function generateTrackingUrl(
  carrier: string,
  trackingNumber: string
): string | null {
  const carriers: Record<string, string> = {
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };

  const carrierLower = carrier.toLowerCase();
  return carriers[carrierLower] || null;
}

// Sort orders
export function sortOrders(
  orders: Order[],
  sortBy: 'date' | 'total' | 'status' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Order[] {
  const sorted = [...orders].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'total':
        return a.total - b.total;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}
