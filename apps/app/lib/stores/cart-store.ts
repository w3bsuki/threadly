// Export types and hook from commerce package
export { useCartStore, type CartItem, type CartState } from '@repo/commerce';

// For backward compatibility, re-export legacy interface
import type { CartItem as UnifiedCartItem } from '@repo/commerce';

// Migration helper for legacy code that expects 'image' instead of 'imageUrl'
export interface LegacyCartItem extends Omit<UnifiedCartItem, 'imageUrl'> {
  image: string; // Legacy field name (mapped to imageUrl)
  id: string; // Legacy internal ID field
}

// Migration helpers for existing components
export const migrateCartItem = (legacyItem: LegacyCartItem): UnifiedCartItem => ({
  ...legacyItem,
  imageUrl: legacyItem.image,
});

export const migrateLegacyCartItem = (unifiedItem: UnifiedCartItem): LegacyCartItem => ({
  ...unifiedItem,
  id: unifiedItem.id || `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  image: unifiedItem.imageUrl,
});