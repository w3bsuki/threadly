'use client';

import type { Product, SimilarProduct } from '@repo/ui/commerce';
import { ProductDetailContainer } from '@repo/ui/commerce';
import type { Dictionary } from '@repo/content/internationalization';
import { useFavorites } from '../../../../../lib/hooks/use-favorites';
import { useCartStore } from '../../../../../lib/stores/cart-store';

interface ProductDetailProps {
  product: Product;
  similarProducts: SimilarProduct[];
  dictionary: Dictionary;
}

export function ProductDetail({
  product,
  similarProducts,
  dictionary,
}: ProductDetailProps) {
  const { addItem, isInCart } = useCartStore();
  const { toggleFavorite, checkFavorite, isFavorited, isPending } =
    useFavorites();

  return (
    <ProductDetailContainer
      addToCart={addItem}
      checkFavorite={checkFavorite}
      dictionary={dictionary}
      isFavorited={isFavorited}
      isInCart={isInCart(product.id)}
      isPending={isPending}
      product={product}
      similarProducts={similarProducts}
      toggleFavorite={toggleFavorite}
    />
  );
}
