'use client';

import { ProductDetailContainer } from '@repo/commerce';
import { useFavorites } from '../../../../../lib/hooks/use-favorites';
import { useCartStore } from '../../../../../lib/stores/cart-store';
import type { Product, SimilarProduct } from '@repo/commerce';
import type { Dictionary } from '@repo/internationalization';

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
      product={product}
      similarProducts={similarProducts}
      dictionary={dictionary}
      isInCart={isInCart(product.id)}
      addToCart={addItem}
      checkFavorite={checkFavorite}
      toggleFavorite={toggleFavorite}
      isFavorited={isFavorited}
      isPending={isPending}
    />
  );
}