import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Package, Plus, Edit2, Eye, ChevronRight } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { decimalToNumber } from '@repo/utils';

interface ActiveListingsProps {
  userId: string;
  dictionary: Dictionary;
}

interface Product {
  id: string;
  title: string;
  price: any;
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
      
      return products;
    },
    300 // Cache for 5 minutes
  );
}

export async function ActiveListings({ userId, dictionary }: ActiveListingsProps) {
  const listings = await getActiveListings(userId);
  
  // TEMPORARY: Mock data to test layout
  const testListings = [
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      price: 89.99,
      status: 'AVAILABLE',
      createdAt: new Date(),
      views: 125,
      images: [{ imageUrl: 'https://via.placeholder.com/400x600/4A5568/FFFFFF?text=Jacket', displayOrder: 0 }],
      _count: { favorites: 15 }
    },
    {
      id: '2',
      title: 'Designer Handbag',
      price: 299.99,
      status: 'AVAILABLE',
      createdAt: new Date(),
      views: 89,
      images: [{ imageUrl: 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Handbag', displayOrder: 0 }],
      _count: { favorites: 8 }
    },
    {
      id: '3',
      title: 'Retro Sneakers',
      price: 150.00,
      status: 'AVAILABLE',
      createdAt: new Date(),
      views: 67,
      images: [{ imageUrl: 'https://via.placeholder.com/400x600/EC4899/FFFFFF?text=Sneakers', displayOrder: 0 }],
      _count: { favorites: 12 }
    },
    {
      id: '4',
      title: 'Black Evening Dress',
      price: 85.00,
      status: 'AVAILABLE',
      createdAt: new Date(),
      views: 156,
      images: [{ imageUrl: 'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Dress', displayOrder: 0 }],
      _count: { favorites: 23 }
    }
  ] as Product[];

  const displayListings = listings.length > 0 ? listings : testListings;

  if (displayListings.length === 0) {
    return (
      <Card className="overflow-hidden bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3 px-4 border-b border-gray-200 dark:border-gray-800">
          <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
            Your Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
              <Package className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Start selling today
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                List your first item and reach thousands of buyers looking for unique fashion pieces
              </p>
            </div>
            <Link href="/selling/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Create listing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
          Your Active Listings
        </CardTitle>
        <div className="flex items-center gap-2">
          <Link
            href="/selling/listings"
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            View all
          </Link>
          <Link href="/selling/new">
            <Button size="sm" variant="outline" className="h-7 px-2 border-gray-200 dark:border-gray-700">
              <Plus className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      {/* Mobile: horizontal scroll with 2 cards visible */}
      <CardContent className="md:hidden p-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {displayListings.map((listing) => (
            <article key={listing.id} className="group relative flex-shrink-0 w-[calc(50%-8px)]">
              <Link href={`/selling/listings/${listing.id}`} className="block">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 relative">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold">
                      ${decimalToNumber(listing.price)}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {listing.views}
                    </span>
                    {listing._count?.favorites && listing._count.favorites > 0 && (
                      <>
                        <span>•</span>
                        <span>{listing._count.favorites} likes</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </CardContent>

      {/* Desktop: 4-column grid with smaller cards */}
      <CardContent className="hidden md:block px-4 pb-4 pt-4">
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
          {displayListings.map((listing) => (
            <Link 
              key={listing.id} 
              href={`/selling/listings/${listing.id}`}
              className="group"
            >
              <div className="space-y-1.5">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/80 dark:bg-white/90 text-white dark:text-black rounded px-1.5 py-0.5 text-xs font-semibold">
                      ${decimalToNumber(listing.price)}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {listing.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
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