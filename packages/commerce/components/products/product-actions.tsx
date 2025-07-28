'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
  productId: string;
  isInCart: boolean;
  isFavorited: boolean;
  isPending: boolean;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}

export function ProductActions({
  isInCart,
  isFavorited,
  isPending,
  onBuyNow,
  onAddToCart,
  onToggleFavorite,
}: ProductActionsProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {isInCart ? (
        <Button
          className="h-12 w-full bg-primary/90 font-medium text-background text-base hover:bg-secondary-foreground"
          onClick={() => router.push('/cart')}
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          View Cart
        </Button>
      ) : (
        <>
          <Button
            className="h-12 w-full bg-primary font-medium text-background text-base hover:bg-primary/90"
            onClick={onBuyNow}
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy Now
          </Button>
          <Button
            className="h-12 w-full font-medium text-base"
            onClick={onAddToCart}
            size="lg"
            variant="outline"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          className="h-10 w-full"
          disabled={isPending}
          onClick={onToggleFavorite}
          variant="outline"
        >
          <Heart
            className={cn('mr-2 h-4 w-4', isFavorited && 'fill-current')}
          />
          {isFavorited ? 'Saved' : 'Save'}
        </Button>
        <Button className="h-10 w-full" variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
