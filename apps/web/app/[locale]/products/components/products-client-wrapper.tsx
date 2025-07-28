'use client';

import type { Dictionary } from '@repo/internationalization';
import { useState } from 'react';
import { LayoutSwitcher, type ViewMode } from './layout-switcher';
import { ProductGrid } from './product-grid';
import { ProductListView } from './product-list-view';
import { ProductSort } from './product-sort';
import { QuickFilters } from './quick-filters';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  brand?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string;
    displayOrder: number;
  }>;
  seller: {
    id: string;
    firstName: string;
  };
  _count: {
    favorites: number;
  };
  views?: number;
  createdAt?: Date;
}

interface ProductsClientWrapperProps {
  products: Product[];
  searchParams: {
    category?: string;
    gender?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
  dictionary: Dictionary;
}

export function ProductsClientWrapper({
  products,
  searchParams,
  dictionary,
}: ProductsClientWrapperProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <>
      {/* Desktop Filter Bar */}
      <div className="hidden items-center justify-between gap-4 pb-6 lg:flex">
        <QuickFilters currentFilters={searchParams} />
        <div className="flex items-center space-x-4">
          <LayoutSwitcher currentView={viewMode} onViewChange={setViewMode} />
          <ProductSort currentSort={searchParams.sort} />
        </div>
      </div>

      {/* Product Display */}
      <div className="mt-6">
        {viewMode === 'list' ? (
          <ProductListView products={products} />
        ) : (
          <ProductGrid
            containerHeight={800}
            dictionary={dictionary}
            enableVirtualization={products.length > 50}
            isCompact={viewMode === 'compact'}
            products={products}
          />
        )}
      </div>
    </>
  );
}
