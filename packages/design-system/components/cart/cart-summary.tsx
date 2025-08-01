'use client';

import { ArrowRight, Info, ShoppingBag } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  itemCount: number;
  onCheckout?: () => void;
  isCheckoutLoading?: boolean;
  promoCode?: string;
  promoDiscount?: number;
  estimatedDelivery?: string;
  variant?: 'default' | 'compact' | 'sidebar';
  enableAnimations?: boolean;
  className?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  itemCount,
  onCheckout,
  isCheckoutLoading = false,
  promoCode,
  promoDiscount = 0,
  estimatedDelivery,
  variant = 'default',
  enableAnimations = false,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const totalDiscount = discount + promoDiscount;
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        enableAnimations && isVisible && 'animate-slide-in-right',
        variant === 'sidebar' && 'sticky top-4',
        className
      )}
    >
      <CardHeader className={variant === 'compact' ? 'pb-4' : undefined}>
        <CardTitle
          className={cn(
            'flex items-center gap-2',
            variant === 'compact' ? 'text-lg' : 'text-xl'
          )}
        >
          <ShoppingBag className="h-5 w-5" />
          Order Summary
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </CardHeader>

      <CardContent
        className={cn('space-y-4', variant === 'compact' && 'space-y-3')}
      >
        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && shipping > 0 && (
          <div
            className={cn(
              'space-y-2 rounded-lg bg-muted/50 p-3',
              enableAnimations && 'animation-delay-200 animate-fade-in'
            )}
          >
            <p className="font-medium text-sm">
              Add ${remainingForFreeShipping.toFixed(2)} for free shipping!
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full bg-primary transition-all duration-500',
                  enableAnimations && 'animate-slide-in-left'
                )}
                style={{
                  width: `${(subtotal / freeShippingThreshold) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex items-center justify-between text-green-600 text-sm dark:text-green-400">
              <span className="flex items-center gap-1">
                Discount
                {promoCode && (
                  <Badge className="ml-1 text-xs" variant="secondary">
                    {promoCode}
                  </Badge>
                )}
              </span>
              <span>-${totalDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              Shipping
              {shipping > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Standard shipping</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
            <span
              className={
                shipping === 0 ? 'text-green-600 dark:text-green-400' : ''
              }
            >
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          {tax > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Estimated tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">Total</span>
          <span
            className={cn(
              'font-bold',
              variant === 'compact' ? 'text-lg' : 'text-xl',
              enableAnimations && 'animation-delay-300 animate-bounce-in'
            )}
          >
            ${total.toFixed(2)}
          </span>
        </div>

        {estimatedDelivery && (
          <p className="text-muted-foreground text-sm">
            Estimated delivery: {estimatedDelivery}
          </p>
        )}
      </CardContent>

      <CardFooter className={variant === 'compact' ? 'pt-4' : undefined}>
        <Button
          className={cn(
            'w-full gap-2',
            enableAnimations && 'transition-all hover:gap-3'
          )}
          disabled={isCheckoutLoading || itemCount === 0}
          onClick={onCheckout}
          size={variant === 'compact' ? 'default' : 'lg'}
          variant="brand-primary"
        >
          {isCheckoutLoading ? (
            <>
              <span className="animate-pulse">Processing...</span>
            </>
          ) : (
            <>
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
