'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@repo/design-system/components';
import { formatCurrency } from '@repo/utils/currency';
import { Lock, Shield } from 'lucide-react';
import Image from 'next/image';
import type { CartItem, OrderCosts } from '../types';

interface OrderSummaryProps {
  items: CartItem[];
  costs: OrderCosts;
  isProcessing: boolean;
  onSubmit: () => void;
  isMobile?: boolean;
}

export function OrderSummary({
  items,
  costs,
  isProcessing,
  onSubmit,
  isMobile = false,
}: OrderSummaryProps) {
  // Mobile sticky bottom bar
  if (isMobile) {
    return (
      <div className="border-t bg-background shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="font-bold text-2xl">{formatCurrency(costs.total)}</p>
          </div>
          <Button
            className="h-14 px-8 font-semibold text-base"
            disabled={isProcessing}
            onClick={(e) => {
              e.preventDefault();
              // Add haptic feedback for mobile
              if ('vibrate' in navigator) {
                navigator.vibrate(10);
              }
              onSubmit();
            }}
          >
            {isProcessing ? (
              <>
                <Lock className="mr-2 h-5 w-5 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Place Order
              </>
            )}
          </Button>
        </div>
        <div className="px-4 pb-2 text-center">
          <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
            <Shield className="h-3 w-3" />
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="max-h-64 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <div className="flex gap-3" key={item.id}>
              {(item.image || item.imageUrl) && (
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    src={item.image || item.imageUrl || ''}
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="line-clamp-1 font-medium text-sm">{item.title}</p>
                {(item.size || item.color) && (
                  <p className="text-muted-foreground text-sm">
                    {[item.size, item.color].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium text-sm">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Cost Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(costs.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>
              {costs.shippingCost === 0
                ? 'FREE'
                : formatCurrency(costs.shippingCost)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatCurrency(costs.tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(costs.total)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="h-12 w-full"
          disabled={isProcessing}
          onClick={onSubmit}
          size="lg"
        >
          {isProcessing ? (
            <>
              <Lock className="mr-2 h-4 w-4 animate-pulse" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Complete Purchase
            </>
          )}
        </Button>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Shield className="h-4 w-4" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
}
