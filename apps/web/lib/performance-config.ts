// Performance optimization configuration

export const performanceConfig = {
  // Image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Font optimization
  fonts: {
    // Preload critical fonts
    preload: [
      {
        href: '/fonts/inter-var.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
    // Font display strategy
    display: 'swap',
  },

  // Prefetch configuration
  prefetch: {
    // Prefetch links on hover
    onHover: true,
    // Prefetch delay in ms
    delay: 50,
    // Max concurrent prefetches
    maxConcurrent: 2,
  },

  // Bundle optimization
  optimization: {
    // Split chunks configuration
    splitChunks: {
      // Chunk for vendor libraries
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        priority: 10,
      },
      // Chunk for common components
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true,
      },
    },
  },

  // Resource hints
  resourceHints: {
    // DNS prefetch for external domains
    dnsPrefetch: [
      'https://clerk.com',
      'https://stripe.com',
      'https://upstash.io',
    ],
    // Preconnect to critical origins
    preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  },

  // Lazy loading configuration
  lazyLoading: {
    // Components to lazy load
    components: [
      'ProductRecommendations',
      'CustomerReviews',
      'NewsletterSignup',
      'FooterLinks',
    ],
    // Intersection observer options
    intersectionObserver: {
      rootMargin: '50px',
      threshold: 0,
    },
  },

  // Critical CSS configuration
  criticalCSS: {
    // Inline critical CSS
    inline: true,
    // Extract critical CSS for these pages
    pages: ['/', '/products', '/search'],
  },
};

// Helper function to generate responsive image sizes
export function generateImageSizes(baseWidth: number): string {
  const sizes = [
    `(max-width: 640px) ${Math.round(baseWidth * 0.9)}vw`,
    `(max-width: 1024px) ${Math.round(baseWidth * 0.5)}vw`,
    `${Math.round(baseWidth * 0.33)}vw`,
  ];
  return sizes.join(', ');
}

// Helper function to calculate priority for resource loading
export function shouldPrioritizeResource(
  index: number,
  viewport: 'mobile' | 'desktop'
): boolean {
  // Prioritize first N items based on viewport
  const priorityCount = viewport === 'mobile' ? 4 : 8;
  return index < priorityCount;
}

// Helper to generate blur data URL for images
export function generateBlurDataURL(dominantColor = '#f3f4f6'): string {
  const svg = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${dominantColor}"/>
    </svg>
  `;
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
