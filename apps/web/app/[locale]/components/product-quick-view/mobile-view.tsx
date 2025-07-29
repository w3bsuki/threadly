'use client';

import { toast } from '@repo/ui';
import {
  Badge,
  Button,
  ConditionBadge,
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@repo/ui/components';
import { ArrowRight, Eye, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '../../../../lib/stores/cart-store';
import { formatCurrency } from '../../../../lib/utils/currency';

interface ProductQuickViewMobileProps {
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    originalPrice?: number | null;
    size: string;
    condition: string;
    categoryName: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      location: string;
      rating: number;
    };
    favoritesCount: number;
    createdAt: Date;
  };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductQuickViewMobile({
  product,
  trigger,
  open,
  onOpenChange,
}: ProductQuickViewMobileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartStore();
  const router = useRouter();

  const handleBuyNow = async () => {
    try {
      setIsLoading(true);
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.images[0] || '',
        sellerId: product.seller.id,
        sellerName: product.seller.name,
        condition: product.condition,
        size: product.size,
      });
      onOpenChange?.(false);
      router.push('/cart');
    } catch (_error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="p-2" size="sm" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[85dvh] w-[90dvw] max-w-sm gap-0 overflow-hidden rounded-[var(--radius-xl)] border-0 bg-card p-0 shadow-2xl">
        <div className="relative flex h-full max-h-[90dvh] flex-col overflow-hidden bg-card">
          {/* Close Button */}

          {/* Product Image */}
          <div className="relative aspect-[4/3] flex-shrink-0">
            <Image
              alt={product.title}
              className="object-cover"
              fill
              priority
              src={product.images[0] || '/placeholder.png'}
            />

            {/* Condition Badge */}
            <div className="absolute top-3 left-3">
              <ConditionBadge
                className="shadow-sm"
                condition={product.condition as any}
              />
            </div>

            {/* Discount Badge */}
            {product.originalPrice && (
              <div className="absolute top-3 right-12">
                <Badge className="rounded-[var(--radius-md)] bg-destructive px-2 py-1 font-medium text-destructive-foreground text-xs shadow-sm">
                  -
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  %
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-4">
            {/* Product Info */}
            <div>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                {product.brand}
              </p>
              <h2 className="mt-1 font-bold text-foreground text-lg leading-tight">
                {product.title}
              </h2>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-bold text-2xl text-foreground">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="mt-2 font-medium text-muted-foreground text-sm">
                Size {product.size}
              </p>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm">
                <span className="font-bold text-primary-foreground text-sm">
                  {product.seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">
                  {product.seller.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {product.seller.rating.toFixed(1)}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{product.seller.location}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t bg-card pt-4">
              <Button
                className="h-12 rounded-lg bg-primary font-semibold text-primary-foreground text-sm transition-all hover:bg-primary/90"
                disabled={isLoading}
                onClick={handleBuyNow}
              >
                {isLoading ? 'Adding...' : 'Buy Now'}
              </Button>

              <Button
                asChild
                className="h-12 rounded-lg border font-semibold text-sm transition-all hover:bg-muted"
                onClick={() => onOpenChange?.(false)}
                variant="outline"
              >
                <Link href={`/product/${product.id}`}>
                  View More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
