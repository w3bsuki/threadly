/**
 * Marketplace-specific observability context and utilities for Threadly
 */

import * as Sentry from '@sentry/nextjs';
import { log } from './log';

export interface MarketplaceUser {
  id: string;
  email?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  stripeCustomerId?: string;
  stripeConnectAccountId?: string;
}

export interface ProductContext {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  categoryId: string;
  status: string;
}

export interface OrderContext {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  total: number;
  status: string;
  paymentIntentId?: string;
}

export interface SearchContext {
  query: string;
  filters: Record<string, any>;
  resultCount: number;
  userId?: string;
}

/**
 * Set user context for error tracking and analytics
 */
export function setUserContext(user: MarketplaceUser): void {
  try {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    Sentry.setTag('user.role', user.role);
    
    if (user.stripeCustomerId) {
      Sentry.setTag('stripe.customer_id', user.stripeCustomerId);
    }
    
    if (user.stripeConnectAccountId) {
      Sentry.setTag('stripe.connect_account_id', user.stripeConnectAccountId);
    }

    log.info('User context set for observability', {
      userId: user.id,
      role: user.role,
      hasStripeCustomer: !!user.stripeCustomerId,
      hasStripeConnect: !!user.stripeConnectAccountId,
    });
  } catch (error) {
    log.error('Failed to set user context', { error });
  }
}

/**
 * Set product context for product-related operations
 */
export function setProductContext(product: ProductContext): void {
  try {
    Sentry.setContext('product', {
      id: product.id,
      title: product.title,
      price: product.price,
      sellerId: product.sellerId,
      categoryId: product.categoryId,
      status: product.status,
    });

    Sentry.setTag('product.id', product.id);
    Sentry.setTag('product.seller_id', product.sellerId);
    Sentry.setTag('product.category_id', product.categoryId);
    Sentry.setTag('product.status', product.status);
  } catch (error) {
    log.error('Failed to set product context', { error });
  }
}

/**
 * Set order context for order-related operations
 */
export function setOrderContext(order: OrderContext): void {
  try {
    Sentry.setContext('order', {
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      productId: order.productId,
      total: order.total,
      status: order.status,
      paymentIntentId: order.paymentIntentId,
    });

    Sentry.setTag('order.id', order.id);
    Sentry.setTag('order.buyer_id', order.buyerId);
    Sentry.setTag('order.seller_id', order.sellerId);
    Sentry.setTag('order.product_id', order.productId);
    Sentry.setTag('order.status', order.status);
    
    if (order.paymentIntentId) {
      Sentry.setTag('stripe.payment_intent_id', order.paymentIntentId);
    }
  } catch (error) {
    log.error('Failed to set order context', { error });
  }
}

/**
 * Track search operations with context
 */
export function trackSearchOperation(search: SearchContext): void {
  try {
    Sentry.addBreadcrumb({
      category: 'search',
      message: `Search performed: "${search.query}"`,
      level: 'info',
      data: {
        query: search.query,
        filters: search.filters,
        resultCount: search.resultCount,
        userId: search.userId,
      },
    });

    Sentry.setTag('search.query', search.query);
    Sentry.setTag('search.result_count', search.resultCount.toString());
    
    if (search.userId) {
      Sentry.setTag('search.user_id', search.userId);
    }

    log.info('Search operation tracked', {
      query: search.query,
      filterCount: Object.keys(search.filters).length,
      resultCount: search.resultCount,
      userId: search.userId,
    });
  } catch (error) {
    log.error('Failed to track search operation', { error });
  }
}

/**
 * Track API performance with marketplace-specific context
 */
export function trackApiPerformance(operation: {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  userId?: string;
  hasDatabase?: boolean;
  hasStripe?: boolean;
  cacheHit?: boolean;
}): void {
  try {
    Sentry.addBreadcrumb({
      category: 'api.performance',
      message: `${operation.method} ${operation.endpoint} - ${operation.duration}ms`,
      level: operation.statusCode >= 400 ? 'warning' : 'info',
      data: {
        endpoint: operation.endpoint,
        method: operation.method,
        duration: operation.duration,
        statusCode: operation.statusCode,
        userId: operation.userId,
        hasDatabase: operation.hasDatabase,
        hasStripe: operation.hasStripe,
        cacheHit: operation.cacheHit,
      },
    });

    // Tag slow operations
    if (operation.duration > 1000) {
      Sentry.setTag('performance.slow_api', 'true');
    }

    // Tag external service usage
    if (operation.hasStripe) {
      Sentry.setTag('external.stripe', 'true');
    }

    if (operation.cacheHit !== undefined) {
      Sentry.setTag('cache.hit', operation.cacheHit.toString());
    }

    log.info('API performance tracked', {
      endpoint: operation.endpoint,
      method: operation.method,
      duration: operation.duration,
      statusCode: operation.statusCode,
      slow: operation.duration > 1000,
    });
  } catch (error) {
    log.error('Failed to track API performance', { error });
  }
}

/**
 * Track payment-related operations
 */
export function trackPaymentOperation(operation: {
  type: 'payment_intent_created' | 'payment_succeeded' | 'payment_failed' | 'payout_created' | 'connect_account_created';
  orderId?: string;
  sellerId?: string;
  buyerId?: string;
  amount?: number;
  currency?: string;
  stripeId?: string;
  error?: string;
}): void {
  try {
    Sentry.addBreadcrumb({
      category: 'payment',
      message: `Payment operation: ${operation.type}`,
      level: operation.type.includes('failed') ? 'error' : 'info',
      data: operation,
    });

    Sentry.setTag('payment.operation', operation.type);
    
    if (operation.orderId) {
      Sentry.setTag('payment.order_id', operation.orderId);
    }
    
    if (operation.stripeId) {
      Sentry.setTag('payment.stripe_id', operation.stripeId);
    }

    log.info('Payment operation tracked', {
      type: operation.type,
      orderId: operation.orderId,
      amount: operation.amount,
      success: !operation.error,
    });
  } catch (error) {
    log.error('Failed to track payment operation', { error });
  }
}

/**
 * Track image upload and processing operations
 */
export function trackImageOperation(operation: {
  type: 'upload_started' | 'upload_completed' | 'upload_failed' | 'processing_started' | 'processing_completed';
  productId?: string;
  userId: string;
  fileSize?: number;
  fileType?: string;
  duration?: number;
  error?: string;
}): void {
  try {
    Sentry.addBreadcrumb({
      category: 'image',
      message: `Image operation: ${operation.type}`,
      level: operation.type.includes('failed') ? 'error' : 'info',
      data: operation,
    });

    Sentry.setTag('image.operation', operation.type);
    Sentry.setTag('image.user_id', operation.userId);
    
    if (operation.productId) {
      Sentry.setTag('image.product_id', operation.productId);
    }

    if (operation.fileSize) {
      Sentry.setTag('image.file_size', operation.fileSize.toString());
    }

    if (operation.fileType) {
      Sentry.setTag('image.file_type', operation.fileType);
    }

    log.info('Image operation tracked', {
      type: operation.type,
      userId: operation.userId,
      productId: operation.productId,
      fileSize: operation.fileSize,
      success: !operation.error,
    });
  } catch (error) {
    log.error('Failed to track image operation', { error });
  }
}

/**
 * Clear all marketplace context (useful for user logout)
 */
export function clearMarketplaceContext(): void {
  try {
    Sentry.setUser(null);
    Sentry.setContext('product', null);
    Sentry.setContext('order', null);
    
    log.info('Marketplace context cleared');
  } catch (error) {
    log.error('Failed to clear marketplace context', { error });
  }
}