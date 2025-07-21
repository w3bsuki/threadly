'use client';

import { useCallback } from 'react';
import { useAnalytics } from '../posthog/client';
import {
  AnalyticsEvents,
  trackProductView as trackProductViewUtil,
  trackProductFavorite as trackProductFavoriteUtil,
  trackSearch as trackSearchUtil,
  trackAddToCart as trackAddToCartUtil,
  trackPageView as trackPageViewUtil,
  trackError as trackErrorUtil,
  createProductProperties,
  createSearchProperties,
  createUserProperties,
  createOrderProperties,
} from '../events';

/**
 * Custom hook for analytics event tracking with type safety
 * Provides convenient methods for common e-commerce tracking
 */
export function useAnalyticsEvents() {
  const analytics = useAnalytics();

  // Generic event tracking
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    if (!analytics) return;
    analytics.capture(event, properties);
  }, [analytics]);

  // User identification for PostHog
  const identify = useCallback((userId: string, userProperties?: Record<string, any>) => {
    if (!analytics) return;
    analytics.identify(userId, userProperties);
  }, [analytics]);

  // Reset user (for logout)
  const reset = useCallback(() => {
    if (!analytics) return;
    analytics.reset();
  }, [analytics]);

  // Product events
  const trackProductView = useCallback((product: any) => {
    if (!analytics) return;
    trackProductViewUtil(analytics, product);
  }, [analytics]);

  const trackProductFavorite = useCallback((product: any, isFavorited: boolean) => {
    if (!analytics) return;
    trackProductFavoriteUtil(analytics, product, isFavorited);
  }, [analytics]);

  const trackProductQuickView = useCallback((product: any) => {
    track(AnalyticsEvents.PRODUCT_QUICK_VIEW, createProductProperties(product));
  }, [track]);

  const trackProductShare = useCallback((product: any, method: string) => {
    track(AnalyticsEvents.PRODUCT_SHARED, {
      ...createProductProperties(product),
      share_method: method,
    });
  }, [track]);

  const trackProductListed = useCallback((product: any) => {
    track(AnalyticsEvents.PRODUCT_LISTED, createProductProperties(product));
  }, [track]);

  // Cart events
  const trackCartAdd = useCallback((product: any) => {
    if (!analytics) return;
    trackAddToCartUtil(analytics, product);
  }, [analytics]);

  const trackCartRemove = useCallback((product: any) => {
    track(AnalyticsEvents.PRODUCT_REMOVED_FROM_CART, {
      ...createProductProperties(product),
      cart_action: 'remove',
    });
  }, [track]);

  const trackCartView = useCallback((cartTotal?: number, itemCount?: number) => {
    track(AnalyticsEvents.CART_VIEWED, {
      cart_total: cartTotal,
      cart_item_count: itemCount,
    });
  }, [track]);

  // Search events
  const trackSearchQuery = useCallback((query: string, resultsCount?: number, filters?: any) => {
    if (!analytics) return;
    trackSearchUtil(analytics, query, resultsCount, filters);
  }, [analytics]);

  const trackSearchFilters = useCallback((filters: any) => {
    track(AnalyticsEvents.SEARCH_FILTERS_APPLIED, {
      filters_applied: filters,
    });
  }, [track]);

  const trackLoadMore = useCallback((contentType: string, currentCount: number) => {
    track(AnalyticsEvents.LOAD_MORE_PRODUCTS, {
      content_type: contentType,
      current_item_count: currentCount,
    });
  }, [track]);

  // Checkout events
  const trackCheckoutStart = useCallback((cartTotal: number, itemCount: number) => {
    track(AnalyticsEvents.CHECKOUT_STARTED, {
      cart_total: cartTotal,
      cart_item_count: itemCount,
    });
  }, [track]);

  const trackOrderComplete = useCallback((order: any) => {
    track(AnalyticsEvents.ORDER_COMPLETED, createOrderProperties(order));
  }, [track]);

  // User events
  const trackUserSignUp = useCallback((user: any, method?: string) => {
    track(AnalyticsEvents.USER_SIGNED_UP, {
      ...createUserProperties(user),
      signup_method: method,
    });
  }, [track]);

  const trackUserSignIn = useCallback((user: any, method?: string) => {
    track(AnalyticsEvents.USER_SIGNED_IN, {
      ...createUserProperties(user),
      signin_method: method,
    });
  }, [track]);

  const trackProfileView = useCallback((viewedUserId: string, viewerUserId?: string) => {
    track(AnalyticsEvents.PROFILE_VIEWED, {
      viewed_user_id: viewedUserId,
      viewer_user_id: viewerUserId,
    });
  }, [track]);

  // Navigation events
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!analytics) return;
    trackPageViewUtil(analytics, path, title);
  }, [analytics]);

  const trackCategoryView = useCallback((categoryName: string, productCount?: number) => {
    track(AnalyticsEvents.CATEGORY_VIEWED, {
      category_name: categoryName,
      product_count: productCount,
    });
  }, [track]);

  // Mobile events
  const trackPullToRefresh = useCallback((page: string) => {
    track(AnalyticsEvents.PULL_TO_REFRESH, {
      page_name: page,
    });
  }, [track]);

  // Error tracking
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    if (!analytics) return;
    trackErrorUtil(analytics, error, context);
  }, [analytics]);

  return {
    // Core methods
    track,
    identify,
    reset,

    // Product events
    trackProductView,
    trackProductFavorite,
    trackProductQuickView,
    trackProductShare,
    trackProductListed,

    // Cart events
    trackCartAdd,
    trackCartRemove,
    trackCartView,

    // Search events
    trackSearchQuery,
    trackSearchFilters,
    trackLoadMore,

    // Checkout events
    trackCheckoutStart,
    trackOrderComplete,

    // User events
    trackUserSignUp,
    trackUserSignIn,
    trackProfileView,

    // Navigation events
    trackPageView,
    trackCategoryView,

    // Mobile events
    trackPullToRefresh,

    // Error tracking
    trackError,

    // Direct access to analytics instance
    analytics,
  };
}