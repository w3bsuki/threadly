'use client';

import { useCartStore } from '../../../../../lib/stores/cart-store';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { LazyImage } from '@repo/design-system/components';
import { useState } from 'react';

interface CartContentProps {
  userId: string;
}

export function CartContent({ userId }: CartContentProps) {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();
  
  const [isLoading, setIsLoading] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice > 100 ? 0 : 9.99;
  const finalTotal = totalPrice + shippingFee;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/buying/checkout';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">
          Discover amazing fashion finds and add them to your cart
        </p>
        <Button asChild>
          <Link href="/browse">
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Cart Items ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 flex-shrink-0">
                  <LazyImage
                    src={item.imageUrl}
                    alt={item.title}
                    aspectRatio="square"
                    fill
                    className="object-cover rounded-md"
                    quality={75}
                    blur={true}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Sold by {item.sellerName}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.condition}
                        </Badge>
                        {item.size && (
                          <Badge variant="outline" className="text-xs">
                            Size {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="outline" className="text-xs">
                            {item.color}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Qty:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= (item.availableQuantity ?? 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              {totalPrice < 100 && (
                <div className="text-xs text-muted-foreground">
                  Add ${(100 - totalPrice).toFixed(2)} more for free shipping
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
            >
              Checkout - ${finalTotal.toFixed(2)}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Secure checkout with Stripe
            </div>

            <Separator />

            <Button variant="outline" className="w-full" asChild>
              <Link href="/browse">
                Continue Shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}