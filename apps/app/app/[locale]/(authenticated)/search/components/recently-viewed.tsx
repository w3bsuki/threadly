'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Eye, Clock, X } from 'lucide-react';
import Link from 'next/link';

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
        const parsed = JSON.parse(saved);
        setViewedProducts(parsed.map((item: any) => ({
          ...item,
          viewedAt: new Date(item.viewedAt)
        })));
      } catch (error) {
      }
    }
  }, []);

  // Save to localStorage whenever viewedProducts changes
  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(viewedProducts));
  }, [viewedProducts]);

  const removeProduct = (productId: string) => {
    setViewedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearAll = () => {
    setViewedProducts([]);
  };

  // Public function to add a product (called from product detail pages)
  const addProduct = (product: Omit<ViewedProduct, 'viewedAt'>) => {
    setViewedProducts(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(p => p.id !== product.id);
      
      // Add new entry at the beginning
      const newViewed = [{
        ...product,
        viewedAt: new Date(),
      }, ...filtered];

      // Keep only the last 20 products
      return newViewed.slice(0, 20);
    });
  };

  // Expose addProduct function globally for use in product pages
  useEffect(() => {
    (window as any).addToRecentlyViewed = addProduct;
  }, []);

  if (viewedProducts.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Recently Viewed
        </h3>
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recently viewed products</p>
          <p>Products you view will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Recently Viewed
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAll}
          className="text-xs"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-2">
        {viewedProducts.slice(0, 8).map((product) => (
          <div 
            key={product.id}
            className="flex items-center gap-3 p-3 border rounded-[var(--radius-lg)] hover:bg-muted/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-[var(--radius-md)] overflow-hidden bg-muted flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link 
                href={`/product/${product.id}`}
                className="block hover:text-primary transition-colors"
              >
                <h4 className="font-medium text-sm truncate">{product.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-sm">${product.price.toFixed(2)}</span>
                  <Badge variant="outline" className="text-xs">
                    {product.condition}
                  </Badge>
                  {product.brand && (
                    <Badge variant="secondary" className="text-xs">
                      {product.brand}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
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
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeProduct(product.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {viewedProducts.length > 8 && (
        <Button variant="ghost" size="sm" className="w-full">
          View All ({viewedProducts.length})
        </Button>
      )}
    </div>
  );
}