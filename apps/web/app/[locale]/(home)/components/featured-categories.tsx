import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { Button } from '@repo/design-system/components';
import { logError } from '@repo/observability/server';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type TransformedCategory = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  href: string;
  color: string;
  count: string;
};

type CategoryWithRelations = {
  id: string;
  name: string;
  slug: string | null;
  _count: {
    Product: number;
  };
  Product: {
    images: {
      imageUrl: string | null;
    }[];
  }[];
};

const colorSchemes = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-violet-500',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-yellow-500',
];

export const FeaturedCategories = async () => {
  const cache = getCacheService({
    url:
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.REDIS_URL ||
      'redis://localhost:6379',
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

        return categories.map(
          (
            category: CategoryWithRelations,
            index: number
          ): TransformedCategory => ({
            id: category.id,
            name: category.name,
            description: `Discover ${category.name.toLowerCase()}`,
            image: category.Product[0]?.images[0]?.imageUrl || null,
            href: `/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`,
            color:
              colorSchemes[index % colorSchemes.length] ||
              'from-gray-500 to-gray-600',
            count: `${category._count.Product.toLocaleString()} items`,
          })
        );
      },
      600, // Cache for 10 minutes
      ['categories'] // Cache tags
    );

    if (transformedCategories.length === 0) {
      return (
        <section className="w-full py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">No categories found</p>
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
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Find exactly what you're looking for in our curated fashion
              categories
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {transformedCategories.map((category: TransformedCategory) => (
              <Link
                className="group hover:-translate-y-1 relative overflow-hidden rounded-2xl bg-background shadow-lg transition-all duration-300 hover:shadow-xl"
                href={category.href}
                key={category.id}
              >
                {/* Background Image */}
                <div className="aspect-[4/5] overflow-hidden">
                  {category.image ? (
                    <Image
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      height={500}
                      src={category.image}
                      width={400}
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${category.color} flex items-center justify-center text-background transition-transform duration-500 group-hover:scale-110`}
                    >
                      <div className="text-center">
                        <div className="mb-2 font-bold text-4xl">
                          {category.name.charAt(0)}
                        </div>
                        <div className="text-sm opacity-80">
                          {category.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20 transition-opacity duration-300 group-hover:opacity-30`}
                />

                {/* Content */}
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-background">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="mb-1 font-bold text-xl">
                        {category.name}
                      </h3>
                      <p className="mb-2 text-background/80 text-sm">
                        {category.description}
                      </p>
                      <span className="text-background/60 text-xs">
                        {category.count}
                      </span>
                    </div>
                    <div className="rounded-[var(--radius-full)] bg-background/20 p-2 backdrop-blur-sm transition-all duration-300 group-hover:bg-background/30">
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
              asChild
              className="gap-2 border-border px-8 py-6 text-lg hover:bg-muted"
              size="lg"
              variant="outline"
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
          <p className="text-muted-foreground">Unable to load categories</p>
        </div>
      </section>
    );
  }
};
