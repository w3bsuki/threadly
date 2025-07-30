'use client';

import type { Decimal } from '@prisma/client/runtime/library';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@repo/ui/components';
import {
  CursorPagination,
  useCursorPagination,
} from '@repo/ui/components/marketplace';
import type { CursorPaginationResult } from '@repo/ui/lib/pagination';
import { decimalToNumber } from '@repo/api/utils';
import type { Dictionary } from '@repo/api/utils/validation/schemas';
import { Edit, Eye, MoreHorizontal, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: Decimal;
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
  dictionary: Dictionary;
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

      setProducts((prev) => [...prev, ...data.items]);
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
            <h3 className="mb-2 font-semibold text-lg">No listings yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start selling by creating your first product listing
            </p>
            <Button asChild>
              <Link href="/selling/new">
                <Plus className="mr-2 h-4 w-4" />
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <Link
            className="no-touch-target group block"
            href={`/selling/listings/${product.id}`}
            key={product.id}
          >
            <div className="space-y-1.5">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                {product.images[0] ? (
                  <Image
                    alt={product.title}
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    fill
                    priority={index < 10}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    src={product.images[0].imageUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-gray-400 text-xs dark:text-gray-600">
                      No image
                    </span>
                  </div>
                )}

                <div className="absolute top-1.5 left-1.5">
                  <div
                    className={`rounded px-1 py-0.5 font-semibold text-[10px] ${getStatusColor(product.status)}`}
                  >
                    {product.status === 'AVAILABLE' ? 'Live' : product.status}
                  </div>
                </div>

                <div className="absolute top-1.5 right-1.5">
                  <div className="rounded bg-black/80 px-1 py-0.5 font-semibold text-[11px] text-white dark:bg-white/90 dark:text-black">
                    ${decimalToNumber(product.price)}
                  </div>
                </div>

                <div className="absolute right-1.5 bottom-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    className="h-6 w-6 bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="min-w-0 px-0.5">
                <p className="truncate font-medium text-[11px] text-gray-900 dark:text-white">
                  {product.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="truncate">
                    {getConditionText(product.condition)}
                  </span>
                  <span className="ml-1 flex flex-shrink-0 items-center gap-0.5">
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
        currentCount={products.length}
        loadMoreText="Load More Listings"
        onLoadMore={loadMore}
        showStats={true}
        state={state}
      />
    </div>
  );
}
