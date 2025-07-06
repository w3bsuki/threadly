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