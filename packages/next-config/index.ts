import withBundleAnalyzer from '@next/bundle-analyzer';

// @ts-expect-error No declaration file
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';

const otelRegex = /@opentelemetry\/instrumentation/;

import { withPerformance } from './optimized';

const baseConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },

  // biome-ignore lint/suspicious/useAwait: rewrites is async
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },

  webpack(config, { isServer, dev }) {
    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new PrismaPlugin());
      
      // External packages for server
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@prisma/client');
        config.externals.push('@prisma/engines');
      }
    }

    // Externalize Node.js modules for client-side bundles
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@prisma/client/runtime/library': 'commonjs @prisma/client/runtime/library',
      });
      
      // Fallback for Node.js modules that shouldn't be bundled on client
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        'fs/promises': false,
        async_hooks: false,
      };
    }

    // Configure Prisma for monorepo
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Point to the correct Prisma client location
    const path = require('path');
    const databasePackagePath = path.resolve(__dirname, '../database');
    config.resolve.alias['@prisma/client'] = path.join(databasePackagePath, 'generated/client');
    config.resolve.alias['.prisma/client'] = path.join(databasePackagePath, 'generated/client');

    // Ignore warnings for OpenTelemetry
    config.ignoreWarnings = [{ module: otelRegex }];

    return config;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

// Apply performance optimizations
export const config = withPerformance(baseConfig);

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
