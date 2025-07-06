import type { Order, OrderStatus, OrderItem } from '../types';

// Order query parameters
export interface OrderQueryParams {
  userId?: string;
  sellerId?: string;
  status?: OrderStatus | OrderStatus[];
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Order API response
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Fetch user orders
export async function fetchUserOrders(
  params: OrderQueryParams = {}
): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    statuses.forEach(s => queryParams.append('status', s));
  }
  
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
  if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`/api/orders?${queryParams}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
}

// Fetch seller orders
export async function fetchSellerOrders(
  params: OrderQueryParams = {}
): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  
  // Similar to fetchUserOrders but for seller-specific endpoint
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    statuses.forEach(s => queryParams.append('status', s));
  }
  
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
  if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`/api/seller/orders?${queryParams}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch seller orders');
  }

  return response.json();
}

// Fetch single order
export async function fetchOrder(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }

  return response.json();
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status, trackingNumber }),
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }

  return response.json();
}

// Cancel order
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }

  return response.json();
}

// Request refund
export async function requestRefund(
  orderId: string,
  reason: string,
  items?: string[] // Item IDs to refund, or all if not specified
): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason, items }),
  });

  if (!response.ok) {
    throw new Error('Failed to request refund');
  }

  return response.json();
}

// Mark order as shipped
export async function markOrderShipped(
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ trackingNumber, carrier }),
  });

  if (!response.ok) {
    throw new Error('Failed to mark order as shipped');
  }

  return response.json();
}

// Mark order as delivered
export async function markOrderDelivered(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}/deliver`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to mark order as delivered');
  }

  return response.json();
}

// Get order statistics
export async function fetchOrderStats(
  type: 'buyer' | 'seller' = 'buyer'
): Promise<{
  total: number;
  revenue: number;
  averageOrderValue: number;
  byStatus: Record<OrderStatus, number>;
  recentOrders: Order[];
}> {
  const endpoint = type === 'seller' ? '/api/seller/orders/stats' : '/api/orders/stats';
  
  const response = await fetch(endpoint, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order statistics');
  }

  return response.json();
}