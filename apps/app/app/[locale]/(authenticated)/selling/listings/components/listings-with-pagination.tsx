'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
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
      console.error('Failed to load more products:', error);
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative">
              {product.images[0] ? (
                <img
                  src={product.images[0].imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              
              <div className="absolute top-2 left-2">
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
              
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white/90">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                <p className="text-2xl font-bold">${(decimalToNumber(product.price) / 100).toFixed(2)}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{getConditionText(product.condition)}</span>
                  <span>{product.category.name}</span>
                </div>
                
                {product.brand && (
                  <p className="text-sm text-muted-foreground">
                    Brand: {product.brand}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                  <span>{product._count.favorites} saves</span>
                  <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/selling/listings/${product.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/product/${product.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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