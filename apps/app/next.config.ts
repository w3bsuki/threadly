import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';
// import { env } from './env';

// Start with base configuration
let nextConfig: NextConfig = withToolbar(config);

// Transpile packages that might cause issues
nextConfig.transpilePackages = [
  '@clerk/nextjs',
  '@repo/ui',
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
      '@repo/ui',
      '@repo/database',
      'date-fns',
      'react-hook-form',
      '@stripe/react-stripe-js',
      'zustand',
      '@tanstack/react-query',
      '@hookform/resolvers',
      'zod',
      '@clerk/nextjs',
      '@clerk/shared',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@knocklabs/react',
      'react-intersection-observer',
      'framer-motion',
    ],
    webpackBuildWorker: true,
    optimizeCss: true,
  },
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/engines',
    '@neondatabase/serverless',
    'ws',
  ],
  // Webpack configuration
  webpack: (config, { isServer, webpack, dev }) => {
    // Suppress warnings
    if (isServer) {
      config.ignoreWarnings = [
        { module: /require-in-the-middle/ },
        { module: /@opentelemetry\/instrumentation/ },
      ];

      // Add Prisma monorepo workaround plugin
      const {
        PrismaPlugin,
      } = require('@prisma/nextjs-monorepo-workaround-plugin');
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    // Production optimizations
    if (!dev) {
      // Enable module concatenation
      config.optimization.concatenateModules = true;

      // Optimize chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 160_000 &&
                /node_modules[\\/]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = require('crypto').createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
        maxAsyncRequests: 30,
        maxInitialRequests: 25,
      };
    }

    return config;
  },
  // Performance optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  // Compiler options
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    domains: [], // Deprecated, using remotePatterns instead
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Cache and headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

// Enable Sentry for error tracking and performance monitoring
try {
  nextConfig = withSentry(nextConfig);
} catch {
}

// Enable logging for better observability
try {
  nextConfig = withLogging(nextConfig);
} catch {
}

if (process.env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
