import type { NextConfig } from 'next';

/**
 * Performance-optimized Next.js configuration
 * Based on Threadly best practices
 */
export const performanceConfig: Partial<NextConfig> = {
  // Enable React Compiler for faster builds and smaller bundles
  experimental: {
    // Enable Partial Prerendering for improved performance (requires Next.js canary)
    // ppr: true,

    // Enable React Compiler for automatic memoization and optimization
    // reactCompiler: true, // Disabled - requires additional setup and testing

    // Optimize package imports for common libraries
    optimizePackageImports: [
      '@repo/design-system',
      '@repo/auth',
      '@repo/database',
      'lucide-react',
      'date-fns',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      // Additional heavy libraries for better tree shaking
      '@clerk/nextjs',
      '@clerk/shared',
      '@sentry/nextjs',
      '@sentry/core',
      'zustand',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'es-toolkit',
      'd3-shape',
      'react-remove-scroll',
    ],
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'resend',
    'pusher',
    'stripe',
  ],

  // Optimize production builds
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  // Compiler options for better performance
  compiler: {
    // Remove console logs in production
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
    ],
  },

  // Headers for caching and security
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
        ],
      },
      // Cache static assets
      {
        source: '/fonts/:path*',
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
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack(config, { isServer, dev }) {
    // Only apply optimizations in production
    if (!dev) {
      // Optimize chunks
      // Temporarily disable aggressive chunking to fix build error
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };

      // Minimize bundle size
      config.optimization.minimize = true;
    }

    return config;
  },
};

/**
 * Merge performance config with existing config
 */
export function withPerformance(config: NextConfig): NextConfig {
  return {
    ...config,
    ...performanceConfig,
    experimental: {
      ...config.experimental,
      ...performanceConfig.experimental,
    },
    images: {
      ...config.images,
      ...performanceConfig.images,
    },
    webpack(webpackConfig, options) {
      // Apply base webpack config
      let finalConfig = webpackConfig;

      if (config.webpack) {
        finalConfig = config.webpack(webpackConfig, options);
      }

      // Apply performance webpack config
      if (performanceConfig.webpack) {
        finalConfig = performanceConfig.webpack(finalConfig, options);
      }

      return finalConfig;
    },
  };
}
