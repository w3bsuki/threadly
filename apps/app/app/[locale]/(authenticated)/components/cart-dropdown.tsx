'use client';

import { useCartStore } from '@repo/design-system/commerce';
import {
  Badge,
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartDropdown(): React.JSX.Element {
  const {
    items,
    isOpen,
    toggleCart,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet onOpenChange={toggleCart} open={isOpen}>
      <SheetTrigger asChild>
        <Button className="relative" size="icon" variant="ghost">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge
              className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center text-xs"
              variant="destructive"
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

        <div className="flex h-full flex-col">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  Your cart is empty
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 space-y-4 overflow-y-auto py-4">
                {items.map((item) => (
                  <div className="flex gap-3" key={item.id}>
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        alt={item.title}
                        className="rounded-[var(--radius-md)] object-cover"
                        fill
                        src={item.imageUrl}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-2 font-medium text-sm">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {item.sellerName}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            className="h-6 w-6"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            size="icon"
                            variant="outline"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs">
                            {item.quantity}
                          </span>
                          <Button
                            className="h-6 w-6"
                            disabled={
                              item.quantity >= (item.availableQuantity ?? 1)
                            }
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            size="icon"
                            variant="outline"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.productId)}
                            size="icon"
                            variant="ghost"
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
              <div className="space-y-4 py-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full" onClick={closeCart}>
                    <Link href="/buying/cart">View Cart</Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full"
                    onClick={closeCart}
                    variant="outline"
                  >
                    <Link href="/browse">Continue Shopping</Link>
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
