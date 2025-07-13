import { Button } from '@repo/design-system/components';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';
import { logError } from '@repo/observability/server';

const colorSchemes = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-indigo-500', 
  'from-purple-500 to-violet-500',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-yellow-500'
];

export const FeaturedCategories = async () => {
  const cache = getCacheService({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
  });
  
  try {
    // Use cache-aside pattern for featured categories
    const transformedCategories = await cache.remember(
      'featured-categories',
      async () => {
        // Fetch categories with product counts and sample images
        const categories = await database.category.findMany({
      where: {
        parentId: null, // Only top-level categories
      },
      include: {
        _count: {
          select: {
            Product: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
        Product: {
          where: {
            status: 'AVAILABLE',
          },
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
          },
          take: 1, // Get one product for the category image
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 6, // Limit to 6 featured categories
    });

        return categories.map((category, index) => ({
          id: category.id,
          name: category.name,
          description: `Discover ${category.name.toLowerCase()}`,
          image: category.products[0]?.images[0]?.imageUrl || null,
          href: `/${category.slug}`,
          color: colorSchemes[index % colorSchemes.length],
          count: `${category._count.products.toLocaleString()} items`
        }));
      },
      600, // Cache for 10 minutes
      ['categories'] // Cache tags
    );

    if (transformedCategories.length === 0) {
      return (
        <section className="w-full py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500">No categories found</p>
          </div>
        </section>
      );
    }
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
            Shop by Category
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Find exactly what you're looking for in our curated fashion categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {transformedCategories.map((category: any) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Background Image */}
              <div className="aspect-[4/5] overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={400}
                    height={500}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${category.color} flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-110`}>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{category.name.charAt(0)}</div>
                      <div className="text-sm opacity-80">{category.name}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20 transition-opacity duration-300 group-hover:opacity-30`} />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="mb-1 font-bold text-xl">{category.name}</h3>
                    <p className="mb-2 text-sm text-white/80">{category.description}</p>
                    <span className="text-xs text-white/60">{category.count}</span>
                  </div>
                  <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 border-gray-200 px-8 py-6 text-lg hover:bg-gray-50"
            asChild
          >
            <Link href="/products">
              View All Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
  } catch (error) {
    logError('Failed to fetch categories:', error);
    return (
      <section className="w-full py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Unable to load categories</p>
        </div>
      </section>
    );
  }
}; 