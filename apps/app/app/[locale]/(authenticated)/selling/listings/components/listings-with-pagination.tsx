'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@repo/design-system/components';
import { Card, CardContent } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Plus, Edit, MoreHorizontal, Eye } from 'lucide-react';
import { decimalToNumber } from '@repo/utils';
import { CursorPagination, useCursorPagination } from '@repo/design-system/components/marketplace';
import type { CursorPaginationResult } from '@repo/design-system/lib/pagination';

interface Product {
  id: string;
  title: string;
  price: any; // Decimal from Prisma
  condition: string;
  status: string;
  brand: string | null;
  createdAt: Date;
  images: Array<{ imageUrl: string; alt?: string | null }>;
  category: { name: string };
  _count: { orders: number; favorites: number };
}

interface ListingsWithPaginationProps {
  initialData: CursorPaginationResult<Product>;
  userId: string;
  locale: string;
  dictionary: any;
}

export function ListingsWithPagination({
  initialData,
  userId,
  locale,
  dictionary,
}: ListingsWithPaginationProps) {
  const [products, setProducts] = useState(initialData.items);
  const { state, updateState } = useCursorPagination({
    cursor: initialData.nextCursor,
    hasNextPage: initialData.hasNextPage,
    totalCount: initialData.totalCount,
    isLoading: false,
  });

  const loadMore = useCallback(async () => {
    if (!state.hasNextPage || state.isLoading) return;

    updateState({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (state.cursor) params.set('cursor', state.cursor);
      params.set('limit', '20');

      const response = await fetch(`/api/users/${userId}/products?${params}`);
      const data = await response.json();

      setProducts(prev => [...prev, ...data.items]);
      updateState({
        cursor: data.nextCursor,
        hasNextPage: data.hasNextPage,
        isLoading: false,
      });
    } catch (error) {
      updateState({ isLoading: false });
    }
  }, [state.cursor, state.hasNextPage, state.isLoading, userId, updateState]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800';
      case 'REMOVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'NEW_WITH_TAGS':
        return 'New with tags';
      case 'NEW_WITHOUT_TAGS':
        return 'New without tags';
      case 'VERY_GOOD':
        return 'Very good';
      case 'GOOD':
        return 'Good';
      case 'SATISFACTORY':
        return 'Satisfactory';
      default:
        return condition;
    }
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start selling by creating your first product listing
            </p>
            <Button asChild>
              <Link href="/selling/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Listing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product, index) => (
          <Link key={product.id} href={`/selling/listings/${product.id}`} className="block no-touch-target group">
            <div className="space-y-1.5">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    priority={index < 10}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-600 text-xs">No image</span>
                  </div>
                )}
                
                <div className="absolute top-1.5 left-1.5">
                  <div className={`px-1 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(product.status)}`}>
                    {product.status === 'AVAILABLE' ? 'Live' : product.status}
                  </div>
                </div>
                
                <div className="absolute top-1.5 right-1.5">
                  <div className="bg-black/80 dark:bg-white/90 text-white dark:text-black rounded px-1 py-0.5 text-[11px] font-semibold">
                    ${decimalToNumber(product.price)}
                  </div>
                </div>

                <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="min-w-0 px-0.5">
                <p className="text-[11px] font-medium text-gray-900 dark:text-white truncate">
                  {product.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="truncate">{getConditionText(product.condition)}</span>
                  <span className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                    <Eye className="h-2 w-2" />
                    {product._count.favorites}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <CursorPagination
        state={state}
        onLoadMore={loadMore}
        loadMoreText="Load More Listings"
        currentCount={products.length}
        showStats={true}
      />
    </div>
  );
}