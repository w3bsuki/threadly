/*
 * This file configures the initialization of Sentry on the client for Threadly marketplace.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import {
  browserTracingIntegration,
  init,
  replayIntegration,
} from '@sentry/nextjs';
import { keys } from './keys';

export const initializeSentry = (): ReturnType<typeof init> => {
  const env = keys();

  // Don't initialize if no DSN is provided
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  return init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: env.NEXT_PUBLIC_SENTRY_RELEASE,

    // Performance monitoring
    tracesSampleRate:
      env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session replay for debugging user issues
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate:
      env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0.5,

    // Enable performance monitoring for React components
    integrations: [
      browserTracingIntegration({
        // Track user interactions
        enableInp: true,
        enableLongTask: true,
      }),

      replayIntegration({
        // Session replay configuration
        maskAllText: true, // Protect user privacy
        blockAllMedia: true, // Don't record images/videos

        // Marketplace-specific masking
        mask: [
          // Mask sensitive marketplace data
          '[data-sensitive]',
          '.payment-info',
          '.personal-info',
          '.stripe-element',
          'input[type="password"]',
          'input[type="email"]',
          'input[name*="card"]',
          'input[name*="bank"]',
        ],

        block: [
          // Block sensitive elements entirely
          '.payment-form',
          '.bank-details',
          '.ssn-input',
        ],
      }),
    ],

    // Enhanced error filtering for marketplace
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Filter out common non-critical errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();

        // Network/connectivity issues (user-side problems)
        if (
          message.includes('network error') ||
          message.includes('fetch failed') ||
          message.includes('load failed') ||
          message.includes('aborted') ||
          message.includes('timeout') ||
          message.includes('connection refused') ||
          message.includes('no internet')
        ) {
          return null;
        }

        // Cancelled requests (user navigation)
        if (
          message.includes('cancel') ||
          message.includes('abort') ||
          message.includes('navigation')
        ) {
          return null;
        }

        // Browser extension interference
        if (
          message.includes('extension') ||
          message.includes('chrome-extension') ||
          message.includes('moz-extension')
        ) {
          return null;
        }

        // Ad blocker related errors
        if (
          message.includes('adblock') ||
          message.includes('ad blocker') ||
          message.includes('ublock')
        ) {
          return null;
        }
      }

      // Don't send events in development for console noise
      if (env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development') {
        console.warn('Sentry event (dev mode):', event);
        return null;
      }

      return event;
    },

    // Privacy settings
    sendDefaultPii: false, // Don't send personally identifiable information
    attachStacktrace: true, // Include stack traces for better debugging

    // Debug settings
    debug: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development',

    // Marketplace-specific tags
    initialScope: {
      tags: {
        app: 'threadly-marketplace',
        runtime: 'browser',
      },
    },

    // Tune performance monitoring
    _experiments: {
      // Enable profiling for performance insights
      profilesSampleRate:
        env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.01 : 0.1,
    },
  });
};
