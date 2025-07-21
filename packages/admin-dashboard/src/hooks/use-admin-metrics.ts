import { useState, useEffect } from 'react';

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Mock implementation - replace with actual API call
        setMetrics({
          totalUsers: 1250,
          activeUsers: 340,
          totalOrders: 890,
          revenue: 45670,
          conversionRate: 3.2,
          avgOrderValue: 67.50,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, isLoading, error };
}