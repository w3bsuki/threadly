'use client';

import { useCartStore } from '@repo/commerce';
import {
  Button,
  CartEmpty,
  CartItem,
  CartSummary,
  Trash2,
} from '@repo/ui/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CartContentProps {
  userId: string;
}

export function CartContent({ userId }: CartContentProps): React.JSX.Element {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
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
    setIsLoading(true);
    router.push('/buying/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/browse');
  };

  if (items.length === 0) {
    return (
      <CartEmpty
        actionText="Continue Shopping"
        description="Discover amazing fashion finds and add them to your cart"
        enableAnimations={false}
        onAction={handleContinueShopping}
        title="Your cart is empty"
        variant="default"
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            Cart Items ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h2>
          <Button
            className="text-destructive hover:text-destructive"
            onClick={clearCart}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        {items.map((item) => (
          <CartItem
            color={item.color}
            condition={item.condition}
            enableAnimations={false}
            id={item.productId}
            imageAlt={item.title}
            imageUrl={item.imageUrl}
            key={item.id}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
            price={item.price}
            quantity={item.quantity}
            seller={item.sellerName}
            size={item.size}
            title={item.title}
            variant="default"
          />
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <CartSummary
          className="sticky top-4"
          enableAnimations={false}
          estimatedDelivery="3-5 business days"
          isCheckoutLoading={isLoading}
          itemCount={totalItems}
          onCheckout={handleCheckout}
          shipping={shippingFee}
          subtotal={totalPrice}
          total={finalTotal}
          variant="sidebar"
        />
      </div>
    </div>
  );
}
