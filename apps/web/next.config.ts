import { env } from '@/env';
import { withCMS } from '@repo/cms/next-config';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = withToolbar(withLogging(config));

// Override images config to include all needed domains
nextConfig.images = {
  formats: ['image/avif', 'image/webp'],
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

// Suppress require-in-the-middle warnings from Sentry
nextConfig.webpack = (config, { isServer }) => {
  if (isServer) {
    config.ignoreWarnings = [
      { module: /require-in-the-middle/ },
    ];
  }
  return config;
};

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

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default withCMS(nextConfig);
