/**
 * Comprehensive analytics events for Threadly e-commerce platform
 * Following e-commerce industry standard event naming and properties
 */

// Event property types for type safety
export interface ProductEventProps {
  product_id: string;
  product_name: string;
  product_brand?: string;
  product_category?: string;
  product_price: number;
  product_condition?: string;
  product_size?: string;
  seller_id?: string;
  seller_name?: string;
}

export interface CartEventProps {
  cart_total?: number;
  cart_item_count?: number;
  product_ids?: string[];
}

export interface SearchEventProps {
  search_query: string;
  search_results_count?: number;
  search_category?: string;
  search_filters?: Record<string, any>;
}

export interface UserEventProps {
  user_id: string;
  user_type?: 'buyer' | 'seller' | 'both';
  user_location?: string;
  user_signup_date?: string;
}

export interface OrderEventProps {
  order_id: string;
  order_total: number;
  order_item_count: number;
  payment_method?: string;
  shipping_method?: string;
  seller_ids?: string[];
}

export interface MessageEventProps {
  conversation_id: string;
  recipient_id: string;
  message_type?: 'product_inquiry' | 'general' | 'offer';
  product_id?: string;
}

// Standard e-commerce events following industry conventions
export const AnalyticsEvents = {
  // Product Events
  PRODUCT_VIEWED: 'Product Viewed',
  PRODUCT_QUICK_VIEW: 'Product Quick View Opened',
  PRODUCT_FAVORITED: 'Product Favorited',
  PRODUCT_UNFAVORITED: 'Product Unfavorited',
  PRODUCT_SHARED: 'Product Shared',
  PRODUCT_LISTED: 'Product Listed',
  PRODUCT_UPDATED: 'Product Updated',
  PRODUCT_DELETED: 'Product Deleted',

  // Cart Events
  PRODUCT_ADDED_TO_CART: 'Product Added to Cart',
  PRODUCT_REMOVED_FROM_CART: 'Product Removed from Cart',
  CART_VIEWED: 'Cart Viewed',
  CART_CLEARED: 'Cart Cleared',

  // Checkout Events
  CHECKOUT_STARTED: 'Checkout Started',
  CHECKOUT_STEP_COMPLETED: 'Checkout Step Completed',
  PAYMENT_INFO_ENTERED: 'Payment Info Entered',
  ORDER_COMPLETED: 'Order Completed',
  ORDER_CANCELLED: 'Order Cancelled',

  // Search Events
  PRODUCTS_SEARCHED: 'Products Searched',
  SEARCH_RESULTS_VIEWED: 'Search Results Viewed',
  SEARCH_FILTERS_APPLIED: 'Search Filters Applied',
  SEARCH_FILTERS_CLEARED: 'Search Filters Cleared',

  // User Events
  USER_SIGNED_UP: 'User Signed Up',
  USER_SIGNED_IN: 'User Signed In',
  USER_SIGNED_OUT: 'User Signed Out',
  PROFILE_UPDATED: 'Profile Updated',
  PROFILE_VIEWED: 'Profile Viewed',

  // Social Features
  USER_FOLLOWED: 'User Followed',
  USER_UNFOLLOWED: 'User Unfollowed',
  MESSAGE_SENT: 'Message Sent',
  MESSAGE_VIEWED: 'Message Viewed',

  // Navigation Events
  PAGE_VIEWED: 'Page Viewed',
  CATEGORY_VIEWED: 'Category Viewed',
  SELLER_PROFILE_VIEWED: 'Seller Profile Viewed',

  // Engagement Events
  NEWSLETTER_SUBSCRIBED: 'Newsletter Subscribed',
  REVIEW_SUBMITTED: 'Review Submitted',
  FEEDBACK_SUBMITTED: 'Feedback Submitted',
  SUPPORT_CONTACTED: 'Support Contacted',

  // Mobile Specific
  PULL_TO_REFRESH: 'Pull to Refresh',
  LOAD_MORE_PRODUCTS: 'Load More Products',

  // Error Events
  ERROR_OCCURRED: 'Error Occurred',
  API_ERROR: 'API Error',
  PAYMENT_FAILED: 'Payment Failed',
} as const;

// Event properties helpers
export const createProductProperties = (product: any): ProductEventProps => ({
  product_id: product.id,
  product_name: product.title,
  product_brand: product.brand,
  product_category: product.categoryName || product.category?.name,
  product_price: product.price,
  product_condition: product.condition,
  product_size: product.size,
  seller_id: product.seller?.id,
  seller_name:
    product.seller?.name ||
    `${product.seller?.firstName || ''} ${product.seller?.lastName || ''}`.trim(),
});

export const createSearchProperties = (
  query: string,
  resultsCount?: number,
  category?: string,
  filters?: Record<string, any>
): SearchEventProps => ({
  search_query: query,
  search_results_count: resultsCount,
  search_category: category,
  search_filters: filters,
});

export const createUserProperties = (user: any): UserEventProps => ({
  user_id: user.id,
  user_type: user.role,
  user_location: user.location,
  user_signup_date: user.createdAt,
});

export const createOrderProperties = (order: any): OrderEventProps => ({
  order_id: order.id,
  order_total: order.total,
  order_item_count: order.items?.length || 1,
  payment_method: order.paymentMethod,
  shipping_method: order.shippingMethod,
  seller_ids: order.items?.map((item: any) => item.sellerId),
});

// Page view properties for better analytics
export const createPageProperties = (path: string, title?: string) => ({
  page_path: path,
  page_title: title || document?.title,
  page_url: typeof window !== 'undefined' ? window.location.href : undefined,
  referrer: typeof document !== 'undefined' ? document.referrer : undefined,
});

// Utility functions for common event patterns
export const trackProductView = (analytics: any, product: any) => {
  analytics.capture(AnalyticsEvents.PRODUCT_VIEWED, {
    ...createProductProperties(product),
    ...createPageProperties(`/product/${product.id}`, product.title),
  });
};

export const trackProductFavorite = (
  analytics: any,
  product: any,
  isFavorited: boolean
) => {
  const event = isFavorited
    ? AnalyticsEvents.PRODUCT_FAVORITED
    : AnalyticsEvents.PRODUCT_UNFAVORITED;
  analytics.capture(event, createProductProperties(product));
};

export const trackSearch = (
  analytics: any,
  query: string,
  resultsCount?: number,
  filters?: any
) => {
  analytics.capture(
    AnalyticsEvents.PRODUCTS_SEARCHED,
    createSearchProperties(query, resultsCount, filters?.category, filters)
  );
};

export const trackAddToCart = (analytics: any, product: any) => {
  analytics.capture(AnalyticsEvents.PRODUCT_ADDED_TO_CART, {
    ...createProductProperties(product),
    cart_action: 'add',
  });
};

export const trackPageView = (analytics: any, path: string, title?: string) => {
  analytics.capture(
    AnalyticsEvents.PAGE_VIEWED,
    createPageProperties(path, title)
  );
};

export const trackError = (
  analytics: any,
  error: Error,
  context?: Record<string, any>
) => {
  analytics.capture(AnalyticsEvents.ERROR_OCCURRED, {
    error_message: error.message,
    error_stack: error.stack,
    error_name: error.name,
    ...context,
  });
};
