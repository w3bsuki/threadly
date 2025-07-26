import { currentUser } from '@repo/auth/server';
import { formatPrice } from '@repo/commerce/utils';
import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { decimalToNumber } from '@repo/utils';
import { Bell, ExternalLink, Heart, Package, ShoppingCart } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type FavoritesProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: FavoritesProps): Promise<Metadata> => {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'My Favorites - Threadly',
    description: 'Your favorite fashion items and saved products',
  });
};

const FavoritesPage = async ({ params }: FavoritesProps) => {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    const { AuthPrompt } = await import('../../../components/auth-prompt');
    return (
      <AuthPrompt
        title="Sign in to view favorites"
        description="You need to be signed in to save and manage your favorite items on Threadly."
        locale={locale}
      />
    );
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

  interface Seller {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  }

  const getSellerName = (seller: Seller) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller.email?.split('@')[0] || 'Unknown Seller';
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}{' '}
              you've saved
            </p>
          </div>
          {favorites.length > 0 && (
            <Button asChild>
              <Link href="/">
                <Package className="mr-2 h-4 w-4" />
                Browse More
              </Link>
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-16 text-center">
              <Heart className="mx-auto mb-6 h-20 w-20 text-muted-foreground" />
              <h3 className="mb-3 font-semibold text-2xl">No favorites yet</h3>
              <p className="mb-8 text-lg text-muted-foreground">
                Start browsing and save items you love by clicking the heart
                icon
              </p>
              <Button asChild size="lg">
                <Link href="/">
                  <Package className="mr-2 h-5 w-5" />
                  Start Browsing
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <Card
                className="group transition-all duration-200 hover:shadow-lg"
                key={favorite.id}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  {favorite.product.images[0] ? (
                    <Image
                      alt={favorite.product.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      src={favorite.product.images[0].imageUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
                      <Package className="h-12 w-12 text-background opacity-80" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      className="font-medium text-xs"
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
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-[var(--radius-full)] bg-foreground/60 px-2 py-1 text-background text-xs backdrop-blur-sm">
                    <Heart className="h-3 w-3 fill-current" />
                    {favorite.product._count.favorites}
                  </div>
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="mb-2 line-clamp-2 text-lg">
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
                  <div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
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
                        <Link
                          href={`/product/${favorite.product.id}?action=add-to-cart`}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
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
          <div className="mt-12 border-t pt-8">
            <h2 className="mb-6 font-semibold text-2xl">Quick Actions</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-[var(--radius-lg)] bg-blue-100 p-2">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Price Alerts</h4>
                      <p className="mb-4 text-muted-foreground text-sm">
                        Get notified when your favorite items go on sale
                      </p>
                    </div>
                  </div>
                  <Button className="w-full" disabled size="sm">
                    Enable Price Alerts (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-[var(--radius-lg)] bg-green-100 p-2">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Share Your List</h4>
                      <p className="mb-4 text-muted-foreground text-sm">
                        Show friends what you're interested in
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled
                    size="sm"
                    variant="outline"
                  >
                    Share Favorites (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-[var(--radius-lg)] bg-purple-100 p-2">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Similar Items</h4>
                      <p className="mb-4 text-muted-foreground text-sm">
                        Find items like your favorites
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/?similar=true">Discover More</Link>
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
