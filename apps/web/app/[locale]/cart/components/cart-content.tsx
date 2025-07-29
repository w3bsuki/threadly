'use client';

import {
  Button,
  CartEmpty,
  CartItem,
  CartQuantitySelector,
  CartSummary,
} from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Package,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartSync } from '../../../../lib/hooks/use-cart-sync';

export function CartContent() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartSync();
  const router = useRouter();

  const totalPrice = getTotalPrice();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <CartEmpty
              className="mx-auto max-w-2xl"
              enableAnimations={true}
              onAction={handleContinueShopping}
              showSuggestions={true}
              variant="illustrated"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-bold text-2xl text-foreground sm:text-3xl">
                Shopping Cart
              </h1>
              <p className="mt-1 text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button
              className="w-full gap-2 sm:w-auto"
              onClick={clearCart}
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  key={item.productId}
                  layout
                  transition={{
                    layout: { duration: 0.3 },
                    opacity: { duration: 0.2 },
                    delay: index * 0.1,
                  }}
                >
                  <CartItem
                    condition={item.condition}
                    enableAnimations={true}
                    id={item.productId}
                    imageUrl={item.imageUrl || '/placeholder-image.jpg'}
                    onQuantityChange={(id, newQuantity) =>
                      updateQuantity(id, newQuantity)
                    }
                    onRemove={(id) => removeItem(id)}
                    price={item.price}
                    quantity={item.quantity}
                    seller={item.sellerName || 'Anonymous'}
                    size={item.size}
                    title={item.title}
                    variant="default"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.3 }}
          >
            <div className="sticky top-4 sm:top-8">
              <CartSummary
                enableAnimations={true}
                itemCount={itemCount}
                onCheckout={handleCheckout}
                shipping={shipping}
                subtotal={totalPrice}
                tax={tax}
                total={finalTotal}
                variant="sidebar"
              />
              <motion.div
                className="mt-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  asChild
                  className="w-full gap-2"
                  size="lg"
                  variant="outline"
                >
                  <Link href="/products">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </motion.div>
              <div className="mt-4 border-border border-t pt-4 sm:mt-6 sm:pt-6">
                <div className="space-y-1 text-muted-foreground text-xs">
                  <p>✓ Secure checkout with SSL encryption</p>
                  <p>✓ 30-day return policy</p>
                  <p>✓ Free shipping on orders over $100</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
