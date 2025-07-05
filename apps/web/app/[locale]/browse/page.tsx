import { database } from '@repo/database';
import { Metadata } from 'next';
import { ProductGrid } from '../products/components/product-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import Link from 'next/link';
import { TrendingUp, Users, Package, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browse Products - Threadly',
  description: 'Discover trending fashion items and popular sellers on Threadly marketplace.',
};

export default async function BrowsePage() {
  // Fetch trending products
  const trendingProducts = await database.product.findMany({
    where: { status: 'AVAILABLE' },
    include: {
      images: { take: 1, orderBy: { displayOrder: 'asc' } },
      seller: { select: { firstName: true, lastName: true, id: true } },
      category: { select: { name: true } },
      _count: { select: { favorites: true } }
    },
    orderBy: [
      { views: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 12
  });

  // Fetch popular categories
  const popularCategories = await database.category.findMany({
    include: {
      _count: { select: { products: true } }
    },
    orderBy: {
      products: { _count: 'desc' }
    },
    take: 8
  });

  // Fetch top sellers
  const topSellers = await database.user.findMany({
    where: {
      listings: { some: { status: 'AVAILABLE' } }
    },
    include: {
      _count: { 
        select: { 
          listings: { where: { status: 'AVAILABLE' } },
          receivedReviews: true 
        } 
      }
    },
    orderBy: {
      listings: { _count: 'desc' }
    },
    take: 6
  });

  // Recent activity stats
  const stats = await database.$transaction([
    database.product.count({ where: { status: 'AVAILABLE' } }),
    database.user.count(),
    database.order.count({ where: { status: 'DELIVERED' } }),
  ]);

  const [totalProducts, totalUsers, completedOrders] = stats;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Threadly
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover unique fashion finds from trusted sellers in our community marketplace
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalProducts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Items Available</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Community Members</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{completedOrders.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Categories */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-semibold">Popular Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCategories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {category._count.products} items
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Trending Items</h2>
            <Link 
              href="/products?sort=popular" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all trending →
            </Link>
          </div>
          
          <ProductGrid products={trendingProducts.map(product => ({
            ...product,
            price: Number(product.price),
            category: product.category?.name || 'Other',
            brand: product.brand || undefined,
            images: product.images.map(img => ({
              ...img,
              alt: img.alt || undefined
            })),
            seller: {
              ...product.seller,
              firstName: product.seller.firstName || ''
            }
          }))} />
        </section>

        {/* Top Sellers */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Top Sellers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSellers.map((seller) => (
              <Link key={seller.id} href={`/profile/${seller.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {seller.imageUrl ? (
                          <img
                            src={seller.imageUrl}
                            alt={`${seller.firstName} ${seller.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">
                            {(seller.firstName?.[0] || seller.lastName?.[0] || 'U').toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {seller.firstName} {seller.lastName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{seller._count.listings} items</span>
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
                      <Badge variant="secondary">
                        {seller._count.receivedReviews} reviews
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