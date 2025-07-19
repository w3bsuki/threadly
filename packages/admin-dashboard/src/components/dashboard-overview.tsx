import React from 'react';
import { MetricsCards } from './metrics-cards';
import type { DashboardMetrics, SystemHealth as SystemHealthType } from '../types';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  systemHealth: SystemHealthType;
  onRefresh?: () => void;
  loading?: boolean;
}

export function DashboardOverview({ 
  metrics, 
  systemHealth, 
  onRefresh,
  loading = false 
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and management tools
        </p>
      </div>

      <MetricsCards metrics={metrics} loading={loading} />
      
      <div className="text-center py-8 text-muted-foreground">
        <p>Additional dashboard widgets coming soon...</p>
      </div>
    </div>
  );
}