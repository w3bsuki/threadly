'use client';

import { useCartStore } from '@repo/commerce';
import { 
  Button, 
  CartItem, 
  CartSummary, 
  CartEmpty,
  Trash2 
} from '@repo/design-system/components';
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
    setIsLoading(true);
    router.push('/buying/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/browse');
  };

  if (items.length === 0) {
    return (
      <CartEmpty
        title="Your cart is empty"
        description="Discover amazing fashion finds and add them to your cart"
        actionText="Continue Shopping"
        onAction={handleContinueShopping}
        variant="default"
        enableAnimations={false}
      />
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
          <CartItem
            key={item.id}
            id={item.productId}
            title={item.title}
            price={item.price}
            quantity={item.quantity}
            imageUrl={item.imageUrl}
            imageAlt={item.title}
            size={item.size}
            color={item.color}
            condition={item.condition}
            seller={item.sellerName}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
            enableAnimations={false}
            variant="default"
          />
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <CartSummary
          subtotal={totalPrice}
          shipping={shippingFee}
          total={finalTotal}
          itemCount={totalItems}
          onCheckout={handleCheckout}
          isCheckoutLoading={isLoading}
          estimatedDelivery="3-5 business days"
          variant="sidebar"
          enableAnimations={false}
          className="sticky top-4"
        />
      </div>
    </div>
  );
}