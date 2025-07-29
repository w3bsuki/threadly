import { getCacheService } from '@repo/database';
import { database } from '@repo/database';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorBoundary,
  LoadingSkeleton,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import { decimalToNumber } from '@repo/utils';
import { ExternalLink, Eye, Package, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ActiveListingsProps {
  userId: string;
  dictionary: Dictionary;
}

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  createdAt: Date;
  views: number;
  images: {
    imageUrl: string;
    displayOrder: number;
  }[];
  _count?: {
    favorites: number;
  };
}

async function getActiveListings(userId: string): Promise<Product[]> {
  const cache = getCacheService();
  const cacheKey = `dashboard:active-listings:${userId}`;

  return await cache.remember(
    cacheKey,
    async () => {
      const products = await database.product.findMany({
        where: {
          sellerId: userId,
          status: 'AVAILABLE',
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          createdAt: true,
          views: true,
          images: {
            select: {
              imageUrl: true,
              displayOrder: true,
            },
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });

      return products.map((product) => ({
        ...product,
        price: Number(product.price),
      }));
    },
    300
  );
}

async function ActiveListingsInner({
  userId,
  dictionary,
}: ActiveListingsProps) {
  const listings = await getActiveListings(userId);

  if (listings.length === 0) {
    return (
      <Card className="overflow-hidden border-border bg-background">
        <CardHeader className="border-border border-b px-4 pb-3">
          <CardTitle className="font-medium text-base text-foreground">
            Your Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-8 pb-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="max-w-sm space-y-2">
              <h3 className="font-medium text-base text-foreground">
                Start selling today
              </h3>
              <p className="text-muted-foreground text-sm">
                List your first item and reach thousands of buyers looking for
                unique fashion pieces
              </p>
            </div>
            <Link className="w-full sm:w-auto" href="/selling/new">
              <Button className="touch-target-lg w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create listing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border bg-background">
      <CardHeader className="flex flex-row items-center justify-between border-border border-b px-4 pb-3">
        <CardTitle className="font-medium text-base text-foreground">
          Your Active Listings
        </CardTitle>
        <div className="flex items-center gap-2">
          <Link
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            href="/selling/listings"
          >
            View all
          </Link>
          <Link href="/selling/new">
            <Button
              className="touch-target h-7 px-2"
              size="sm"
              variant="outline"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
          {listings.map((listing) => (
            <Link
              className="no-touch-target block flex-shrink-0"
              href={`/selling/listings/${listing.id}`}
              key={listing.id}
            >
              <div className="w-32 space-y-1.5 sm:w-36">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                  {listing.images[0] ? (
                    <Image
                      alt={listing.title}
                      className="object-cover"
                      fill
                      sizes="144px"
                      src={listing.images[0].imageUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-1.5 right-1.5">
                    <div className="rounded bg-foreground/80 px-1.5 py-0.5 font-semibold text-background text-xs">
                      ${decimalToNumber(listing.price)}
                    </div>
                  </div>
                </div>
                <div className="px-0.5">
                  <p className="truncate font-medium text-foreground text-xs">
                    {listing.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" />
                      {listing.views}
                    </span>
                    <span>•</span>
                    <span>{listing._count?.favorites || 0} likes</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveListings(props: ActiveListingsProps) {
  return (
    <ErrorBoundary>
      <ActiveListingsInner {...props} />
    </ErrorBoundary>
  );
}
