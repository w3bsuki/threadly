'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus } from '../types';
import type { OrderQueryParams, OrdersResponse } from './queries';
import {
  fetchUserOrders,
  fetchSellerOrders,
  fetchOrder,
  updateOrderStatus,
  cancelOrder,
  markOrderShipped,
  markOrderDelivered,
} from './queries';

// Hook for managing orders list
export function useOrders(
  type: 'buyer' | 'seller' = 'buyer',
  initialParams?: OrderQueryParams
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false,
    total: 0,
  });

  const fetchOrders = useCallback(async (params?: OrderQueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const fetchFn = type === 'seller' ? fetchSellerOrders : fetchUserOrders;
      const response = await fetchFn({ ...initialParams, ...params });
      
      setOrders(response.orders);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [type, initialParams]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh orders
  const refresh = useCallback(() => {
    return fetchOrders({ page: pagination.page });
  }, [fetchOrders, pagination.page]);

  // Load more for infinite scroll
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    setLoading(true);
    try {
      const fetchFn = type === 'seller' ? fetchSellerOrders : fetchUserOrders;
      const response = await fetchFn({ 
        ...initialParams, 
        page: pagination.page + 1 
      });
      
      setOrders(prev => [...prev, ...response.orders]);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more orders');
    } finally {
      setLoading(false);
    }
  }, [type, initialParams, pagination, loading]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    refresh,
    loadMore,
  };
}

// Hook for single order management
export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = await fetchOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Update status
  const updateStatus = useCallback(async (
    status: OrderStatus,
    trackingNumber?: string
  ) => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await updateOrderStatus(orderId, status, trackingNumber);
      setOrder(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Cancel order
  const cancel = useCallback(async (reason?: string) => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await cancelOrder(orderId, reason);
      setOrder(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Ship order (seller action)
  const ship = useCallback(async (trackingNumber: string, carrier: string) => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await markOrderShipped(orderId, trackingNumber, carrier);
      setOrder(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as shipped');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Deliver order (seller/system action)
  const deliver = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await markOrderDelivered(orderId);
      setOrder(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as delivered');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return {
    order,
    loading,
    error,
    refresh: fetchOrderDetails,
    updateStatus,
    cancel,
    ship,
    deliver,
  };
}

// Hook for order statistics
export function useOrderStats(type: 'buyer' | 'seller' = 'buyer') {
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
    averageOrderValue: 0,
    byStatus: {} as Record<OrderStatus, number>,
    recentOrders: [] as Order[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = type === 'seller' 
          ? '/api/seller/orders/stats' 
          : '/api/orders/stats';
        
        const response = await fetch(endpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [type]);

  return { stats, loading, error };
}