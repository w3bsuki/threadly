// Analytics exports
export * from './posthog/client';
export * from './posthog/server';
export * from './hooks/use-analytics-events';
export * from './events';

// Re-export the main provider as AnalyticsProvider for backward compatibility
export { PostHogProvider as AnalyticsProvider } from './posthog/client';