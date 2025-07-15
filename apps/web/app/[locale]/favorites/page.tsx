import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Heart, Package, ExternalLink, ShoppingCart, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@repo/commerce/utils';
import { decimalToNumber } from '@repo/utils';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';

type FavoritesProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: FavoritesProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'My Favorites - Threadly',
    description: 'Your favorite fashion items and saved products',
  });
};

const FavoritesPage = async ({ params }: FavoritesProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
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

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} you've saved
            </p>
          </div>
          {favorites.length > 0 && (
            <Button asChild>
              <Link href="/">
                <Package className="h-4 w-4 mr-2" />
                Browse More
              </Link>
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-16">
              <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-3">No favorites yet</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Start browsing and save items you love by clicking the heart icon
              </p>
              <Button asChild size="lg">
                <Link href="/">
                  <Package className="h-5 w-5 mr-2" />
                  Start Browsing
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-200">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  {favorite.product.images[0] ? (
                    <Image
                      src={favorite.product.images[0].imageUrl}
                      alt={favorite.product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                      <Package className="h-12 w-12 text-white opacity-80" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={favorite.product.status === 'AVAILABLE' ? 'default' : 'secondary'}
                      className="text-xs font-medium"
                    >
                      {favorite.product.status === 'AVAILABLE' ? 'Available' : 'Sold'}
                    </Badge>
                  </div>

                  {/* Favorite Count */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-current" />
                    {favorite.product._count.favorites}
                  </div>
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {favorite.product.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(decimalToNumber(favorite.product.price))}
                    </span>
                    <Badge variant="outline">
                      {favorite.product.category.name}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
                        <Link href={`/product/${favorite.product.id}?action=add-to-cart`}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Quick Actions with Price Alerts */}
        {favorites.length > 0 && (
          <div className="border-t pt-8 mt-12">
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Price Alerts</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get notified when your favorite items go on sale
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    Enable Price Alerts
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Share Your List</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Show friends what you're interested in
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Share Favorites
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Similar Items</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find items like your favorites
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/?similar=true">
                      Discover More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FavoritesPage;