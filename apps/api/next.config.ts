import { env } from '@/env';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  ...withLogging(config),
  serverExternalPackages: ['@prisma/client', '@prisma/engines', '@neondatabase/serverless', 'ws'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add Prisma monorepo workaround plugin
      const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

// Enable Sentry for all environments where DSN is provided
try {
  nextConfig = withSentry(nextConfig);
} catch (error) {
  console.warn('Sentry configuration failed, continuing without Sentry:', error);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
