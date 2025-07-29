import { withCMS } from '@repo/cms/next-config';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';
// import { env } from '@/env';

let nextConfig: NextConfig = withToolbar(config);


// Performance optimizations
nextConfig.experimental = {
  ...nextConfig.experimental,
  optimizePackageImports: [
    '@repo/ui',
    '@repo/database',
    'lucide-react',
    '@tanstack/react-query',
    'react-hook-form',
    '@hookform/resolvers',
    'date-fns',
    'zustand',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-tooltip',
    '@stripe/react-stripe-js',
    '@stripe/stripe-js',
  ],
  webpackBuildWorker: true,
  optimizeCss: true,
};

// Override images config to include all needed domains
nextConfig.images = {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.clerk.com',
    },
    {
      protocol: 'https',
      hostname: 'assets.basehub.com',
    },
    {
      protocol: 'https',
      hostname: 'placehold.co',
    },
    {
      protocol: 'https',
      hostname: 'utfs.io',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
};

// Fix webpack issues and Prisma bundling
nextConfig.webpack = (config, { isServer, dev }) => {
  // Exclude Windows system directories from webpack scanning
  config.watchOptions = {
    ...config.watchOptions,
    ignored: [
      '**/node_modules',
      '**/.git',
      '**/.next',
      'C:\\Users\\**\\AppData\\**',
      'C:\\Windows\\**',
      'C:\\Program Files\\**',
      'C:\\Program Files (x86)\\**',
    ],
  };

  // Fix Windows directory scanning issues during build
  if (process.platform === 'win32') {
    // Override resolve.modules to prevent scanning system directories
    config.resolve.modules = [
      'node_modules',
      ...(config.resolve.modules || []).filter(
        (dir) => typeof dir === 'string' && !dir.includes('AppData') && !dir.includes('Windows')
      ),
    ];

    // Add snapshot management options to prevent scanning
    config.snapshot = {
      ...(config.snapshot || {}),
      managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
      immutablePaths: [],
    };
  }

  // Add resolve fallbacks for browser environment
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
  }

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
    // Enable module concatenation for better tree shaking
    config.optimization.concatenateModules = true;

    // Split chunks more aggressively
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
        shared: {
          name(module, chunks) {
            const hash = require('crypto')
              .createHash('sha1')
              .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
              .digest('hex');
            return hash;
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
      maxAsyncRequests: 30,
      maxInitialRequests: 25,
    };
  }

  return config;
};

// Fix Prisma bundling for Vercel with binary engine
nextConfig.serverExternalPackages = [
  '@prisma/engines',
  '@prisma/client',
  '@neondatabase/serverless',
  'ws',
];

// Optimize production builds
nextConfig.productionBrowserSourceMaps = false;
nextConfig.poweredByHeader = false;
nextConfig.compress = true;

// Compiler options
nextConfig.compiler = {
  removeConsole:
    process.env.NODE_ENV === 'production'
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
};

// Performance and security headers
nextConfig.headers = async () => {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https: https://uploadthing.com https://api.uploadthing.com https://utfs.io wss://uploadthing.com https://*.clerk.accounts.dev; frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev;",
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
      source: '/api/products/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value:
            'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/api/categories/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value:
            'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/api/search/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value:
            'public, max-age=60, s-maxage=120, stale-while-revalidate=3600',
        },
      ],
    },
  ];
};

// Only enable redirects in production
if (process.env.NODE_ENV === 'production') {
  const redirects: NextConfig['redirects'] = async () => [
    {
      source: '/legal',
      destination: '/legal/privacy',
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

// Enable Sentry for all environments where DSN is provided
try {
  nextConfig = withSentry(nextConfig);
} catch (_error) {}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default withCMS(nextConfig);
