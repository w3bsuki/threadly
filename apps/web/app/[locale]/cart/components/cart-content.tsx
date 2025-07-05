"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../../../../lib/stores/cart-store";
import { Button } from '@repo/design-system/components';
import { Card, CardContent } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

const conditionLabels = {
  NEW_WITH_TAGS: "New with tags",
  NEW_WITHOUT_TAGS: "New without tags",
  VERY_GOOD: "Very good",
  GOOD: "Good",
  SATISFACTORY: "Satisfactory",
};

export function CartContent() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Button asChild>
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
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
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
                        <h3 className="font-medium line-clamp-2 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Sold by {item.sellerName || "Anonymous"}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {item.size && (
                            <Badge variant="secondary" className="text-xs">
                              {item.size}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {conditionLabels[item.condition as keyof typeof conditionLabels]}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive hover:text-destructive"
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
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Items ({itemCount}):</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                
                <Button className="w-full mt-6" size="lg">
                  Proceed to Checkout
                </Button>
                
                <Button variant="outline" className="w-full mt-2" asChild>
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