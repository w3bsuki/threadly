'use client';

import { Badge } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import {
  formatPriceForDisplay,
  type Region,
} from '@repo/content/internationalization/client';
import { Heart } from 'lucide-react';
import { conditionColors, conditionLabels, type Product } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface ProductHeaderProps {
  product: Product;
  userRegion?: Region | undefined;
  userCurrency: string;
}

export function ProductHeader({
  product,
  userRegion,
  userCurrency,
}: ProductHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-3 font-bold text-2xl leading-tight md:text-3xl">
          {product.title}
        </h1>
        <div className="mb-4">
          <div className="font-bold text-3xl text-foreground md:text-4xl">
            {userRegion
              ? formatPriceForDisplay(
                  product.price,
                  userRegion,
                  userCurrency as any
                ).displayPrice
              : formatCurrency(product.price, userCurrency as any)}
          </div>
          {userRegion && (
            <p className="mt-1 text-muted-foreground text-sm">
              {
                formatPriceForDisplay(
                  product.price,
                  userRegion,
                  userCurrency as any
                ).taxInfo
              }
            </p>
          )}
        </div>
      </div>

      {/* Badges - Mobile optimized */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            'font-medium text-sm',
            conditionColors[product.condition as keyof typeof conditionColors]
          )}
          variant="secondary"
        >
          {conditionLabels[product.condition as keyof typeof conditionLabels]}
        </Badge>
        {product.size && (
          <Badge className="text-sm" variant="outline">
            Size {product.size}
          </Badge>
        )}
        {product.brand && (
          <Badge className="font-medium text-sm" variant="outline">
            {product.brand}
          </Badge>
        )}
      </div>

      {/* Product Stats */}
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{product._count.favorites}</span>
        </div>
        <span>•</span>
        <span>{product.views} views</span>
        <span>•</span>
        <span className="hidden sm:inline">
          Listed {new Date(product.createdAt).toLocaleDateString()}
        </span>
        <span className="sm:hidden">
          {Math.ceil(
            (Date.now() - new Date(product.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )}
          d ago
        </span>
      </div>
    </div>
  );
}
