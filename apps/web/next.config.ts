import { env } from '@/env';
import { withCMS } from '@repo/cms/next-config';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = withToolbar(config);

// Add experimental features for optimization
nextConfig.experimental = {
  ...nextConfig.experimental,
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    '@repo/design-system',
  ],
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

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

// Suppress require-in-the-middle warnings from Sentry and optimize bundles
nextConfig.webpack = (config, { isServer, webpack }) => {
  if (isServer) {
    config.ignoreWarnings = [
      { module: /require-in-the-middle/ },
      { module: /@opentelemetry\/instrumentation/ },
    ];
  }

  // Fix for edge runtime - check if the module is for edge runtime
  if (!isServer) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@opentelemetry/api': false,
      '@opentelemetry/instrumentation': false,
      'perf_hooks': false,
      'fs': false,
      'net': false,
      'tls': false,
      'crypto': false,
    };
  }

  // Bundle optimization
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      ...config.optimization.splitChunks,
      chunks: 'all',
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        // Separate vendor chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
          maxSize: 244000, // ~240KB
        },
        // Stripe chunk
        stripe: {
          test: /[\\/]node_modules[\\/]@stripe[\\/]/,
          name: 'stripe',
          chunks: 'all',
          priority: 30,
        },
        // UI libraries chunk
        ui: {
          test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
          name: 'ui-libs',
          chunks: 'all',
          priority: 25,
        },
        // React chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 40,
        },
      },
    },
  };

  // Reduce bundle size with tree shaking
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    })
  );

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

// Enable Sentry for all environments where DSN is provided
try {
  nextConfig = withSentry(nextConfig);
} catch (error) {
  console.warn('Sentry configuration failed, continuing without Sentry:', error);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default withCMS(nextConfig);
