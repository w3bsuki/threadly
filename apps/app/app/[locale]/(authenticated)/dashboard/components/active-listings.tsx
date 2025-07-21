import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Package, Plus, Eye, ExternalLink } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { decimalToNumber } from '@repo/utils';
import { ErrorBoundary } from '@/components/error-boundary';

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
          status: 'AVAILABLE'
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
              displayOrder: true
            },
            orderBy: { displayOrder: 'asc' },
            take: 1
          },
          _count: {
            select: {
              favorites: true
            }
          }
        }
      });
      
      return products.map(product => ({
        ...product,
        price: Number(product.price)
      }));
    },
    300
  );
}

export async function ActiveListings({ userId, dictionary }: ActiveListingsProps) {
  const listings = await getActiveListings(userId);

  if (listings.length === 0) {
    return (
      <ErrorBoundary>
        <Card className="overflow-hidden bg-background border-border">
        <CardHeader className="pb-3 px-4 border-b border-border">
          <CardTitle className="text-base font-medium text-foreground">
            Your Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-secondary p-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-base font-medium text-foreground">
                Start selling today
              </h3>
              <p className="text-sm text-muted-foreground">
                List your first item and reach thousands of buyers looking for unique fashion pieces
              </p>
            </div>
            <Link href="/selling/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create listing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Card className="overflow-hidden bg-background border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 border-b border-border">
          <CardTitle className="text-base font-medium text-foreground">
            Your Active Listings
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link
              href="/selling/listings"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
            <Link href="/selling/new">
              <Button size="sm" variant="outline" className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {listings.map((listing) => (
              <Link 
                key={listing.id} 
                href={`/selling/listings/${listing.id}`}
                className="block no-touch-target flex-shrink-0"
              >
                <div className="space-y-1.5 w-32 sm:w-36">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0].imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5">
                      <div className="bg-foreground/80 text-background rounded px-1.5 py-0.5 text-xs font-semibold">
                        ${decimalToNumber(listing.price)}
                      </div>
                    </div>
                  </div>
                  <div className="px-0.5">
                    <p className="text-xs font-medium text-foreground truncate">
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
    </ErrorBoundary>
  );
}