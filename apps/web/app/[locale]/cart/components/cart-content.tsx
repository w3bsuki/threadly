'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  CardContent,
  ConditionBadge,
  Separator,
} from '@repo/design-system/components';
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  Trash2, 
  X, 
  CreditCard, 
  ArrowLeft, 
  Package,
  ShoppingCart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartSync } from '../../../../lib/hooks/use-cart-sync';
import { cn } from '@repo/design-system/lib/utils';

function GridPatternCard({ 
  children, 
  className,
  patternClassName,
  gradientClassName
}: {
  children: React.ReactNode;
  className?: string;
  patternClassName?: string;
  gradientClassName?: string;
}) {
  return (
    <motion.div
      className={cn(
        "border w-full rounded-md overflow-hidden",
        "bg-background",
        "border-border",
        "p-3",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={cn(
        "size-full bg-repeat bg-[length:30px_30px]",
        "bg-grid-pattern-light dark:bg-grid-pattern",
        patternClassName
      )}>
        <div className={cn(
          "size-full bg-gradient-to-tr",
          "from-background/90 via-background/40 to-background/10",
          gradientClassName
        )}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function CartContent() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartSync();

  const totalPrice = getTotalPrice();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6"
      >
        <Package className="w-12 h-12 text-muted-foreground" />
      </motion.div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link href="/products">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </Button>
    </motion.div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GridPatternCard className="max-w-2xl mx-auto">
            <EmptyState />
          </GridPatternCard>
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
                  <GridPatternCard className="p-0">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-full sm:w-24 md:w-32 h-24 sm:h-24 md:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0 mx-auto sm:mx-0"
                        >
                          {item.imageUrl ? (
                            <Image
                              alt={item.title}
                              className="object-cover w-full h-full"
                              width={128}
                              height={128}
                              src={item.imageUrl}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                              No image
                            </div>
                          )}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Sold by {item.sellerName || 'Anonymous'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {item.size && (
                                  <Badge
                                    className="border-0 bg-muted text-muted-foreground text-xs"
                                    variant="secondary"
                                  >
                                    Size {item.size}
                                  </Badge>
                                )}
                                <ConditionBadge condition={item.condition as any} />
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeItem(item.productId)}
                              className="p-2 rounded-full hover:bg-muted transition-colors ml-2"
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </motion.button>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs sm:text-sm text-muted-foreground">Qty:</span>
                              <div className="flex items-center border border-border rounded-lg">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="p-2 hover:bg-muted transition-colors rounded-l-lg"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                                <span className="px-3 sm:px-4 py-2 text-sm font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="p-2 hover:bg-muted transition-colors rounded-r-lg"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="text-base sm:text-lg font-bold text-foreground">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {formatCurrency(item.price)} each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GridPatternCard>
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
              <GridPatternCard>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">Order Summary</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                      <span className="font-medium">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    {totalPrice < 100 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg"
                      >
                        Add {formatCurrency(100 - totalPrice)} more for free shipping!
                      </motion.div>
                    )}
                    <div className="border-t border-border pt-3 sm:pt-4">
                      <div className="flex justify-between text-base sm:text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button asChild size="lg" className="w-full gap-2 h-11 sm:h-12">
                        <Link href="/checkout">
                          <CreditCard className="w-4 h-4" />
                          Proceed to Checkout
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button asChild variant="outline" size="lg" className="w-full gap-2 h-10 sm:h-11">
                        <Link href="/products">
                          <ArrowLeft className="w-4 h-4" />
                          Continue Shopping
                        </Link>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>✓ Secure checkout with SSL encryption</p>
                      <p>✓ 30-day return policy</p>
                      <p>✓ Free shipping on orders over $100</p>
                    </div>
                  </div>
                </div>
              </GridPatternCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
