/**
 * Common TypeScript types and interfaces used across the application
 */

import { z } from 'zod';

// Price type - represents monetary values
export type Price = number;

// Generic dictionary type
export interface Dictionary<T = unknown> {
  [key: string]: T;
}

// Cart item interface
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: Price;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  sellerId: string;
  sellerName?: string;
}

// Category interface for navigation
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
  icon?: string;
  order?: number;
}

// Order data interface for checkout
export interface OrderData {
  orderId: string;
  items: CartItem[];
  subtotal: Price;
  shipping: Price;
  tax: Price;
  total: Price;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Shipping address interface
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Payment method interface
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// Order status enum
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Form data interfaces for various forms
export interface ProductFormData {
  title: string;
  description: string;
  price: Price;
  category: string;
  subcategory?: string;
  condition: string;
  size: string;
  color: string;
  brand?: string;
  material?: string;
  images: File[] | string[];
  tags?: string[];
  quantity: number;
  shippingPrice?: Price;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: 'standard' | 'express';
}

export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: File | string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Dictionary;
}

export enum NotificationType {
  ORDER = 'ORDER',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  PROMOTION = 'PROMOTION',
  PRODUCT = 'PRODUCT',
}

// Search suggestion type
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'user';
  count?: number;
}

// Validation error detail (for Zod errors)
export interface ValidationErrorDetail {
  path?: (string | number)[];
  message: string;
}

// Seller template interface
export interface SellerTemplate {
  id: string;
  name: string;
  description?: string;
  fields: Dictionary;
  createdAt: Date;
  updatedAt: Date;
}
