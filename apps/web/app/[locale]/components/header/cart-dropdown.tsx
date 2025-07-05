'use client';

import { useCartStore } from '@/lib/stores/cart-store';
import { Button } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';

export const CartDropdown = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration issues
    return (
      <Button variant="ghost" size="sm" className="relative text-gray-700 hover:text-black">
        <ShoppingBag className="h-5 w-5" />
      </Button>
    );
  }

  const itemCount = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-700 hover:text-black"
          onClick={() => useCartStore.getState().toggleCart()}
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart <span aria-live="polite" aria-atomic="true">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span></span>
          </SheetTitle>
        </SheetHeader>
        {/* Screen reader announcement for cart updates */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {itemCount > 0 ? `Shopping cart contains ${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : 'Shopping cart is empty'}
        </div>

        <div className="mt-6 h-full flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Add items to your cart to see them here
              </p>
              <Button onClick={closeCart} asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      {/* Product Image */}
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.imageUrl && !item.imageUrl.includes('placehold.co') && !item.imageUrl.includes('picsum.photos') ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="pr-2">
                            <Link
                              href={`/product/${item.id}`}
                              onClick={closeCart}
                              className="hover:underline"
                            >
                              {item.title}
                            </Link>
                          </h3>
                          <p className="ml-4">{formatCurrency(item.price)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.size && `Size: ${item.size} • `}
                          {item.condition}
                        </p>
                        {item.sellerName && (
                          <p className="text-sm text-gray-500">Seller: {item.sellerName}</p>
                        )}

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 rounded-md hover:bg-gray-100"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-gray-700 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 rounded-md hover:bg-gray-100"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t px-4 py-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>{formatCurrency(totalPrice)}</p>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/checkout" onClick={closeCart}>
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};