import { currentUser } from '@repo/auth/server';
import { formatPrice } from '@repo/design-system/commerce/utils';
import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { getDictionary } from '@repo/content/internationalization';
import { decimalToNumber } from '@repo/api/utils';
import { ExternalLink, Heart, Package, ShoppingCart } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '../../components/header';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'My Favorites',
    description: 'Items you have saved and loved',
  };
}

const FavoritesPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
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

  const getSellerName = (seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  }) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller.email?.split('@')[0] || 'Unknown Seller';
  };

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Favorites"
        pages={['Dashboard', 'Buying', 'Favorites']}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}{' '}
              you've saved
            </p>
          </div>
          {favorites.length > 0 && (
            <Button asChild>
              <Link href="/browse">
                <Package className="mr-2 h-4 w-4" />
                Browse More
              </Link>
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No favorites yet</h3>
              <p className="mb-6 text-muted-foreground">
                Start browsing and save items you love by clicking the heart
                icon
              </p>
              <Button asChild>
                <Link href="/browse">
                  <Package className="mr-2 h-4 w-4" />
                  Start Browsing
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <Card
                className="group transition-shadow hover:shadow-md"
                key={favorite.id}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  {favorite.product.images[0] ? (
                    <Image
                      alt={favorite.product.title}
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      fill
                      src={favorite.product.images[0].imageUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
                      <Package className="h-12 w-12 text-background opacity-80" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className="text-xs"
                      variant={
                        favorite.product.status === 'AVAILABLE'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {favorite.product.status === 'AVAILABLE'
                        ? 'Available'
                        : 'Sold'}
                    </Badge>
                  </div>

                  {/* Favorite Count */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-[var(--radius-full)] bg-foreground/50 px-2 py-1 text-background text-xs">
                    <Heart className="h-3 w-3 fill-current" />
                    {favorite.product._count.favorites}
                  </div>
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="line-clamp-2 text-lg">
                    {favorite.product.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xl text-green-600">
                      {formatPrice(decimalToNumber(favorite.product.price))}
                    </span>
                    <Badge variant="outline">
                      {favorite.product.category.name}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="mb-3 flex items-center justify-between text-muted-foreground text-sm">
                    <span>by {getSellerName(favorite.product.seller)}</span>
                    <span className="capitalize">
                      {favorite.product.condition.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link href={`/product/${favorite.product.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>

                    {favorite.product.status === 'AVAILABLE' && (
                      <Button
                        asChild
                        className="flex-1"
                        size="sm"
                        variant="outline"
                      >
                        <Link href={`/buying/cart?add=${favorite.product.id}`}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
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
            <h3 className="mb-4 font-semibold text-lg">Quick Actions</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 font-medium">Share Your List</h4>
                  <p className="mb-3 text-muted-foreground text-sm">
                    Show friends what you're interested in
                  </p>
                  <Button className="w-full" size="sm" variant="outline">
                    Share Favorites
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 font-medium">Price Alerts</h4>
                  <p className="mb-3 text-muted-foreground text-sm">
                    Get notified when prices drop
                  </p>
                  <Button className="w-full" size="sm" variant="outline">
                    Set Alerts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 font-medium">Similar Items</h4>
                  <p className="mb-3 text-muted-foreground text-sm">
                    Find items like your favorites
                  </p>
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/browse?similar=true">Discover More</Link>
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
