import { Button } from '@repo/design-system/components';
import { Heart, Eye, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';
import { logError } from '@repo/observability/server';

import { formatCurrency } from '@/lib/utils/currency';

export const TrendingProducts = async () => {
  try {
    const cacheService = getCacheService({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
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
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    });

      transformedProducts = trendingProducts.map((product) => ({
        id: product.id,
        title: product.title,
        brand: product.brand || 'Unknown',
        price: product.price,
        originalPrice: null, // We don't have this in our schema
        condition: product.condition,
        size: product.size || 'One Size',
        images: product.images.map(img => img.imageUrl).filter(Boolean),
        seller: {
          name: product.seller ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous',
          rating: product.seller?.averageRating || 0,
          location: product.seller?.location || 'Unknown'
        },
        likes: product._count.favorites,
        views: product.views,
        timeAgo: '2 hours ago' // Simplified for now
      }));

      // Cache the transformed products
      await cacheService.cacheTrendingProducts(transformedProducts);
    }

    if (transformedProducts.length === 0) {
      return (
        <section className="w-full py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500">No trending products found</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
              Trending Now
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              The most popular items everyone's talking about
            </p>
          </div>

          {/* Trending Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transformedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="aspect-[4/3] overflow-hidden">
                  {product.images[0] && !product.images[0].includes('picsum.photos') && !product.images[0].includes('placehold.co') ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-105">
                      <div className="text-center">
                        <div className="text-xl font-bold mb-1">🔥</div>
                        <div className="text-lg font-semibold">{product.brand}</div>
                        <div className="text-xs opacity-80">{product.condition}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Heart Button */}
                  <button 
                    className="absolute top-4 right-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                    aria-label="Add to favorites"
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Trending Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-medium text-white">
                      🔥 TRENDING
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-2">
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                      {product.brand}
                    </p>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl text-gray-900">{formatCurrency(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      Size {product.size}
                    </span>
                  </div>

                  {/* Seller Info */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">by {product.seller.name}</span>
                      {product.seller.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-500">{product.seller.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {product.seller.location}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
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
              size="lg" 
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              asChild
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
      <section className="w-full py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Unable to load trending products</p>
        </div>
      </section>
    );
  }
};