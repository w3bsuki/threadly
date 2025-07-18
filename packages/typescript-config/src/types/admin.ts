export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  permissions: AdminPermission[]
  createdAt: Date
  lastLoginAt?: Date
}

export type AdminRole = "super_admin" | "admin" | "moderator" | "support"

export type AdminPermission = 
  | "users.view"
  | "users.edit"
  | "users.delete"
  | "users.ban"
  | "products.view"
  | "products.edit"
  | "products.delete"
  | "products.feature"
  | "orders.view"
  | "orders.edit"
  | "orders.cancel"
  | "payments.view"
  | "payments.refund"
  | "reports.view"
  | "reports.resolve"
  | "settings.view"
  | "settings.edit"
  | "analytics.view"

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  totalProducts: number
  pendingProducts: number
  totalOrders: number
  revenue: {
    today: number
    week: number
    month: number
    year: number
  }
  growth: {
    users: number
    products: number
    orders: number
    revenue: number
  }
}

export interface AdminActivityLog {
  id: string
  adminId: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: Date
}

export interface AdminReportItem {
  id: string
  type: "product" | "user" | "review" | "message"
  reportedEntityId: string
  reporterId: string
  reason: string
  description?: string
  status: "pending" | "reviewing" | "resolved" | "dismissed"
  assignedTo?: string
  resolution?: string
  createdAt: Date
  resolvedAt?: Date
}