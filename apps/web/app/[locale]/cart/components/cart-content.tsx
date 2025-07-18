'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  ConditionBadge,
  Separator,
} from '@repo/design-system/components';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartSync } from '../../../../lib/hooks/use-cart-sync';

export function CartContent() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartSync();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-6 md:py-8">
          <h1 className="mb-6 font-bold text-2xl md:mb-8 md:text-3xl">
            Shopping Cart
          </h1>
          <div className="py-16 text-center md:py-12">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 font-semibold text-xl">Your cart is empty</h2>
            <p className="mb-6 text-muted-foreground text-sm md:text-base">
              Start shopping to add items to your cart
            </p>
            <Button asChild className="w-full md:w-auto">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6 md:py-8">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <h1 className="font-bold text-2xl md:text-3xl">Shopping Cart</h1>
          <Button
            className="text-destructive text-sm hover:text-destructive md:text-base"
            onClick={clearCart}
            size="sm"
            variant="ghost"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-3 md:space-y-4">
              {items.map((item) => (
                <Card
                  className="border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                  key={item.id}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-3 md:gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted md:h-24 md:w-24">
                        {item.imageUrl ? (
                          <Image
                            alt={item.title}
                            className="object-cover"
                            fill
                            src={item.imageUrl}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 line-clamp-2 font-medium text-sm md:text-base">
                          {item.title}
                        </h3>
                        <p className="mb-2 text-muted-foreground text-xs md:text-sm">
                          Sold by {item.sellerName || 'Anonymous'}
                        </p>

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {item.size && (
                            <Badge
                              className="border-0 bg-muted text-muted-foreground text-xs"
                              variant="secondary"
                            >
                              Size {item.size}
                            </Badge>
                          )}
                          <ConditionBadge condition={item.condition as any} />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              className="touch-target h-8 w-8 border-border bg-background p-0 transition-colors hover:bg-muted"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              size="sm"
                              variant="outline"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              className="touch-target h-8 w-8 border-border bg-background p-0 transition-colors hover:bg-muted"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm md:text-base">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                            <Button
                              className="touch-target p-2 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeItem(item.productId)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-gray-100 bg-white shadow-sm">
              <CardContent className="p-4 md:p-6">
                <h3 className="mb-4 font-semibold text-lg">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Items ({itemCount}):</span>
                    <span className="font-medium">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>

                <Button
                  asChild
                  className="mt-6 h-12 w-full font-semibold text-base"
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button asChild className="mt-3 h-11 w-full" variant="outline">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
