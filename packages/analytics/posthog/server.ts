import 'server-only';
import { PostHog } from 'posthog-node';
import { keys } from '../keys';

// Create a mock analytics instance for when PostHog is not configured
const createMockAnalytics = () => ({
  capture: () => Promise.resolve(),
  identify: () => Promise.resolve(),
  groupIdentify: () => Promise.resolve(),
  flush: () => Promise.resolve(),
  shutdown: () => Promise.resolve(),
  // Add any other PostHog methods that might be used
  alias: () => Promise.resolve(),
  getFeatureFlag: () => Promise.resolve(undefined),
  getFeatureFlagPayload: () => Promise.resolve(undefined),
  isFeatureEnabled: () => Promise.resolve(false),
  reloadFeatureFlags: () => Promise.resolve(),
});

const env = keys();
const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = env.NEXT_PUBLIC_POSTHOG_HOST;

export const analytics = posthogKey && posthogHost 
  ? new PostHog(posthogKey, {
      host: posthogHost,
      // Don't batch events and flush immediately - we're running in a serverless environment
      flushAt: 1,
      flushInterval: 0,
    })
  : createMockAnalytics();
