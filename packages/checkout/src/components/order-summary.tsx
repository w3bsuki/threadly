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
import { Shield, Lock } from 'lucide-react';
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
      <div className="bg-background border-t shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(costs.total)}</p>
          </div>
          <Button
            className="h-14 px-8 text-base font-semibold"
            onClick={(e) => {
              e.preventDefault();
              // Add haptic feedback for mobile
              if ('vibrate' in navigator) {
                navigator.vibrate(10);
              }
              onSubmit();
            }}
            disabled={isProcessing}
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
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {(item.image || item.imageUrl) && (
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Image
                    src={item.image || item.imageUrl || ''}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                {(item.size || item.color) && (
                  <p className="text-sm text-muted-foreground">
                    {[item.size, item.color].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
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
          className="w-full h-12"
          size="lg"
          onClick={onSubmit}
          disabled={isProcessing}
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
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
}