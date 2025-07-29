'use client';

import { cn } from '@repo/ui/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

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

export function EnhancedHeader({
  totalCount,
  currentFilters,
  className,
}: EnhancedHeaderProps) {
  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Products', href: '/products' },
  ];

  // Add category-specific breadcrumb if filtered
  if (currentFilters.gender) {
    breadcrumbs.push({
      label:
        currentFilters.gender.charAt(0).toUpperCase() +
        currentFilters.gender.slice(1),
      href: `/products?gender=${currentFilters.gender}`,
    });
  }

  if (currentFilters.category) {
    breadcrumbs.push({
      label:
        currentFilters.category.charAt(0).toUpperCase() +
        currentFilters.category.slice(1),
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
      return (
        currentFilters.category.charAt(0).toUpperCase() +
        currentFilters.category.slice(1)
      );
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
      <nav className="mb-4 flex items-center space-x-1 text-muted-foreground text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div className="flex items-center" key={crumb.href}>
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
            <Link
              className={cn(
                'flex items-center transition-colors hover:text-secondary-foreground',
                index === breadcrumbs.length - 1
                  ? 'font-medium text-foreground'
                  : 'hover:underline'
              )}
              href={crumb.href}
            >
              {crumb.icon && <crumb.icon className="mr-1 h-4 w-4" />}
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Title and Subtitle */}
      <div className="mb-4">
        <h1 className="mb-2 font-bold text-2xl text-foreground sm:text-3xl">
          {getTitle()}
        </h1>
        <p className="text-muted-foreground text-sm">{getSubtitle()}</p>
      </div>

      {/* Active Filters Summary */}
      {Object.values(currentFilters).some(Boolean) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Filtered by:</span>
          {currentFilters.condition && (
            <span className="inline-flex items-center rounded-[var(--radius-full)] bg-secondary px-2 py-1 text-secondary-foreground text-xs">
              Condition: {currentFilters.condition.replace('_', ' ')}
            </span>
          )}
          {currentFilters.minPrice && (
            <span className="inline-flex items-center rounded-[var(--radius-full)] bg-secondary px-2 py-1 text-secondary-foreground text-xs">
              Min: ${currentFilters.minPrice}
            </span>
          )}
          {currentFilters.maxPrice && (
            <span className="inline-flex items-center rounded-[var(--radius-full)] bg-secondary px-2 py-1 text-secondary-foreground text-xs">
              Max: ${currentFilters.maxPrice}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
