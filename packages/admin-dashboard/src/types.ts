// Admin Dashboard Types

export interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingReports: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface UserMetrics {
  newUsers: TimeSeriesData[];
  activeUsers: TimeSeriesData[];
  userGrowthRate: number;
  churnRate: number;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  categoryCounts: Array<{ category: string; count: number }>;
  avgPrice: number;
  topCategories: Array<{ name: string; count: number; revenue: number }>;
}

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  ordersByStatus: Array<{ status: string; count: number }>;
  revenueOverTime: TimeSeriesData[];
  avgOrderValue: number;
}

export interface ReportedContent {
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
  assignedTo?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface ModerationAction {
  id: string;
  type: 'approve' | 'reject' | 'suspend' | 'delete' | 'warn';
  targetType: 'product' | 'user' | 'message';
  targetId: string;
  performedBy: string;
  performedAt: Date;
  reason: string;
  notes?: string;
  duration?: number; // For suspensions, in days
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'super_admin';
  permissions: AdminPermission[];
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  scope: 'users' | 'products' | 'orders' | 'reports' | 'analytics' | 'system';
}

export interface SystemHealth {
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
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  errors: Array<{
    timestamp: Date;
    level: 'error' | 'warning';
    message: string;
    count: number;
  }>;
}

export interface FeatureFlag {
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

export interface AdminConfig {
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

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  performedBy: string;
  performedAt: Date;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  slackEnabled: boolean;
  webhookEnabled: boolean;
  emailRecipients: string[];
  slackChannel: string;
  webhookUrl: string;
  notifyOnNewUser: boolean;
  notifyOnNewProduct: boolean;
  notifyOnNewOrder: boolean;
  notifyOnReport: boolean;
  notifyOnError: boolean;
  notifyOnHighRevenue: boolean;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  name: string;
  data: Array<{ x: string; y: number }>;
  color?: string;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowSelect?: (selectedRows: T[]) => void;
  actions?: Array<{
    label: string;
    onClick: (record: T) => void;
    type?: 'primary' | 'danger' | 'default';
  }>;
}

// Filter types
export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface StatusFilter {
  statuses: string[];
}

export interface SearchFilter {
  query: string;
  fields: string[];
}

export interface AdminFilters {
  dateRange?: DateRangeFilter;
  status?: StatusFilter;
  search?: SearchFilter;
  category?: string;
  userId?: string;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeHeaders: boolean;
  dateRange?: DateRangeFilter;
  filters?: AdminFilters;
}

export interface BulkActionOptions {
  action: 'approve' | 'reject' | 'delete' | 'suspend';
  reason?: string;
  duration?: number;
  notify?: boolean;
}

// Widget types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  refreshInterval?: number;
}

export interface WidgetConfig {
  metric?: {
    value: number;
    previousValue?: number;
    format: 'number' | 'currency' | 'percentage';
    trend?: 'up' | 'down' | 'neutral';
  };
  chart?: {
    type: 'line' | 'bar' | 'pie' | 'area';
    data: ChartData[] | LineChartData[];
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'year';
  };
  table?: {
    columns: TableColumn[];
    dataSource: string;
    pageSize: number;
  };
}