import { env } from '@/env';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

// Start with base configuration
let nextConfig: NextConfig = withToolbar(config);

// Add specific configuration for handling dynamic routes with client components
nextConfig = {
  ...nextConfig,
  experimental: {
    ...nextConfig.experimental,
    // This helps with client reference manifest generation
    optimizeCss: false,
    // Better handling of dynamic routes
    workerThreads: false,
    cpus: 1,
  }
};

// Enable Sentry for error tracking and performance monitoring
try {
  nextConfig = withSentry(nextConfig);
} catch (error) {
  console.warn('Sentry configuration failed, continuing without Sentry:', error);
}

// Enable logging for better observability
try {
  nextConfig = withLogging(nextConfig);
} catch (error) {
  console.warn('Logging configuration failed, continuing without enhanced logging:', error);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
