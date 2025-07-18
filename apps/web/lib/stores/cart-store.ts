'use client';

// Export types and hook from commerce package
export { type CartItem, useCartStore } from '@repo/commerce';

// For backward compatibility, keep legacy interface as alias
import type { CartItem as UnifiedCartItem } from '@repo/commerce';

// Legacy interface mapping for existing code
export interface LegacyCartItem extends Omit<UnifiedCartItem, 'productId'> {
  id: string; // Legacy field name (mapped to productId)
}

// Migration helper for existing components
export const migrateCartItem = (
  legacyItem: LegacyCartItem
): UnifiedCartItem => ({
  ...legacyItem,
  productId: legacyItem.id,
  imageUrl: legacyItem.imageUrl || '',
});

export const migrateLegacyCartItem = (
  unifiedItem: UnifiedCartItem
): LegacyCartItem => ({
  ...unifiedItem,
  id: unifiedItem.productId,
});
