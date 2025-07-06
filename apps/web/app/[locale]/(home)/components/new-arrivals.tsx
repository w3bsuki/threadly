import { Button } from '@repo/design-system/components';
import { Clock, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';
import { logError } from '@repo/observability/server';

import { formatCurrency } from '@/lib/utils/currency';

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const NewArrivals = async (): Promise<JSX.Element> => {
  const cache = getCacheService({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
  });
  
  try {
    // Use cache-aside pattern for new arrivals
    const transformedArrivals = await cache.remember(
      'new-arrivals',
      async () => {
        // Fetch recent products
        const newArrivals = await database.product.findMany({
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

        return newArrivals.map((product) => ({
          id: product.id,
          title: product.title,
          brand: product.brand || 'Unknown',
          price: product.price,
          condition: product.condition,
          size: product.size || 'One Size',
          images: product.images.map(img => img.imageUrl).filter(Boolean),
          seller: product.seller ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous',
          timeAgo: formatTimeAgo(product.createdAt),
          isNew: (new Date().getTime() - product.createdAt.getTime()) < (24 * 60 * 60 * 1000), // Less than 24 hours old
        }));
      },
      300, // Cache for 5 minutes
      ['products'] // Cache tags
    );

    if (transformedArrivals.length === 0) {
      return (
        <section className="w-full py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500">No new arrivals found</p>
          </div>
        </section>
      );
    }
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
              Fresh Finds
            </h2>
            <p className="max-w-2xl text-lg text-gray-600">
              Just landed! The latest additions to our marketplace
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" asChild>
            <Link href="/products?sort=newest">
              View All New
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* New Arrivals Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {transformedArrivals.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="aspect-[4/5] overflow-hidden">
                {item.images[0] && !item.images[0].includes('picsum.photos') && !item.images[0].includes('placehold.co') ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    width={400}
                    height={500}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white transition-transform duration-700 group-hover:scale-110">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{item.brand}</div>
                      <div className="text-sm opacity-80">{item.condition}</div>
                    </div>
                  </div>
                )}
                
                {/* New Badge */}
                {item.isNew && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      NEW
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

                {/* Time Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    {item.timeAgo}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-2">
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    {item.brand}
                  </p>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold text-xl text-gray-900">{formatCurrency(Number(item.price))}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    Size {item.size}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">by {item.seller}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
            <Link href="/products?sort=newest">
              View All New Arrivals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
  } catch (error) {
    logError('Failed to fetch new arrivals:', error);
    return (
      <section className="w-full py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Unable to load new arrivals</p>
        </div>
      </section>
    );
  }
}; 