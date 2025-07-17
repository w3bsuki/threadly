"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartSync } from "../../../../lib/hooks/use-cart-sync";
import { Button } from '@repo/design-system/components';
import { Card, CardContent } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { ConditionBadge } from '@repo/design-system/components';
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";


export function CartContent() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartSync();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shopping Cart</h1>
          <div className="text-center py-16 md:py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
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
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-destructive hover:text-destructive text-sm md:text-base"
            size="sm"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-3 md:space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-3 md:gap-4">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-2 mb-1 text-sm md:text-base">
                          {item.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">
                          Sold by {item.sellerName || "Anonymous"}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {item.size && (
                            <Badge variant="secondary" className="text-xs bg-muted border-0 text-muted-foreground">
                              Size {item.size}
                            </Badge>
                          )}
                          <ConditionBadge condition={item.condition as any} />
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 touch-target bg-background border-border hover:bg-muted transition-colors"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 touch-target bg-background border-border hover:bg-muted transition-colors"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm md:text-base">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 touch-target p-2 transition-colors"
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
            <Card className="sticky top-6 bg-white border-gray-100 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 text-lg">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Items ({itemCount}):</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
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
                
                <Button className="w-full mt-6 h-12 text-base font-semibold" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                
                <Button variant="outline" className="w-full mt-3 h-11" asChild>
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