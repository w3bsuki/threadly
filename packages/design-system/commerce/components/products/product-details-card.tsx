'use client';

import { Card, CardContent } from '@repo/ui/components';
import { conditionLabels, type Product } from '../../types';

interface ProductDetailsCardProps {
  product: Product;
}

export function ProductDetailsCard({ product }: ProductDetailsCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <h3 className="mb-3 font-semibold text-sm">Details</h3>
        <div className="space-y-2 text-sm">
          {product.brand && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brand</span>
              <span className="font-medium">{product.brand}</span>
            </div>
          )}
          {product.size && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium">{product.size}</span>
            </div>
          )}
          {product.color && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color</span>
              <span className="font-medium">{product.color}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Condition</span>
            <span className="font-medium">
              {
                conditionLabels[
                  product.condition as keyof typeof conditionLabels
                ]
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">{product.category.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
