import fs from 'node:fs';
import { blog, legal } from '@repo/cms';
import { database } from '@repo/database';
import { log, logError, parseError } from '@repo/observability/server';
import type { MetadataRoute } from 'next';
import { env } from '@/env';

const appFolders = fs.readdirSync('app', { withFileTypes: true });
const pages = appFolders
  .filter((file) => file.isDirectory())
  .filter((folder) => !folder.name.startsWith('_'))
  .filter((folder) => !folder.name.startsWith('('))
  .map((folder) => folder.name);

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

// Conditionally fetch CMS data with fallbacks
const getBlogSlugs = async (): Promise<
  Array<{ slug: string; lastModified: Date }>
> => {
  try {
    const posts = await blog.getPosts();
    return posts.map((post) => ({
      slug: post._slug,
      lastModified: new Date((post as any)._sys?.lastModifiedAt || Date.now()),
    }));
  } catch (error) {
    log.warn(`Failed to fetch blog posts for sitemap: ${parseError(error)}`);
    return [];
  }
};

const getLegalSlugs = async (): Promise<
  Array<{ slug: string; lastModified: Date }>
> => {
  try {
    const posts = await legal.getPosts();
    return posts.map((post) => ({
      slug: post._slug,
      lastModified: new Date((post as any)._sys?.lastModifiedAt || Date.now()),
    }));
  } catch (error) {
    log.warn(`Failed to fetch legal posts for sitemap: ${parseError(error)}`);
    return [];
  }
};

// Fetch product data for sitemap
const getProductUrls = async (): Promise<
  Array<{ id: string; lastModified: Date }>
> => {
  try {
    const products = await database.product.findMany({
      where: {
        status: 'AVAILABLE', // Only include available products
      },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5000, // Limit to prevent sitemap from being too large
    });

    return products.map((product) => ({
      id: product.id,
      lastModified: product.createdAt,
    }));
  } catch (error) {
    log.warn(`Failed to fetch products for sitemap: ${parseError(error)}`);
    return [];
  }
};

// Fetch category data for sitemap
const getCategoryUrls = async (): Promise<
  Array<{ slug: string; name: string; lastModified: Date }>
> => {
  try {
    const categories = await database.category.findMany({
      select: {
        slug: true,
        name: true,
        _count: {
          select: {
            Product: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
      where: {
        Product: {
          some: {
            status: 'AVAILABLE',
          },
        },
      },
    });

    return categories
      .filter((category) => category._count.Product > 0) // Only include categories with products
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        lastModified: new Date(),
      }));
  } catch (error) {
    log.warn(`Failed to fetch categories for sitemap: ${parseError(error)}`);
    return [];
  }
};

// Fetch user profile URLs (for public seller profiles)
const getUserProfileUrls = async (): Promise<
  Array<{ id: string; lastModified: Date }>
> => {
  try {
    const users = await database.user.findMany({
      where: {
        Product: {
          some: {
            status: 'AVAILABLE', // Only users with available listings
          },
        },
      },
      select: {
        id: true,
        joinedAt: true,
      },
      take: 1000, // Limit to prevent sitemap from being too large
    });

    return users.map((user) => ({
      id: user.id,
      lastModified: user.joinedAt,
    }));
  } catch (error) {
    log.warn(`Failed to fetch user profiles for sitemap: ${parseError(error)}`);
    return [];
  }
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    // Fetch all dynamic content in parallel
    const [blogs, legals, products, categories, userProfiles] =
      await Promise.all([
        getBlogSlugs(),
        getLegalSlugs(),
        getProductUrls(),
        getCategoryUrls(),
        getUserProfileUrls(),
      ]);

    const sitemapEntries: MetadataRoute.Sitemap = [
      // Homepage - highest priority
      {
        url: `${baseUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },

      // Main static pages - high priority
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },

      // Category pages - high priority for SEO
      ...categories.map((category) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(category.name)}`,
        lastModified: category.lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),

      // Gender-specific category pages
      {
        url: `${baseUrl}/men`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/women`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/kids`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/unisex`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },

      // Other static pages
      ...pages
        .filter(
          (page) =>
            !['men', 'women', 'kids', 'unisex', 'products', 'search'].includes(
              page
            )
        )
        .map((page) => ({
          url: `${baseUrl}/${page}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })),

      // Blog posts
      ...blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),

      // Legal pages
      ...legals.map((legal) => ({
        url: `${baseUrl}/legal/${legal.slug}`,
        lastModified: legal.lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),

      // Individual product pages
      ...products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),

      // User profile pages (seller profiles)
      ...userProfiles.map((user) => ({
        url: `${baseUrl}/seller/${user.id}`,
        lastModified: user.lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),

      // Popular search terms (static for now, could be dynamic)
      {
        url: `${baseUrl}/search?q=vintage`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/search?q=designer`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/search?q=sneakers`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/search?q=dresses`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      },
    ];

    log.info(`Generated sitemap with ${sitemapEntries.length} URLs`);
    return sitemapEntries;
  } catch (error) {
    logError('Error generating sitemap:', error);

    // Fallback minimal sitemap
    return [
      {
        url: `${baseUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
};

export default sitemap;
