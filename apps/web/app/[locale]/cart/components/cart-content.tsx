'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  CartItem,
  CartSummary,
  CartEmpty,
  CartQuantitySelector,
} from '@repo/design-system/components';
import { 
  ShoppingBag, 
  Trash2, 
  CreditCard, 
  ArrowLeft, 
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartSync } from '../../../../lib/hooks/use-cart-sync';
import { cn } from '@repo/design-system/lib/utils';
import { useRouter } from 'next/navigation';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <CartEmpty
              variant="illustrated"
              enableAnimations={true}
              onAction={handleContinueShopping}
              showSuggestions={true}
              className="max-w-2xl mx-auto"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shopping Cart</h1>
              <p className="text-muted-foreground mt-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button variant="outline" onClick={clearCart} className="gap-2 w-full sm:w-auto">
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{
                    layout: { duration: 0.3 },
                    opacity: { duration: 0.2 },
                    delay: index * 0.1,
                  }}
                >
                  <CartItem
                    id={item.productId}
                    title={item.title}
                    price={item.price}
                    quantity={item.quantity}
                    imageUrl={item.imageUrl || '/placeholder-image.jpg'}
                    size={item.size}
                    condition={item.condition}
                    seller={item.sellerName || 'Anonymous'}
                    onQuantityChange={(id, newQuantity) => updateQuantity(id, newQuantity)}
                    onRemove={(id) => removeItem(id)}
                    enableAnimations={true}
                    variant="default"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-4 sm:top-8">
              <CartSummary
                subtotal={totalPrice}
                shipping={shipping}
                tax={tax}
                total={finalTotal}
                itemCount={itemCount}
                onCheckout={handleCheckout}
                enableAnimations={true}
                variant="sidebar"
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-3">
                <Button asChild variant="outline" size="lg" className="w-full gap-2">
                  <Link href="/products">
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </motion.div>
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
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
