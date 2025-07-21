import { withCMS } from '@repo/cms/next-config';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';
import { env } from '@/env';

let nextConfig: NextConfig = withToolbar(config);

// Performance optimizations
nextConfig.experimental = {
  ...nextConfig.experimental,
  optimizePackageImports: [
    '@repo/design-system',
    '@repo/database',
    'lucide-react',
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
nextConfig.webpack = (config, { isServer }) => {
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

  return config;
};

// Fix Prisma bundling for Vercel with binary engine
nextConfig.serverExternalPackages = ['@prisma/engines'];

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
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https: https://uploadthing.com https://api.uploadthing.com https://utfs.io wss://uploadthing.com https://*.clerk.accounts.dev; frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev;",
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
          value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/api/categories/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/api/search/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, s-maxage=120, stale-while-revalidate=3600',
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
