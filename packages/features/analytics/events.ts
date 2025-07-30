/**
 * Analytics events and utility functions
 */

export const AnalyticsEvents = {
  // Product events
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_FAVORITED: 'product_favorited',
  PRODUCT_UNFAVORITED: 'product_unfavorited',
  PRODUCT_QUICK_VIEW: 'product_quick_view',
  PRODUCT_SHARED: 'product_shared',
  PRODUCT_LISTED: 'product_listed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',

  // Cart events
  CART_VIEWED: 'cart_viewed',

  // Search events
  SEARCH_QUERY: 'search_query',
  SEARCH_FILTERS_APPLIED: 'search_filters_applied',
  LOAD_MORE_PRODUCTS: 'load_more_products',

  // Checkout events
  CHECKOUT_STARTED: 'checkout_started',
  ORDER_COMPLETED: 'order_completed',

  // User events
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  PROFILE_VIEWED: 'profile_viewed',

  // Navigation events
  PAGE_VIEW: 'page_view',
  CATEGORY_VIEWED: 'category_viewed',

  // Mobile events
  PULL_TO_REFRESH: 'pull_to_refresh',

  // Error events
  ERROR_OCCURRED: 'error_occurred',
} as const;

// Utility functions for creating properties
export function createProductProperties(product: any) {
  return {
    product_id: product?.id,
    product_name: product?.title,
    product_price: product?.price,
    product_category: product?.category,
    product_brand: product?.brand,
  };
}

export function createUserProperties(user: any) {
  return {
    user_id: user?.id,
    user_email: user?.email,
    user_name: user?.name,
  };
}

export function createOrderProperties(order: any) {
  return {
    order_id: order?.id,
    order_total: order?.total,
    order_items_count: order?.items?.length,
  };
}

// Track functions
export function trackProductView(analytics: any, product: any) {
  analytics.capture(AnalyticsEvents.PRODUCT_VIEWED, createProductProperties(product));
}

export function trackProductFavorite(analytics: any, product: any, isFavorited: boolean) {
  const event = isFavorited ? AnalyticsEvents.PRODUCT_FAVORITED : AnalyticsEvents.PRODUCT_UNFAVORITED;
  analytics.capture(event, createProductProperties(product));
}

export function trackAddToCart(analytics: any, product: any) {
  analytics.capture(AnalyticsEvents.PRODUCT_ADDED_TO_CART, createProductProperties(product));
}

export function trackSearch(analytics: any, query: string, resultsCount?: number, filters?: any) {
  analytics.capture(AnalyticsEvents.SEARCH_QUERY, {
    search_query: query,
    results_count: resultsCount,
    filters_applied: filters,
  });
}

export function trackPageView(analytics: any, path: string, title?: string) {
  analytics.capture(AnalyticsEvents.PAGE_VIEW, {
    page_path: path,
    page_title: title,
  });
}

export function trackError(analytics: any, error: Error, context?: Record<string, any>) {
  analytics.capture(AnalyticsEvents.ERROR_OCCURRED, {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}