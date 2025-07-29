'use client';

import { Card, CardContent } from '@repo/ui/components';
import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { SimilarProduct } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface SimilarProductsProps {
  products: SimilarProduct[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="mb-6 font-bold text-xl md:text-2xl">Similar Items</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <Card className="group overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg">
              <div className="relative aspect-[3/4] bg-secondary">
                {product.images[0] ? (
                  <Image
                    alt={product.images[0].alt || product.title}
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={product.images[0].imageUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/70">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h4 className="mb-1 line-clamp-2 font-medium text-sm leading-tight">
                  {product.title}
                </h4>
                <p className="mb-2 truncate text-muted-foreground text-xs">
                  {product.seller.firstName && product.seller.lastName
                    ? `${product.seller.firstName} ${product.seller.lastName}`
                    : 'Anonymous'}
                </p>
                <span className="font-semibold text-base text-foreground">
                  {formatCurrency(product.price, 'USD')}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
