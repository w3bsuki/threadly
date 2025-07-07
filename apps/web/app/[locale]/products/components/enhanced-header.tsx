'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';

interface EnhancedHeaderProps {
  totalCount: number;
  currentFilters: {
    category?: string;
    gender?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  className?: string;
}

export function EnhancedHeader({ totalCount, currentFilters, className }: EnhancedHeaderProps) {
  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Products', href: '/products' },
  ];

  // Add category-specific breadcrumb if filtered
  if (currentFilters.gender) {
    breadcrumbs.push({
      label: currentFilters.gender.charAt(0).toUpperCase() + currentFilters.gender.slice(1),
      href: `/products?gender=${currentFilters.gender}`,
    });
  }

  if (currentFilters.category) {
    breadcrumbs.push({
      label: currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1),
      href: `/products?category=${currentFilters.category}`,
    });
  }

  // Generate dynamic title
  const getTitle = () => {
    if (currentFilters.category && currentFilters.gender) {
      return `${currentFilters.gender.charAt(0).toUpperCase() + currentFilters.gender.slice(1)}'s ${currentFilters.category}`;
    }
    if (currentFilters.gender) {
      return `${currentFilters.gender.charAt(0).toUpperCase() + currentFilters.gender.slice(1)}'s Fashion`;
    }
    if (currentFilters.category) {
      return currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1);
    }
    return 'Browse Products';
  };

  // Generate subtitle
  const getSubtitle = () => {
    const activeFilters = Object.values(currentFilters).filter(Boolean).length;
    if (activeFilters > 0) {
      return `${totalCount.toLocaleString()} ${totalCount === 1 ? 'item' : 'items'} found`;
    }
    return `Discover ${totalCount.toLocaleString()} unique pieces from verified sellers`;
  };

  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
            <Link 
              href={crumb.href}
              className={cn(
                'flex items-center hover:text-gray-700 transition-colors',
                index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'hover:underline'
              )}
            >
              {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Title and Subtitle */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {getTitle()}
        </h1>
        <p className="text-sm text-gray-600">
          {getSubtitle()}
        </p>
      </div>

      {/* Active Filters Summary */}
      {Object.values(currentFilters).some(Boolean) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">Filtered by:</span>
          {currentFilters.condition && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Condition: {currentFilters.condition.replace('_', ' ')}
            </span>
          )}
          {currentFilters.minPrice && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Min: ${currentFilters.minPrice}
            </span>
          )}
          {currentFilters.maxPrice && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Max: ${currentFilters.maxPrice}
            </span>
          )}
        </div>
      )}
    </div>
  );
}