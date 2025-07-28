'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import {
  formatPriceForDisplay,
  type Region,
} from '@repo/internationalization/client';
import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '../../utils/currency';

interface MobileStickyActionsProps {
  productId: string;
  price: number;
  isInCart: boolean;
  isFavorited: boolean;
  isPending: boolean;
  userRegion?: Region | undefined;
  userCurrency: string;
  dictionary: any;
  onBuyNow: () => void;
  onToggleFavorite: () => void;
}

export function MobileStickyActions({
  price,
  isInCart,
  isFavorited,
  isPending,
  userRegion,
  userCurrency,
  dictionary,
  onBuyNow,
  onToggleFavorite,
}: MobileStickyActionsProps) {
  const router = useRouter();

  return (
    <>
      <div className="fixed right-0 bottom-0 left-0 space-y-3 border-gray-200 border-t bg-background p-4 md:hidden">
        <div className="flex gap-3">
          <Button
            className="h-12 flex-1 border-black text-foreground hover:bg-muted"
            disabled={isPending}
            onClick={onToggleFavorite}
            variant="outline"
          >
            <Heart
              className={cn('mr-2 h-4 w-4', isFavorited && 'fill-current')}
            />
            {isFavorited
              ? dictionary.web.global.navigation.saved || 'Saved'
              : dictionary.web.cart.save || 'Save'}
          </Button>
          <Button className="h-12 border-gray-300 px-4" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        {isInCart ? (
          <Button
            className="h-12 w-full bg-primary/90 font-medium text-background text-base hover:bg-secondary-foreground"
            onClick={() => router.push('/cart')}
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {dictionary.web.global.navigation.myCart || 'View Cart'}
          </Button>
        ) : (
          <Button
            className="h-12 w-full bg-primary font-medium text-background text-base hover:bg-primary/90"
            onClick={onBuyNow}
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {dictionary.web.cart.addToCart || 'Buy Now'} -{' '}
            {userRegion
              ? formatPriceForDisplay(price, userRegion, userCurrency as any)
                  .displayPrice
              : formatCurrency(price, userCurrency as any)}
          </Button>
        )}
      </div>

      {/* Mobile bottom padding */}
      <div className="h-32 md:hidden" />
    </>
  );
}
