export interface SellerProfile {
  id: string
  userId: string
  username: string
  displayName?: string
  bio?: string
  imageUrl?: string
  coverImageUrl?: string
  rating: number
  reviewCount: number
  soldCount: number
  followerCount: number
  followingCount: number
  isVerified: boolean
  joinedAt: Date
  lastActiveAt?: Date
  badges?: SellerBadge[]
  stats: SellerStats
}

export interface SellerBadge {
  id: string
  type: BadgeType
  name: string
  description: string
  iconUrl: string
  earnedAt: Date
}

export type BadgeType = 
  | "trusted_seller"
  | "fast_shipper"
  | "top_rated"
  | "power_seller"
  | "eco_friendly"
  | "authenticity_verified"

export interface SellerStats {
  totalSales: number
  totalRevenue: number
  averageRating: number
  responseTime: number
  shipmentTime: number
  returnRate: number
  activeListings: number
  completionRate: number
}

export interface SellerDashboard {
  overview: {
    totalSales: number
    revenue: number
    activeListings: number
    pendingOrders: number
    unreadMessages: number
  }
  recentOrders: SellerOrder[]
  topProducts: SellerProduct[]
  performance: SellerPerformance
}

export interface SellerOrder {
  id: string
  orderNumber: string
  productId: string
  productTitle: string
  productImage: string
  buyerId: string
  buyerName: string
  price: number
  status: OrderStatus
  shippingDeadline?: Date
  createdAt: Date
}

export interface SellerProduct {
  id: string
  title: string
  imageUrl: string
  price: number
  views: number
  favorites: number
  status: "active" | "sold" | "reserved" | "draft"
  createdAt: Date
}

export interface SellerPerformance {
  rating: number
  responseRate: number
  shipmentRate: number
  onTimeDeliveryRate: number
  period: "week" | "month" | "year"
}

export type OrderStatus = 
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"