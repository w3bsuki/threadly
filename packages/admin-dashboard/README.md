# @repo/admin-dashboard

Admin dashboard components for content moderation and platform management in Threadly's C2C fashion marketplace. This package provides comprehensive administrative tools for monitoring users, products, orders, and platform health.

## Overview

The admin dashboard package provides essential administrative functionality for managing the Threadly marketplace:

- **Dashboard Overview**: Key metrics and platform health monitoring
- **User Management**: Track user activity, growth, and moderation
- **Product Management**: Monitor product listings and categories
- **Order Management**: Track sales, revenue, and order processing
- **Content Moderation**: Review reported content and handle violations
- **System Health**: Monitor platform performance and infrastructure
- **Feature Flags**: Control feature rollouts and A/B testing
- **Analytics**: Deep insights into platform usage and performance

## Installation

```bash
pnpm add @repo/admin-dashboard
```

## Dependencies

This package depends on:
- `@repo/analytics` - Analytics and tracking
- `@repo/auth` - Authentication and permissions
- `@repo/database` - Database operations
- `@repo/design-system` - UI components and styles
- `react` - React framework
- `react-dom` - React DOM utilities
- `recharts` - Chart components
- `date-fns` - Date manipulation
- `clsx` - Conditional class names
- `lucide-react` - Icons
- `zod` - Type validation

## API Reference

### Components

```typescript
import { 
  DashboardOverview, 
  MetricsCards, 
  FeatureFlags 
} from '@repo/admin-dashboard/components';

// Main dashboard overview
<DashboardOverview
  metrics={dashboardMetrics}
  systemHealth={systemHealth}
  onRefresh={handleRefresh}
  loading={isLoading}
/>

// Metrics cards display
<MetricsCards
  metrics={dashboardMetrics}
  loading={isLoading}
/>

// Feature flags management
<FeatureFlags
  flags={featureFlags}
  onToggle={handleToggleFlag}
  onUpdate={handleUpdateFlag}
/>
```

### Hooks

```typescript
import { 
  useAdminMetrics, 
  useFeatureFlags 
} from '@repo/admin-dashboard/hooks';

// Get platform metrics
const { 
  metrics, 
  isLoading, 
  error, 
  refresh 
} = useAdminMetrics({
  timeframe: '30d',
  includeCharts: true
});

// Manage feature flags
const { 
  flags, 
  toggleFlag, 
  updateFlag, 
  isUpdating 
} = useFeatureFlags();
```

### Utilities

```typescript
import { 
  formatMetricValue, 
  calculateGrowthRate, 
  getHealthStatus 
} from '@repo/admin-dashboard/utils';

// Format numbers for display
const formattedRevenue = formatMetricValue(125000, 'currency'); // "$125,000"
const formattedPercentage = formatMetricValue(0.156, 'percentage'); // "15.6%"

// Calculate growth rates
const growthRate = calculateGrowthRate(currentValue, previousValue);

// Determine system health status
const healthStatus = getHealthStatus(systemMetrics);
```

## Usage Examples

### Complete Admin Dashboard

```typescript
import React from 'react';
import { 
  DashboardOverview, 
  useAdminMetrics, 
  useFeatureFlags 
} from '@repo/admin-dashboard';

function AdminDashboard() {
  const { metrics, isLoading, refresh } = useAdminMetrics();
  const { flags } = useFeatureFlags();

  return (
    <div className="admin-dashboard">
      <DashboardOverview
        metrics={metrics}
        systemHealth={systemHealth}
        onRefresh={refresh}
        loading={isLoading}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
          <FeatureFlags flags={flags} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {/* Activity feed component */}
        </div>
      </div>
    </div>
  );
}
```

### Metrics Dashboard

```typescript
import { useAdminMetrics } from '@repo/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system';

function MetricsDashboard() {
  const { metrics, isLoading } = useAdminMetrics();

  if (isLoading) return <div>Loading metrics...</div>;

  return (
    <div className="metrics-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-sm text-gray-600">+{metrics.userGrowthRate}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</div>
            <p className="text-sm text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Gross revenue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Content Moderation Interface

```typescript
import { useState } from 'react';
import { ReportedContent, ModerationAction } from '@repo/admin-dashboard';

interface ModerationPanelProps {
  reports: ReportedContent[];
  onAction: (reportId: string, action: ModerationAction) => void;
}

function ModerationPanel({ reports, onAction }: ModerationPanelProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleAction = (reportId: string, actionType: ModerationAction['type']) => {
    onAction(reportId, {
      id: crypto.randomUUID(),
      type: actionType,
      targetType: 'product',
      targetId: reportId,
      performedBy: 'admin-user-id',
      performedAt: new Date(),
      reason: 'Content policy violation'
    });
  };

  return (
    <div className="moderation-panel">
      <h2 className="text-xl font-semibold mb-4">Reported Content</h2>
      
      <div className="space-y-4">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{report.content.title}</h3>
                <p className="text-sm text-gray-600">{report.reason}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Reported by {report.reporter.name} on {report.reportedAt.toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction(report.id, 'approve')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(report.id, 'reject')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedReport(report.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### System Health Monitor

```typescript
import { SystemHealth } from '@repo/admin-dashboard';

function SystemHealthMonitor({ health }: { health: SystemHealth }) {
  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="system-health-monitor">
      <h2 className="text-xl font-semibold mb-4">System Health</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">Overall Status</h3>
          <div className={`text-lg font-bold ${getStatusColor(health.status)}`}>
            {health.status.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600">
            Uptime: {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">Memory Usage</h3>
          <div className="text-lg font-bold">
            {health.memory.percentage.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">
            {(health.memory.used / 1024 / 1024).toFixed(1)} MB / {(health.memory.total / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">CPU Usage</h3>
          <div className="text-lg font-bold">
            {health.cpu.usage.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">
            {health.cpu.cores} cores
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">Database</h3>
          <div className={`text-lg font-bold ${health.database.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
            {health.database.status.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600">
            {health.database.connectionCount} connections
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">Redis Cache</h3>
          <div className={`text-lg font-bold ${health.redis.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
            {health.redis.status.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600">
            Hit rate: {(health.redis.hitRate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">Storage</h3>
          <div className="text-lg font-bold">
            {health.storage.percentage.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">
            {(health.storage.used / 1024 / 1024 / 1024).toFixed(1)} GB / {(health.storage.total / 1024 / 1024 / 1024).toFixed(1)} GB
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Type Definitions

### Core Types

```typescript
interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingReports: number;
  conversionRate: number;
  averageOrderValue: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'slow';
    connectionCount: number;
    slowQueries: number;
  };
  redis: {
    status: 'connected' | 'disconnected';
    memoryUsage: number;
    hitRate: number;
  };
}

interface ReportedContent {
  id: string;
  type: 'product' | 'user' | 'message';
  reportedAt: Date;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  content: {
    id: string;
    title?: string;
    description?: string;
    imageUrl?: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetRoles?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## Configuration

### Admin Permissions

```typescript
interface AdminPermission {
  id: string;
  name: string;
  description: string;
  scope: 'users' | 'products' | 'orders' | 'reports' | 'analytics' | 'system';
}

const DEFAULT_PERMISSIONS = {
  ADMIN: ['users', 'products', 'orders', 'reports', 'analytics', 'system'],
  MODERATOR: ['users', 'products', 'reports'],
  ANALYST: ['analytics', 'reports']
};
```

### Dashboard Configuration

```typescript
interface AdminConfig {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxFileSize: number;
  supportedFileTypes: string[];
  defaultCategory: string;
  commissionRate: number;
  minimumPrice: number;
  maximumPrice: number;
  autoApproveProducts: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
}
```

## Security Features

- **Role-based Access Control**: Different permission levels for admins, moderators, and analysts
- **Audit Logging**: Track all administrative actions
- **IP Restrictions**: Limit access to specific IP addresses
- **Session Management**: Automatic session timeout and security
- **Input Validation**: All admin inputs are validated and sanitized

## Performance Optimization

- **Lazy Loading**: Components are loaded on demand
- **Caching**: Metrics and data are cached to improve performance
- **Pagination**: Large datasets are paginated
- **Real-time Updates**: Dashboard updates automatically with new data

## Testing

```bash
# Run admin dashboard tests
pnpm test packages/admin-dashboard

# Run specific test suites
pnpm test packages/admin-dashboard/components
pnpm test packages/admin-dashboard/hooks
```

## Integration Notes

This package integrates with:
- `@repo/auth` for authentication and authorization
- `@repo/database` for data operations
- `@repo/analytics` for tracking and metrics
- `@repo/design-system` for UI components

## Version History

- `0.1.0` - Initial release with dashboard overview and metrics
- Core admin components
- Feature flag management
- System health monitoring
- TypeScript support