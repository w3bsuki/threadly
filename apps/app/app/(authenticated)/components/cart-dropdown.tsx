'use client';

import { useCartStore } from '@/lib/stores/cart-store';
import { Button } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CartDropdown() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    closeCart,
    removeItem,
    updateQuantity,
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.sellerName}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= (item.availableQuantity ?? 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="py-4 space-y-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full" onClick={closeCart}>
                    <Link href="/buying/cart">
                      View Cart
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={closeCart} asChild>
                    <Link href="/browse">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}