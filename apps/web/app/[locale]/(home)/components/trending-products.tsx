import { getCacheService } from '@repo/database';
import { database } from '@repo/database';
import { Button } from '@repo/ui/components';
import { logError } from '@repo/observability/server';
import { Eye, Heart, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { formatCurrency } from '@/lib/utils/currency';

type TransformedProduct = {
  id: string;
  title: string;
  brand: string;
  price: string;
  originalPrice: null;
  condition: string;
  size: string;
  images: string[];
  seller: {
    name: string;
    rating: number;
    location: string;
  };
  likes: number;
  views: number;
  timeAgo: string;
};

type ProductWithRelations = {
  id: string;
  title: string;
  brand: string | null;
  price: string;
  condition: string;
  size: string | null;
  views: number;
  images: {
    imageUrl: string | null;
  }[];
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    location: string | null;
    averageRating: number | null;
  } | null;
  _count: {
    favorites: number;
  };
};

export const TrendingProducts = async () => {
  try {
    const cacheService = getCacheService({
      url:
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.REDIS_URL ||
        'redis://localhost:6379',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
      defaultTTL: 1800, // 30 minutes
    });

    // Try to get trending products from cache first
    let transformedProducts = await cacheService.getTrendingProducts();

    if (!transformedProducts) {
      // Fetch trending products from database
      const trendingProducts = await database.product.findMany({
        where: {
          status: 'AVAILABLE',
        },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              location: true,
              averageRating: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      });

      transformedProducts = trendingProducts.map(
        (product): TransformedProduct => ({
          id: product.id,
          title: product.title,
          brand: product.brand || 'Unknown',
          price: product.price.toString(),
          originalPrice: null, // We don't have this in our schema
          condition: product.condition,
          size: product.size || 'One Size',
          images: product.images
            .map((img) => img.imageUrl)
            .filter((url): url is string => Boolean(url)),
          seller: {
            name: product.seller
              ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() ||
                'Anonymous'
              : 'Anonymous',
            rating: product.seller?.averageRating || 0,
            location: product.seller?.location || 'Unknown',
          },
          likes: product._count.favorites,
          views: product.views,
          timeAgo: '2 hours ago', // Simplified for now
        })
      );

      // Cache the transformed products
      if (transformedProducts) {
        await cacheService.cacheTrendingProducts(transformedProducts);
      }
    }

    if (!transformedProducts || transformedProducts.length === 0) {
      return (
        <section className="w-full bg-gray-50 py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500">No trending products found</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
              Trending Now
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              The most popular items everyone's talking about
            </p>
          </div>

          {/* Trending Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transformedProducts.map((product) => (
              <Link
                className="group hover:-translate-y-1 relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
                href={`/product/${product.id}`}
                key={product.id}
              >
                {/* Image Container */}
                <div className="aspect-[4/3] overflow-hidden">
                  {product.images[0] &&
                  !product.images[0].includes('picsum.photos') &&
                  !product.images[0].includes('placehold.co') ? (
                    <Image
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      height={300}
                      src={product.images[0]}
                      width={400}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 text-white transition-transform duration-500 group-hover:scale-105">
                      <div className="text-center">
                        <div className="mb-1 font-bold text-xl">🔥</div>
                        <div className="font-semibold text-lg">
                          {product.brand}
                        </div>
                        <div className="text-xs opacity-80">
                          {product.condition}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Heart Button */}
                  <button
                    aria-label="Add to favorites"
                    className="absolute top-4 right-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Trending Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 font-medium text-white text-xs">
                      🔥 TRENDING
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-2">
                    <p className="font-medium text-orange-600 text-xs uppercase tracking-wide">
                      {product.brand}
                    </p>
                    <h3 className="line-clamp-2 font-semibold text-gray-900 text-lg transition-colors group-hover:text-orange-600">
                      {product.title}
                    </h3>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xl">
                        {formatCurrency(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-500 text-sm line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 text-xs">
                      Size {product.size}
                    </span>
                  </div>

                  {/* Seller Info */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">
                        by {product.seller.name}
                      </span>
                      {product.seller.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-500 text-xs">
                            {product.seller.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin className="h-3 w-3" />
                      {product.seller.location}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{product.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{product.views}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs">
                      {product.condition}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Button
              asChild
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              size="lg"
            >
              <Link href="/products?sort=trending">
                View All Trending
                <Eye className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    logError('Failed to fetch trending products:', error);
    return (
      <section className="w-full bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Unable to load trending products</p>
        </div>
      </section>
    );
  }
};
