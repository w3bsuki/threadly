import { env } from './env';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

// Start with base configuration
let nextConfig: NextConfig = withToolbar(config);

// Transpile packages that might cause issues
nextConfig.transpilePackages = [
  '@clerk/nextjs',
  '@repo/design-system',
  '@repo/ui',
  '@knocklabs/react',
];

// Add specific configuration
nextConfig = {
  ...nextConfig,
  experimental: {
    ...nextConfig.experimental,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@repo/design-system',
      '@repo/database',
      'date-fns',
      'react-hook-form',
      '@stripe/react-stripe-js',
      'zustand',
      '@tanstack/react-query',
    ],
  },
  serverExternalPackages: ['@prisma/client', '@prisma/engines', '@neondatabase/serverless', 'ws'],
  // Webpack configuration
  webpack: (config, { isServer, webpack }) => {
    // Suppress warnings
    if (isServer) {
      config.ignoreWarnings = [
        { module: /require-in-the-middle/ },
        { module: /@opentelemetry\/instrumentation/ },
      ];
      
      // Add Prisma monorepo workaround plugin
      const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
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
