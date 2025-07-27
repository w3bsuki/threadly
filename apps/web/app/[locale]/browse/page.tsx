import { database } from '@repo/database';
import type { Category, Product, ProductImage, User } from '@repo/database';
import { Badge, Card, CardContent } from '@repo/design-system/components';
import { getDictionary } from '@repo/internationalization';
import { Package, Star, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '../products/components/product-grid';
import { AvatarImage } from '../components/optimized-image';
import { cache } from 'react';

export const revalidate = 300; // 5 minutes

const getTrendingProducts = cache(async () => {
  return await database.product.findMany({
    where: { status: 'AVAILABLE' },
    include: {
      images: { take: 1, orderBy: { displayOrder: 'asc' } },
      seller: { select: { firstName: true, lastName: true, id: true } },
      category: { select: { name: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
    take: 12,
  });
});

const getPopularCategories = cache(async () => {
  return await database.category.findMany({
    include: {
      _count: { select: { Product: true } },
    },
    orderBy: {
      Product: { _count: 'desc' },
    },
    take: 8,
  });
});

const getTopSellers = cache(async () => {
  return await database.user.findMany({
    where: {
      Product: { some: { status: 'AVAILABLE' } },
    },
    include: {
      _count: {
        select: {
          Product: { where: { status: 'AVAILABLE' } },
          reviewsReceived: true,
        },
      },
    },
    orderBy: {
      Product: { _count: 'desc' },
    },
    take: 6,
  });
});

export const metadata: Metadata = {
  title: 'Browse Products - Threadly',
  description:
    'Discover trending fashion items and popular sellers on Threadly marketplace.',
};

export default async function BrowsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  // Fetch data using cached functions for better performance
  const [trendingProducts, popularCategories, topSellers] = await Promise.all([
    getTrendingProducts(),
    getPopularCategories(),
    getTopSellers(),
  ]);

  // Recent activity stats
  const stats = await database.$transaction([
    database.product.count({ where: { status: 'AVAILABLE' } }),
    database.user.count(),
    database.order.count({ where: { status: 'DELIVERED' } }),
  ]);

  const [totalProducts, totalUsers, completedOrders] = stats;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 text-center lg:mb-12">
          <h1 className="mb-3 font-bold text-3xl text-foreground lg:mb-4 lg:text-4xl">
            Browse Threadly
          </h1>
          <p className="mx-auto max-w-2xl px-4 text-muted-foreground text-lg lg:text-xl">
            Discover unique fashion finds from trusted sellers in our community
            marketplace
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:mb-12 lg:grid-cols-3 lg:gap-6">
          <Card className="border-0 bg-blue-50 shadow-sm">
            <CardContent className="p-4 text-center lg:p-6">
              <Package className="mx-auto mb-2 h-6 w-6 text-blue-600 lg:h-8 lg:w-8" />
              <div className="font-bold text-foreground text-xl lg:text-2xl">
                {totalProducts.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs lg:text-sm">
                Items Available
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-green-50 shadow-sm">
            <CardContent className="p-4 text-center lg:p-6">
              <Users className="mx-auto mb-2 h-6 w-6 text-green-600 lg:h-8 lg:w-8" />
              <div className="font-bold text-foreground text-xl lg:text-2xl">
                {totalUsers.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs lg:text-sm">
                Community Members
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 border-0 bg-yellow-50 shadow-sm lg:col-span-1">
            <CardContent className="p-4 text-center lg:p-6">
              <Star className="mx-auto mb-2 h-6 w-6 text-yellow-600 lg:h-8 lg:w-8" />
              <div className="font-bold text-foreground text-xl lg:text-2xl">
                {completedOrders.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs lg:text-sm">
                Happy Customers
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Categories */}
        <section className="mb-8 lg:mb-12">
          <div className="mb-4 flex items-center gap-2 lg:mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-xl lg:text-2xl">
              Popular Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {popularCategories.map((category: Category & { _count: { Product: number } }) => (
              <Link
                href={`/products?category=${category.slug}`}
                key={category.id}
              >
                <Card className="border-0 bg-background shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                  <CardContent className="p-3 text-center lg:p-4">
                    <h3 className="font-medium text-foreground text-sm lg:text-base">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-muted-foreground text-xs lg:text-sm">
                      {category._count.Product} items
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center font-medium text-blue-600 text-sm transition-colors hover:text-blue-700"
            >
              Browse All Categories →
            </Link>
          </div>
        </section>

        {/* Trending Products */}
        <section className="mb-8 lg:mb-12">
          <div className="mb-4 flex items-center justify-between lg:mb-6">
            <h2 className="font-semibold text-xl lg:text-2xl">
              Trending Items
            </h2>
            <Link
              className="font-medium text-blue-600 text-sm transition-colors hover:text-blue-700 lg:text-base"
              href="/products?sort=popular"
            >
              View all trending →
            </Link>
          </div>

          <ProductGrid
            dictionary={dictionary}
            products={trendingProducts.map((product: Product & {
              images: ProductImage[];
              seller: Pick<User, 'firstName' | 'lastName' | 'id'>;
              category: { name: string } | null;
              _count: { favorites: number };
            }) => ({
              ...product,
              price: Number(product.price),
              category: product.category?.name || 'Other',
              brand: product.brand || undefined,
              images: product.images.map((img: ProductImage) => ({
                ...img,
                alt: img.alt || undefined,
              })),
              seller: {
                ...product.seller,
                firstName: product.seller.firstName || '',
              },
            }))}
          />
        </section>

        {/* Top Sellers */}
        <section>
          <h2 className="mb-4 font-semibold text-xl lg:mb-6 lg:text-2xl">
            Top Sellers
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {topSellers.map((seller: User & {
              _count: {
                Product: number;
                reviewsReceived: number;
              };
            }) => (
              <Link href={`/profile/${seller.id}`} key={seller.id}>
                <Card className="border-0 bg-background shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                  <CardContent className="p-4 lg:p-6">
                    <div className="mb-3 flex items-center gap-3 lg:mb-4 lg:gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-accent lg:h-12 lg:w-12">
                        {seller.imageUrl ? (
                          <AvatarImage
                            alt={`${seller.firstName} ${seller.lastName}`}
                            className="h-10 w-10 lg:h-12 lg:w-12"
                            src={seller.imageUrl}
                            size={40}
                          />
                        ) : (
                          <span className="font-semibold text-muted-foreground text-sm lg:text-lg">
                            {(
                              seller.firstName?.[0] ||
                              seller.lastName?.[0] ||
                              'U'
                            ).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-foreground text-sm lg:text-base">
                          {seller.firstName} {seller.lastName}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs lg:gap-4 lg:text-sm">
                          <span>{seller._count.Product} items</span>
                          {seller.averageRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{seller.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Badge className="text-xs" variant="secondary">
                        {seller._count.reviewsReceived} reviews
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
