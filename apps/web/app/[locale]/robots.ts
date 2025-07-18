import type { MetadataRoute } from 'next';
import { env } from '@/env';

// Get base URL with fallback for development
const getBaseUrl = () => {
  // Production URL from Vercel
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    const protocol = env.VERCEL_PROJECT_PRODUCTION_URL.startsWith('https')
      ? 'https'
      : 'http';
    return `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // Fallback to environment variable or localhost
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all crawlers to access public content
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Disable crawling of private/sensitive areas
          '/api/', // API endpoints
          '/admin/', // Admin areas
          '/profile/', // User profile pages (private)
          '/checkout/', // Checkout process
          '/cart/', // Shopping cart
          '/favorites/', // User favorites
          '/messages/', // Private messaging
          '/orders/', // Order history
          '/selling/', // Seller dashboard
          '/buying/', // Buyer dashboard
          '/webhooks/', // Webhook endpoints
          '/*?*', // URLs with query parameters (to reduce duplicate content)
          '/search?*', // Search result pages with parameters
          '/_next/', // Next.js internal files
          '/static/', // Static assets
        ],
      },

      // Specific rules for major search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/checkout/',
          '/cart/',
          '/favorites/',
          '/messages/',
          '/orders/',
          '/selling/',
          '/buying/',
          '/webhooks/',
        ],
        crawlDelay: 1, // 1 second delay between requests
      },

      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/checkout/',
          '/cart/',
          '/favorites/',
          '/messages/',
          '/orders/',
          '/selling/',
          '/buying/',
          '/webhooks/',
        ],
        crawlDelay: 2, // 2 second delay for Bing
      },

      // Block aggressive crawlers
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
        disallow: '/',
      },

      // Allow specific crawlers for social media previews
      {
        userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot'],
        allow: [
          '/',
          '/product/',
          '/products',
          '/blog/',
          '/men',
          '/women',
          '/kids',
          '/unisex',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/checkout/',
          '/cart/',
          '/favorites/',
          '/messages/',
          '/orders/',
          '/selling/',
          '/buying/',
          '/webhooks/',
        ],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,

    // Additional host directive for clarity
    host: baseUrl,
  };
}
