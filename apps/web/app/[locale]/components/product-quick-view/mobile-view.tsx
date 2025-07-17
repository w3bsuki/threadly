'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { ConditionBadge } from '@repo/design-system/components';
import { 
  Eye,
  X,
  Star,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';
import { toast } from '@repo/design-system';
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
  onOpenChange 
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
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="p-2">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-sm w-[90dvw] max-h-[85dvh] p-0 gap-0 rounded-xl overflow-hidden shadow-2xl border-0 bg-card">
        <div className="relative bg-card flex flex-col h-full">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-105"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>

          {/* Product Image */}
          <div className="relative aspect-square flex-shrink-0">
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            
            {/* Condition Badge */}
            <div className="absolute top-3 left-3">
              <ConditionBadge condition={product.condition as any} className="shadow-sm" />
            </div>

            {/* Discount Badge */}
            {product.originalPrice && (
              <div className="absolute top-3 right-12">
                <Badge className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 flex-1 flex flex-col">
            {/* Product Info */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {product.brand}
              </p>
              <h2 className="font-bold text-foreground text-lg leading-tight mt-1">
                {product.title}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Size {product.size}
              </p>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">
                  {product.seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">
                  {product.seller.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.seller.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{product.seller.location}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
              <Button 
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg text-sm transition-all"
                onClick={handleBuyNow}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Buy Now'}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-12 font-semibold rounded-lg text-sm border hover:bg-muted transition-all"
                onClick={() => onOpenChange?.(false)}
                asChild
              >
                <Link href={`/product/${product.id}`}>
                  View More
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}