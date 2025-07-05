import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Heart, Package, ExternalLink, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const title = 'My Favorites';
const description = 'Items you have saved and loved';

export const metadata: Metadata = {
  title,
  description,
};

const FavoritesPage = async () => {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Get user's favorite products
  const favorites = await database.favorite.findMany({
    where: {
      userId: dbUser.id,
    },
    include: {
      product: {
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          images: {
            orderBy: {
              displayOrder: 'asc',
            },
            take: 1,
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const getSellerName = (seller: any) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller.email?.split('@')[0] || 'Unknown Seller';
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <>
      <Header pages={['Dashboard', 'Buying', 'Favorites']} page="Favorites" />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} you've saved
            </p>
          </div>
          {favorites.length > 0 && (
            <Button asChild>
              <Link href="/browse">
                <Package className="h-4 w-4 mr-2" />
                Browse More
              </Link>
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start browsing and save items you love by clicking the heart icon
              </p>
              <Button asChild>
                <Link href="/browse">
                  <Package className="h-4 w-4 mr-2" />
                  Start Browsing
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group hover:shadow-md transition-shadow">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  {favorite.product.images[0] ? (
                    <Image
                      src={favorite.product.images[0].imageUrl}
                      alt={favorite.product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                      <Package className="h-12 w-12 text-white opacity-80" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={favorite.product.status === 'AVAILABLE' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {favorite.product.status === 'AVAILABLE' ? 'Available' : 'Sold'}
                    </Badge>
                  </div>

                  {/* Favorite Count */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-current" />
                    {favorite.product._count.favorites}
                  </div>
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2">
                    {favorite.product.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(favorite.product.price.toNumber())}
                    </span>
                    <Badge variant="outline">
                      {favorite.product.category.name}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>by {getSellerName(favorite.product.seller)}</span>
                    <span className="capitalize">{favorite.product.condition.toLowerCase()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/product/${favorite.product.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    
                    {favorite.product.status === 'AVAILABLE' && (
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/buying/cart?add=${favorite.product.id}`}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Share Your List</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Show friends what you're interested in
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Share Favorites
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Price Alerts</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get notified when prices drop
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Set Alerts
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Similar Items</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Find items like your favorites
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/browse?similar=true">
                      Discover More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritesPage;