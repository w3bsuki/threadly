// Re-export cart types for convenience
export * from '../cart/types';

// Commerce-specific types
export interface CommerceProduct {
  id: string;
  title: string;
  description: string;
  price: number; // In dollars
  images: string[];
  sellerId: string;
  sellerName: string;
  condition: string;
  category: string;
  subcategory?: string;
  size?: string;
  color?: string;
  brand?: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
}

export interface ShippingAddress {
  id?: string;
  name: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'stripe';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CheckoutSession {
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ProductQuery {
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  size?: string[];
  color?: string[];
  brand?: string[];
  sellerId?: string;
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  sortBy?: 'price' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductQueryResult {
  products: CommerceProduct[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Product detail types from @repo/products
export interface ProductImage {
  imageUrl: string;
  alt?: string | null;
}

export interface ProductSeller {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  joinedAt: Date;
  _count: {
    listings: number;
    followers: number;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent?: {
    name: string;
    slug: string;
  } | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  size?: string | null;
  brand?: string | null;
  color?: string | null;
  views: number;
  createdAt: Date;
  images: ProductImage[];
  seller: ProductSeller;
  category: ProductCategory;
  _count: {
    favorites: number;
  };
}

export interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  images: ProductImage[];
  seller: {
    firstName: string | null;
    lastName: string | null;
  };
}

export const conditionLabels = {
  NEW_WITH_TAGS: 'New with tags',
  NEW_WITHOUT_TAGS: 'New without tags',
  VERY_GOOD: 'Very good',
  GOOD: 'Good',
  SATISFACTORY: 'Satisfactory',
} as const;

export const conditionColors = {
  NEW_WITH_TAGS: 'bg-green-100 text-green-800',
  NEW_WITHOUT_TAGS: 'bg-blue-100 text-blue-800',
  VERY_GOOD: 'bg-purple-100 text-purple-800',
  GOOD: 'bg-yellow-100 text-yellow-800',
  SATISFACTORY: 'bg-secondary text-foreground/90',
} as const;