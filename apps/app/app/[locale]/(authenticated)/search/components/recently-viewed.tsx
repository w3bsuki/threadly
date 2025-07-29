'use client';

import { Badge, Button } from '@repo/ui/components';
import { Clock, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ViewedProduct {
  id: string;
  title: string;
  price: number;
  condition: string;
  brand?: string;
  image?: string;
  seller: string;
  viewedAt: Date;
}

interface RecentlyViewedProps {
  className?: string;
}

export function RecentlyViewed({ className }: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);

  // Load recently viewed products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ViewedProduct[];
        setViewedProducts(
          parsed.map((item) => ({
            ...item,
            viewedAt: new Date(item.viewedAt),
          }))
        );
      } catch (error) {
        // Ignore parse errors from invalid localStorage data
      }
    }
  }, []);

  // Save to localStorage whenever viewedProducts changes
  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(viewedProducts));
  }, [viewedProducts]);

  const removeProduct = (productId: string) => {
    setViewedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearAll = () => {
    setViewedProducts([]);
  };

  // Public function to add a product (called from product detail pages)
  const addProduct = (product: Omit<ViewedProduct, 'viewedAt'>) => {
    setViewedProducts((prev) => {
      // Remove existing entry if it exists
      const filtered = prev.filter((p) => p.id !== product.id);

      // Add new entry at the beginning
      const newViewed = [
        {
          ...product,
          viewedAt: new Date(),
        },
        ...filtered,
      ];

      // Keep only the last 20 products
      return newViewed.slice(0, 20);
    });
  };

  // Expose addProduct function globally for use in product pages
  useEffect(() => {
    interface WindowWithRecentlyViewed extends Window {
      addToRecentlyViewed: typeof addProduct;
    }
    (window as unknown as WindowWithRecentlyViewed).addToRecentlyViewed =
      addProduct;
  }, []);

  if (viewedProducts.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <Eye className="h-4 w-4" />
          Recently Viewed
        </h3>
        <div className="py-6 text-center text-muted-foreground text-sm">
          <Eye className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No recently viewed products</p>
          <p>Products you view will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <Eye className="h-4 w-4" />
          Recently Viewed
        </h3>
        <Button
          className="text-xs"
          onClick={clearAll}
          size="sm"
          variant="ghost"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-2">
        {viewedProducts.slice(0, 8).map((product) => (
          <div
            className="group flex items-center gap-3 rounded-[var(--radius-lg)] border p-3 transition-colors hover:bg-muted/50"
            key={product.id}
          >
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-muted">
              {product.image ? (
                <img
                  alt={product.title}
                  className="h-full w-full object-cover"
                  src={product.image}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                className="block transition-colors hover:text-primary"
                href={`/product/${product.id}`}
              >
                <h4 className="truncate font-medium text-sm">
                  {product.title}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge className="text-xs" variant="outline">
                    {product.condition}
                  </Badge>
                  {product.brand && (
                    <Badge className="text-xs" variant="secondary">
                      {product.brand}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                  <span>{product.seller}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {product.viewedAt.toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </div>

            <Button
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeProduct(product.id)}
              size="icon"
              variant="ghost"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {viewedProducts.length > 8 && (
        <Button className="w-full" size="sm" variant="ghost">
          View All ({viewedProducts.length})
        </Button>
      )}
    </div>
  );
}
