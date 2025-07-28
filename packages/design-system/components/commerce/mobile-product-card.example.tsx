'use client';

import * as React from 'react';
import {
  MobileProductCard,
  MobileProductCardSkeleton,
  MobileProductGrid,
} from './mobile-product-card';

// Example product data
const mockProducts = [
  {
    id: '1',
    title: 'Premium Cotton T-Shirt - Minimalist Design with Long Product Name',
    price: 29.99,
    originalPrice: 49.99,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    imageBlurDataUrl:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFB//EACYQAAIBAwMEAQUAAAAAAAAAAAECAwAEEQUSITFBUXEGExQiMmH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABcRAQEBAQAAAAAAAAAAAAAAAAECEQD/2gAMAwEAAhEDEQA/AMyqxNb2yW8jCeNJIw3ZT6ocUxLPJcRRtM5cqCAT6oYitLf/2Q==',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    savedSize: 'M',
    isWishlisted: false,
  },
  {
    id: '2',
    title: 'Vintage Denim Jacket',
    price: 89.99,
    originalPrice: 129.99,
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    isWishlisted: true,
  },
  {
    id: '3',
    title: 'Organic Linen Dress',
    price: 149.99,
    imageUrl:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    inStock: false,
    sizes: ['XS', 'S', 'M', 'L'],
    isWishlisted: false,
  },
  {
    id: '4',
    title: 'Sustainable Wool Sweater',
    price: 79.99,
    originalPrice: 99.99,
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    savedSize: 'L',
    isWishlisted: false,
  },
];

export function MobileProductCardExample() {
  const [products, setProducts] = React.useState(mockProducts);
  const [isLoading, setIsLoading] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<{ [key: string]: string }>(
    {}
  );

  const handleAddToCart = React.useCallback(
    (productId: string, size?: string) => {
      setCartItems((prev) => ({
        ...prev,
        [productId]: size || 'default',
      }));

      // Show toast or feedback
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    },
    []
  );

  const handleToggleWishlist = React.useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, isWishlisted: !product.isWishlisted }
          : product
      )
    );
  }, []);

  const handleQuickBuy = React.useCallback(
    (productId: string, size: string) => {
      // Quick buy logic - immediate checkout
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate([20, 50, 20]);
      }
    },
    []
  );

  const handleQuickPreview = React.useCallback((productId: string) => {
    // Open quick preview modal
  }, []);

  // Simulate loading state
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="font-semibold text-xl">Mobile Product Card Demo</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Try swiping left/right on cards for wishlist toggle
        </p>
      </div>

      {/* Cart Items Display */}
      {Object.keys(cartItems).length > 0 && (
        <div className="m-3 rounded-lg bg-green-100 p-3">
          <p className="font-medium text-green-800 text-sm">
            Cart: {Object.keys(cartItems).length} items
          </p>
          <div className="mt-1 text-green-600 text-xs">
            {Object.entries(cartItems).map(([id, size]) => (
              <div key={id}>
                Product {id} - Size: {size}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 p-3">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <MobileProductCardSkeleton key={i} />
            ))
          : // Actual products
            products.map((product) => (
              <MobileProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
                onQuickBuy={handleQuickBuy}
                onQuickPreview={handleQuickPreview}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
      </div>

      {/* Feature callouts */}
      <div className="mt-8 bg-white p-4">
        <h2 className="mb-3 font-semibold">Features:</h2>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li>✨ Swipe left/right to toggle wishlist</li>
          <li>📱 Long press on image for size selector</li>
          <li>⚡ Quick buy button for saved sizes</li>
          <li>🎯 36px+ touch targets for all actions</li>
          <li>📷 Lazy loaded images with blur placeholder</li>
          <li>💫 Haptic feedback on interactions</li>
          <li>🎨 Smooth animations and transitions</li>
          <li>♿ Fully accessible with keyboard support</li>
        </ul>
      </div>
    </div>
  );
}

// Alternative usage with custom styling
export function CustomStyledProductCard() {
  return (
    <MobileProductCard
      className="border-2 border-pink-200 shadow-pink-100"
      id="custom-1"
      imageUrl="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop"
      inStock={true}
      onAddToCart={(id) => {}}
      price={59.99}
      title="Custom Styled Product"
    />
  );
}

// Usage with MobileProductGrid helper
export function ProductGridExample() {
  return <MobileProductGrid products={mockProducts} />;
}
