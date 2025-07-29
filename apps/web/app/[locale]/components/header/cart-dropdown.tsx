'use client';

import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatCurrency } from '@/lib/utils/currency';
import { useTranslation } from '../providers/i18n-provider';

export const CartDropdown = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const dictionary = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration issues
    return (
      <Button
        className="relative text-gray-700 hover:text-black"
        size="sm"
        variant="ghost"
      >
        <ShoppingBag className="h-5 w-5" />
      </Button>
    );
  }

  const itemCount = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet onOpenChange={(open) => !open && closeCart()} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          className="relative text-gray-700 hover:text-black"
          onClick={() => useCartStore.getState().toggleCart()}
          size="sm"
          variant="ghost"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-xs">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>
              {dictionary.web?.global?.navigation?.cart || 'Shopping Cart'}{' '}
              <span aria-atomic="true" aria-live="polite">
                ({itemCount})
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>
        {/* Screen reader announcement for cart updates */}
        <div
          aria-atomic="true"
          aria-live="polite"
          className="sr-only"
          role="status"
        >
          {itemCount > 0
            ? `Shopping cart contains ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
            : 'Shopping cart is empty'}
        </div>

        <div className="mt-6 flex h-full flex-col">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                Your cart is empty
              </h3>
              <p className="mb-6 text-gray-500 text-sm">
                Add items to your cart to see them here
              </p>
              <Button asChild onClick={closeCart}>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div className="flex gap-4 border-b pb-4" key={item.id}>
                      {/* Product Image */}
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.imageUrl &&
                        !item.imageUrl.includes('placehold.co') &&
                        !item.imageUrl.includes('picsum.photos') ? (
                          <Image
                            alt={item.title}
                            className="object-cover"
                            fill
                            src={item.imageUrl}
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between font-medium text-base text-gray-900">
                          <h3 className="pr-2">
                            <Link
                              className="hover:underline"
                              href={`/product/${item.id}`}
                              onClick={closeCart}
                            >
                              {item.title}
                            </Link>
                          </h3>
                          <p className="ml-4">{formatCurrency(item.price)}</p>
                        </div>
                        <p className="mt-1 text-gray-500 text-sm">
                          {item.size && `Size: ${item.size} • `}
                          {item.condition}
                        </p>
                        {item.sellerName && (
                          <p className="text-gray-500 text-sm">
                            Seller: {item.sellerName}
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              aria-label="Decrease quantity"
                              className="rounded-md p-1 hover:bg-gray-100"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2rem] text-center text-gray-700">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              className="rounded-md p-1 hover:bg-gray-100"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            aria-label="Remove item"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeItem(item.productId)}
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
                <div className="mb-4 flex justify-between font-medium text-base text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatCurrency(totalPrice)}</p>
                </div>
                <p className="mb-4 text-gray-500 text-sm">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/checkout" onClick={closeCart}>
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    className="w-full"
                    onClick={closeCart}
                    variant="outline"
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
