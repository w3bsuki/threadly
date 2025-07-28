'use client';

import { type CartItem, useCartStore } from '@repo/commerce';
import { useMobileTouch } from '@repo/design-system';
import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  seller: {
    firstName?: string;
    lastName?: string;
  };
  images: Array<{
    url: string;
  }>;
  condition: string;
  size?: string;
  color?: string;
  status: string;
}

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?:
    | 'default'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'mobile'
    | 'mobile-lg'
    | 'mobile-icon';
  showText?: boolean;
}

export function AddToCartButton({
  product,
  className,
  variant = 'default',
  size = 'default',
  showText = true,
}: AddToCartButtonProps): React.JSX.Element {
  const { addItem, isInCart, toggleCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { getMobileButtonSize, getTouchTargetClasses } = useMobileTouch();

  const inCart = isInCart(product.id);
  const sellerName =
    `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() ||
    'Unknown Seller';

  // Use mobile-safe size
  const buttonSize = getMobileButtonSize(size) as
    | 'default'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'mobile'
    | 'mobile-lg'
    | 'mobile-icon';

  const handleAddToCart = async () => {
    if (product.status !== 'AVAILABLE') return;

    setIsAdding(true);

    try {
      const cartItem: Omit<CartItem, 'id' | 'quantity'> = {
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.images[0]?.url || '/placeholder-image.jpg',
        sellerId: product.sellerId,
        sellerName,
        size: product.size,
        color: product.color,
        condition: product.condition,
        availableQuantity: 1, // Most fashion items are unique
      };

      addItem(cartItem);

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);

      // Open cart dropdown to show item was added
      toggleCart();
    } catch (error) {
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = product.status !== 'AVAILABLE' || isAdding;

  const getButtonText = () => {
    if (!showText) return null;

    if (justAdded) return 'Added!';
    if (isAdding) return 'Adding...';
    if (inCart) return 'In Cart';
    if (product.status === 'SOLD') return 'Sold';
    if (product.status === 'REMOVED') return 'Unavailable';
    return 'Add to Cart';
  };

  const getButtonIcon = () => {
    if (justAdded) return <Check className="h-4 w-4" />;
    return <ShoppingCart className="h-4 w-4" />;
  };

  return (
    <Button
      className={cn(getTouchTargetClasses(), className)}
      disabled={isDisabled}
      onClick={handleAddToCart}
      size={buttonSize}
      variant={inCart ? 'secondary' : variant}
    >
      {showText ? (
        <>
          {getButtonIcon()}
          {getButtonText() && <span className="ml-2">{getButtonText()}</span>}
        </>
      ) : (
        getButtonIcon()
      )}
    </Button>
  );
}
